import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VideoUploadPanel from "@/components/dashboard/VideoUploadPanel";
import AnalysisResultsPanel from "@/components/dashboard/AnalysisResultsPanel";
import ProcessingQueueList from "@/components/dashboard/ProcessingQueueList";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import type { QueueItem } from "@/types/dashboard";

export type VideoTabProps = {
  selectedVideoFile: File | null;
  videoAnalysisError: string | null;
  isVideoUploading: boolean;
  videoUploadProgress: number;
  isVideoAnalyzing: boolean;
  videoAnalysisProgress: number;
  videoAnalysisComplete: boolean;
  selectedAnalysisType: string;
  setSelectedAnalysisType: (v: string) => void;
  selectedFocusAreas: string[];
  handleFocusAreaChange: (area: string, checked: boolean) => void;
  handleVideoFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadAndAnalyzeVideo: () => Promise<void> | void;
  handleDownloadVideoClips: () => void;
  handleDownloadReport: (format?: "pdf" | "json" | "txt") => void;
  processingQueue: QueueItem[];
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  onView: (item: any) => void;
  onDownload: (item: any) => void;
};

export default function VideoTab(props: VideoTabProps) {
  const {
    selectedVideoFile,
    videoAnalysisError,
    isVideoUploading,
    videoUploadProgress,
    isVideoAnalyzing,
    videoAnalysisProgress,
    videoAnalysisComplete,
    selectedAnalysisType,
    setSelectedAnalysisType,
    selectedFocusAreas,
    handleFocusAreaChange,
    handleVideoFileSelect,
    uploadAndAnalyzeVideo,
    handleDownloadVideoClips,
    handleDownloadReport,
    processingQueue,
    onRetry,
    onRemove,
    onView,
    onDownload,
  } = props;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <VideoUploadPanel
        selectedVideoFile={selectedVideoFile}
        videoAnalysisError={videoAnalysisError}
        isVideoUploading={isVideoUploading}
        videoUploadProgress={videoUploadProgress}
        isVideoAnalyzing={isVideoAnalyzing}
        videoAnalysisProgress={videoAnalysisProgress}
        selectedAnalysisType={selectedAnalysisType}
        setSelectedAnalysisType={setSelectedAnalysisType}
        selectedFocusAreas={selectedFocusAreas}
        onFocusAreaChange={handleFocusAreaChange}
        onFileSelect={handleVideoFileSelect}
        onStart={uploadAndAnalyzeVideo}
        disabledStart={!selectedVideoFile || isVideoUploading || isVideoAnalyzing}
      />

      <AnalysisResultsPanel
        videoAnalysisComplete={videoAnalysisComplete}
        selectedAnalysisType={selectedAnalysisType}
        selectedVideoFileName={selectedVideoFile?.name}
        selectedFocusAreas={selectedFocusAreas}
        onDownloadVideoClips={handleDownloadVideoClips}
        onDownloadReport={handleDownloadReport}
      />

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Processing Queue
            <Badge variant="outline" className="ml-auto">{processingQueue.length} items</Badge>
          </CardTitle>
          <CardDescription>Track the status of your video analysis requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ProcessingQueueList
              items={processingQueue}
              onRetry={onRetry}
              onRemove={onRemove}
              onView={onView}
              onDownload={onDownload}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
