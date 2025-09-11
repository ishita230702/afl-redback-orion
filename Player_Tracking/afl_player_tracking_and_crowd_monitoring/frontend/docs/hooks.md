# Hooks API

useProcessingQueue (client/hooks/use-processing-queue.ts)
- Returns
  - processingQueue: QueueItem[]
  - setProcessingQueue: React.Dispatch<SetStateAction<QueueItem[]>>
  - retryProcessing(itemId: string)
  - removeFromQueue(itemId: string)
- Behavior
  - retryProcessing resets an item to queued with progress 0 and bumps retryCount
  - removeFromQueue deletes the item by id

useVideoAnalysis (client/hooks/use-video-analysis.ts)
- Signature: useVideoAnalysis(setProcessingQueue)
- Returns
  - selectedVideoFile | isVideoUploading | videoUploadProgress
  - isVideoAnalyzing | videoAnalysisProgress | videoAnalysisComplete | videoAnalysisError
  - selectedAnalysisType, setSelectedAnalysisType
  - selectedFocusAreas
  - handleVideoFileSelect(event)
  - handleFocusAreaChange(area, checked)
  - uploadAndAnalyzeVideo()
  - handleDownloadReport(format: 'pdf'|'json'|'txt')
  - handleDownloadVideoClips()
- Notes
  - Must be called after useProcessingQueue in a component so setProcessingQueue exists
  - Creates and updates a QueueItem for the selected video
  - Exports report via report.ts utilities

Example usage (inside AFLDashboard)
- const { processingQueue, setProcessingQueue } = useProcessingQueue()
- const video = useVideoAnalysis(setProcessingQueue)
