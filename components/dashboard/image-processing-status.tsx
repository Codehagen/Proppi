"use client";

import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import type { inpaintImageTask } from "@/trigger/inpaint-image";
import type { processImageTask } from "@/trigger/process-image";

interface ProcessImageStatus {
  step: string;
  label: string;
  progress?: number;
}

interface ImageProcessingStatusProps {
  runId: string;
  accessToken: string;
  onComplete?: () => void;
  taskType?: "process" | "inpaint";
}

export function ImageProcessingStatus({
  runId,
  accessToken,
  onComplete,
  taskType = "process",
}: ImageProcessingStatusProps) {
  const router = useRouter();

  const handleComplete = useCallback(() => {
    // Refresh the page data
    router.refresh();
    onComplete?.();
  }, [router, onComplete]);

  const { run, error } = useRealtimeRun<
    typeof processImageTask | typeof inpaintImageTask
  >(runId, {
    accessToken,
    onComplete: handleComplete,
  });

  // Extract status from metadata
  const status = run?.metadata?.status as ProcessImageStatus | undefined;

  if (error) {
    return <span className="text-red-500 text-xs">Error loading status</span>;
  }

  if (!run) {
    return (
      <span className="animate-pulse text-muted-foreground text-xs">
        Connecting\u2026
      </span>
    );
  }

  // Show different states based on run status
  if (run.status === "COMPLETED") {
    return <span className="text-green-500 text-xs">Complete</span>;
  }

  if (
    run.status === "FAILED" ||
    run.status === "CRASHED" ||
    run.status === "SYSTEM_FAILURE"
  ) {
    return <span className="text-red-500 text-xs">Failed</span>;
  }

  // Show the label from metadata, or a default based on run status
  const label = status?.label || getDefaultLabel(run.status);

  return <span className="text-muted-foreground text-xs">{label}</span>;
}

function getDefaultLabel(status: string): string {
  switch (status) {
    case "PENDING":
    case "QUEUED":
      return "Queued\u2026";
    case "EXECUTING":
    case "WAITING":
      return "Processing\u2026";
    case "DELAYED":
      return "Scheduled\u2026";
    default:
      return "Processing\u2026";
  }
}

// Hook for subscribing to multiple runs
export function useProcessingRuns(
  runIds: string[],
  accessToken: string | null,
  onComplete?: () => void
) {
  const router = useRouter();

  // We'll track completion in an effect
  useEffect(() => {
    if (!accessToken || runIds.length === 0) return;

    // When all runs are done, refresh
    const checkInterval = setInterval(() => {
      router.refresh();
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [runIds, accessToken, router]);

  return { runIds, accessToken };
}

// Component for showing status in the image card overlay
export function ImageCardStatus({
  runId,
  accessToken,
  fallbackLabel = "Processing\u2026",
}: {
  runId?: string;
  accessToken?: string | null;
  fallbackLabel?: string;
}) {
  if (!(runId && accessToken)) {
    return <span className="text-white/90 text-xs">{fallbackLabel}</span>;
  }

  return <ImageProcessingStatus accessToken={accessToken} runId={runId} />;
}
