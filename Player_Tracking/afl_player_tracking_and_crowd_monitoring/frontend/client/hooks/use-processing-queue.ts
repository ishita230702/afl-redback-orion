import { useState } from "react";
import type { QueueItem } from "@/types/dashboard";

export function useProcessingQueue() {
  const [processingQueue, setProcessingQueue] = useState<QueueItem[]>([]);

  const retryProcessing = (itemId: string) => {
    setProcessingQueue((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: "queued",
              progress: 0,
              processingStage: "queue_waiting",
              retryCount: item.retryCount + 1,
              estimatedCompletion: new Date(
                Date.now() + Math.random() * 3600000 + 1800000,
              ).toISOString(),
              isUIControlled: item.isUIControlled || false,
            }
          : item,
      ),
    );
  };

  const removeFromQueue = (itemId: string) => {
    setProcessingQueue((prev) => prev.filter((item) => item.id !== itemId));
  };

  return {
    processingQueue,
    setProcessingQueue,
    retryProcessing,
    removeFromQueue,
  };
}
