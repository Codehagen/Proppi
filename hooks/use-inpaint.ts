"use client";

import { useCallback, useState } from "react";
import { triggerInpaintTask } from "@/lib/actions";

type EditMode = "remove" | "add";

interface UseInpaintReturn {
  inpaint: (
    imageId: string,
    maskDataUrl: string,
    prompt: string,
    mode: EditMode,
    replaceNewerVersions?: boolean
  ) => Promise<{ success: boolean; runId?: string }>;
  isProcessing: boolean;
  error: string | null;
  runId: string | null;
  reset: () => void;
}

export function useInpaint(): UseInpaintReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setRunId(null);
  }, []);

  const inpaint = useCallback(
    async (
      imageId: string,
      maskDataUrl: string,
      prompt: string,
      mode: EditMode,
      replaceNewerVersions = false
    ): Promise<{ success: boolean; runId?: string }> => {
      if (!(imageId && prompt)) {
        setError("Missing required fields");
        return { success: false };
      }

      // Mask is required for remove mode, optional for add mode
      if (mode === "remove" && !maskDataUrl) {
        setError("Mask is required for remove mode");
        return { success: false };
      }

      setIsProcessing(true);
      setError(null);
      setRunId(null);

      try {
        const result = await triggerInpaintTask(
          imageId,
          prompt,
          mode,
          maskDataUrl,
          replaceNewerVersions
        );

        if (!result.success) {
          throw new Error(result.error || "Inpainting failed");
        }

        setRunId(result.data.runId);
        // Keep isProcessing true - the task is running in the background
        // The component should use the runId to track progress
        return { success: true, runId: result.data.runId };
      } catch (err) {
        console.error("Inpaint error:", err);
        setError(err instanceof Error ? err.message : "Inpainting failed");
        setIsProcessing(false);
        return { success: false };
      }
    },
    []
  );

  return {
    inpaint,
    isProcessing,
    error,
    runId,
    reset,
  };
}
