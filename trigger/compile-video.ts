import { logger, metadata, task } from "@trigger.dev/sdk/v3";
import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  getVideoClips,
  getVideoProjectById,
  updateVideoProject,
} from "@/lib/db/queries";
import { getVideoPath, uploadVideo } from "@/lib/supabase";

export interface CompileVideoPayload {
  videoProjectId: string;
}

export interface CompileVideoStatus {
  step:
    | "fetching"
    | "downloading"
    | "compiling"
    | "uploading"
    | "completed"
    | "failed";
  label: string;
  progress?: number;
}

export const compileVideoTask = task({
  id: "compile-video",
  maxDuration: 600, // 10 minutes for FFmpeg compilation
  machine: "medium-1x", // More CPU for FFmpeg
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 60_000,
    factor: 2,
  },
  run: async (payload: CompileVideoPayload) => {
    const { videoProjectId } = payload;
    const workDir = join(tmpdir(), `video-compile-${videoProjectId}`);

    try {
      // Step 1: Fetch video project and clips
      metadata.set("status", {
        step: "fetching",
        label: "Loading video data…",
        progress: 5,
      } satisfies CompileVideoStatus);

      logger.info("Fetching video project", { videoProjectId });

      const projectData = await getVideoProjectById(videoProjectId);
      if (!projectData) {
        throw new Error(`Video project not found: ${videoProjectId}`);
      }

      const { videoProject, musicTrack } = projectData;
      const clips = await getVideoClips(videoProjectId);

      // Filter to only completed clips and sort by sequence order
      const completedClips = clips
        .filter((c) => c.status === "completed" && c.clipUrl)
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

      if (completedClips.length === 0) {
        throw new Error("No completed clips to compile");
      }

      logger.info("Found clips to compile", {
        total: clips.length,
        completed: completedClips.length,
      });

      // Create work directory
      if (existsSync(workDir)) {
        rmSync(workDir, { recursive: true });
      }
      mkdirSync(workDir, { recursive: true });

      // Step 2: Download all clips
      metadata.set("status", {
        step: "downloading",
        label: `Downloading ${completedClips.length} clips…`,
        progress: 10,
      } satisfies CompileVideoStatus);

      const clipPaths: string[] = [];
      let totalItems = completedClips.length;

      // Count transitions that need to be downloaded
      for (let i = 0; i < completedClips.length - 1; i++) {
        if (
          completedClips[i].transitionType === "seamless" &&
          completedClips[i].transitionClipUrl
        ) {
          totalItems++;
        }
      }

      let itemIndex = 0;
      for (let i = 0; i < completedClips.length; i++) {
        const clip = completedClips[i];

        // Download main clip
        const clipPath = join(
          workDir,
          `clip_${String(itemIndex).padStart(3, "0")}.mp4`
        );

        logger.info(`Downloading clip ${i + 1}/${completedClips.length}`, {
          clipId: clip.id,
          clipUrl: clip.clipUrl,
        });

        const response = await fetch(clip.clipUrl!);
        if (!response.ok) {
          throw new Error(
            `Failed to download clip ${clip.id}: ${response.status}`
          );
        }

        const buffer = await response.arrayBuffer();
        writeFileSync(clipPath, Buffer.from(buffer));
        clipPaths.push(clipPath);
        itemIndex++;

        // Download transition clip if seamless transition is enabled
        if (
          i < completedClips.length - 1 &&
          clip.transitionType === "seamless" &&
          clip.transitionClipUrl
        ) {
          const transitionPath = join(
            workDir,
            `transition_${String(itemIndex).padStart(3, "0")}.mp4`
          );

          logger.info(`Downloading transition ${itemIndex}/${totalItems}`, {
            clipId: clip.id,
            transitionClipUrl: clip.transitionClipUrl,
          });

          const transitionResponse = await fetch(clip.transitionClipUrl);
          if (transitionResponse.ok) {
            const transitionBuffer = await transitionResponse.arrayBuffer();
            writeFileSync(transitionPath, Buffer.from(transitionBuffer));
            clipPaths.push(transitionPath);
            itemIndex++;
          } else {
            logger.warn(
              `Failed to download transition for clip ${clip.id}, continuing without it`,
              {
                status: transitionResponse.status,
              }
            );
            // Continue without transition - fall back to cut
          }
        }

        metadata.set("status", {
          step: "downloading",
          label: `Downloaded ${itemIndex}/${totalItems} items`,
          progress: 10 + Math.round((itemIndex / totalItems) * 30),
        } satisfies CompileVideoStatus);
      }

      // Download music track if selected
      let musicPath: string | null = null;
      if (musicTrack?.audioUrl) {
        logger.info("Downloading music track", { musicTrackId: musicTrack.id });
        const musicResponse = await fetch(musicTrack.audioUrl);
        if (musicResponse.ok) {
          const musicBuffer = await musicResponse.arrayBuffer();
          musicPath = join(workDir, "music.mp3");
          writeFileSync(musicPath, Buffer.from(musicBuffer));
        }
      }

      // Step 3: Compile video with FFmpeg
      metadata.set("status", {
        step: "compiling",
        label: "Compiling video…",
        progress: 45,
      } satisfies CompileVideoStatus);

      const outputPath = join(workDir, "output.mp4");
      const concatListPath = join(workDir, "concat.txt");

      // Create concat file for FFmpeg
      const concatContent = clipPaths.map((p) => `file '${p}'`).join("\n");
      writeFileSync(concatListPath, concatContent);

      logger.info("Running FFmpeg compilation", {
        clipCount: clipPaths.length,
        hasMusic: !!musicPath,
      });

      // Build FFmpeg command
      let ffmpegCmd: string;

      if (musicPath) {
        // With music: concatenate clips and add audio
        const musicVolume = (videoProject.musicVolume ?? 50) / 100;
        ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatListPath}" -i "${musicPath}" -filter_complex "[1:a]volume=${musicVolume}[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=2[aout]" -map 0:v -map "[aout]" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -shortest -y "${outputPath}"`;
      } else {
        // Without music: just concatenate clips
        ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k -y "${outputPath}"`;
      }

      try {
        execSync(ffmpegCmd, {
          cwd: workDir,
          stdio: "pipe",
          timeout: 300_000, // 5 minute timeout for FFmpeg
        });
      } catch (ffmpegError) {
        logger.error("FFmpeg compilation failed", {
          error:
            ffmpegError instanceof Error
              ? ffmpegError.message
              : "Unknown error",
        });
        throw new Error("Video compilation failed - FFmpeg error");
      }

      if (!existsSync(outputPath)) {
        throw new Error("FFmpeg did not produce output file");
      }

      // Step 4: Upload compiled video
      metadata.set("status", {
        step: "uploading",
        label: "Uploading final video…",
        progress: 80,
      } satisfies CompileVideoStatus);

      const outputBuffer = readFileSync(outputPath);
      const finalVideoPath = getVideoPath(
        videoProject.workspaceId,
        videoProjectId,
        "final.mp4"
      );

      const finalVideoUrl = await uploadVideo(
        new Uint8Array(outputBuffer),
        finalVideoPath,
        "video/mp4"
      );

      // Calculate total duration (including transitions)
      let totalDuration = completedClips.reduce(
        (sum, clip) => sum + (clip.durationSeconds ?? 5),
        0
      );
      // Add 5 seconds for each seamless transition (Kling minimum duration)
      for (let i = 0; i < completedClips.length - 1; i++) {
        if (
          completedClips[i].transitionType === "seamless" &&
          completedClips[i].transitionClipUrl
        ) {
          totalDuration += 5; // Transition clips are 5 seconds (Kling minimum)
        }
      }

      // Update video project
      await updateVideoProject(videoProjectId, {
        status: "completed",
        finalVideoUrl,
        durationSeconds: totalDuration,
        thumbnailUrl: completedClips[0]?.sourceImageUrl, // Use first clip's source as thumbnail
      });

      // Cleanup work directory
      rmSync(workDir, { recursive: true });

      metadata.set("status", {
        step: "completed",
        label: "Complete",
        progress: 100,
      } satisfies CompileVideoStatus);

      logger.info("Video compilation completed", {
        videoProjectId,
        finalVideoUrl,
        totalDuration,
      });

      return {
        success: true,
        finalVideoUrl,
        durationSeconds: totalDuration,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      logger.error("Video compilation failed", {
        videoProjectId,
        error: errorMessage,
      });

      metadata.set("status", {
        step: "failed",
        label: `Compilation failed: ${errorMessage}`,
        progress: 0,
      } satisfies CompileVideoStatus);

      // Update project status in DB (defensive check)
      try {
        await updateVideoProject(videoProjectId, {
          status: "failed",
          errorMessage,
        });
      } catch (dbError) {
        logger.error("Failed to update project status in database", {
          videoProjectId,
          error:
            dbError instanceof Error ? dbError.message : "Unknown DB error",
        });
      }

      // Cleanup work directory
      if (existsSync(workDir)) {
        rmSync(workDir, { recursive: true });
      }

      throw error;
    }
  },
});
