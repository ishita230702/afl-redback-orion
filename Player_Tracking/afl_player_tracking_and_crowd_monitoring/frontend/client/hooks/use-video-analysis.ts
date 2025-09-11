import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { QueueItem } from "@/types/dashboard";
import { downloadText } from "@/lib/download";
import { convertBackendDataToText, convertBackendDataToHTML, generateDashboardPDF, generateDashboardInsights } from "@/lib/report";

export function useVideoAnalysis(setProcessingQueue: Dispatch<SetStateAction<QueueItem[]>>) {
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isVideoAnalyzing, setIsVideoAnalyzing] = useState(false);
  const [videoAnalysisProgress, setVideoAnalysisProgress] = useState(0);
  const [videoAnalysisComplete, setVideoAnalysisComplete] = useState(false);
  const [videoAnalysisError, setVideoAnalysisError] = useState<string | null>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("highlights");
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

  const handleVideoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime"];
      if (!validTypes.includes(file.type)) {
        setVideoAnalysisError("Please select a valid video file (MP4, MOV, or AVI)");
        return;
      }
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setVideoAnalysisError("File size must be less than 500MB");
        return;
      }
      setSelectedVideoFile(file);
      setVideoAnalysisError(null);
      setVideoAnalysisComplete(false);
    }
  };

  const handleFocusAreaChange = (area: string, checked: boolean) => {
    if (checked) {
      setSelectedFocusAreas((prev) => [...prev, area]);
    } else {
      setSelectedFocusAreas((prev) => prev.filter((a) => a !== area));
    }
  };

  const uploadAndAnalyzeVideo = async () => {
    if (!selectedVideoFile) {
      setVideoAnalysisError("Please select a video file first");
      return;
    }

    try {
      setVideoAnalysisError(null);
      setIsVideoUploading(true);
      setVideoUploadProgress(0);

      const newQueueItem: QueueItem = {
        id: `pq_${Date.now()}`,
        name: selectedVideoFile.name,
        analysisType:
          selectedAnalysisType === "highlights"
            ? "Highlight Generation"
            : selectedAnalysisType === "player"
            ? "Player Tracking"
            : selectedAnalysisType === "tactics"
            ? "Tactical Analysis"
            : selectedAnalysisType === "performance"
            ? "Performance Analysis"
            : "Crowd Analysis",
        status: "uploading",
        progress: 0,
        duration: `${Math.floor(Math.random() * 60 + 30)}:${Math.floor(Math.random() * 60)
          .toString()
          .padStart(2, "0")}`,
        size: `${(selectedVideoFile.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadTime: new Date().toISOString(),
        completedTime: null,
        estimatedCompletion: new Date(Date.now() + Math.random() * 600000 + 300000).toISOString(),
        priority: selectedFocusAreas.length > 2 ? "high" : Math.random() > 0.5 ? "medium" : "low",
        userId: "current_user",
        processingStage: "file_upload",
        errorCount: 0,
        retryCount: 0,
        isUIControlled: true,
      };

      setProcessingQueue((prev) => [newQueueItem, ...prev]);

      for (let i = 0; i <= 100; i += 5) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setVideoUploadProgress(i);
        setProcessingQueue((prev) => prev.map((item) => (item.id === newQueueItem.id ? { ...item, progress: i } : item)));
      }

      setIsVideoUploading(false);
      setIsVideoAnalyzing(true);
      setVideoAnalysisProgress(0);

      setProcessingQueue((prev) =>
        prev.map((item) =>
          item.id === newQueueItem.id
            ? { ...item, status: "analyzing", progress: 5, processingStage: "video_analysis" }
            : item,
        ),
      );

      for (let i = 0; i <= 100; i += 2) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        setVideoAnalysisProgress(i);
        setProcessingQueue((prev) => prev.map((item) => (item.id === newQueueItem.id ? { ...item, progress: Math.max(5, i) } : item)));
      }

      setIsVideoAnalyzing(false);
      setVideoAnalysisComplete(true);

      setProcessingQueue((prev) =>
        prev.map((item) =>
          item.id === newQueueItem.id
            ? {
                ...item,
                status: "completed",
                progress: 100,
                processingStage: "analysis_complete",
                completedTime: new Date().toISOString(),
                estimatedCompletion: null,
              }
            : item,
        ),
      );

      const analysisResults = {
        fileName: selectedVideoFile.name,
        analysisType: selectedAnalysisType,
        focusAreas: selectedFocusAreas,
        timestamp: new Date().toISOString(),
        fileSize: selectedVideoFile.size,
      };

      const existingAnalyses = JSON.parse(localStorage.getItem("videoAnalyses") || "[]");
      localStorage.setItem("videoAnalyses", JSON.stringify([...existingAnalyses, analysisResults]));
    } catch (error) {
      setIsVideoUploading(false);
      setIsVideoAnalyzing(false);
      setVideoAnalysisError(error instanceof Error ? error.message : "Upload failed");
      setProcessingQueue((prev) =>
        prev.map((item) =>
          item.name === selectedVideoFile?.name && item.status === "uploading"
            ? { ...item, status: "failed", processingStage: "upload_error", errorCount: 1 }
            : item,
        ),
      );
    }
  };

  const fetchBackendAnalysisData = async (analysisId: string) => {
    return {
      analysisId,
      timestamp: new Date().toISOString(),
      videoFile: {
        name: selectedVideoFile?.name || "sample_video.mp4",
        duration: "02:15:30",
        size: "1.8 GB",
        resolution: "1920x1080",
        framerate: "30fps",
      },
      analysisType: selectedAnalysisType,
      focusAreas: selectedFocusAreas,
      processingTime: Math.floor(Math.random() * 300 + 120),
      results: {
        playerPerformance: [
          {
            playerId: "p001",
            name: "Marcus Bontempelli",
            team: "Western Bulldogs",
            position: "Midfielder",
            statistics: {
              speed: { max: 32.4, average: 24.8, unit: "km/h" },
              distance: { total: 12.8, sprints: 2.3, unit: "km" },
              touches: { total: 28, effective: 24, efficiency: 85.7 },
              goals: 2,
              assists: 3,
              tackles: 6,
              marks: 8,
              disposals: 31,
              timeOnGround: 87.5,
            },
          },
          {
            playerId: "p002",
            name: "Patrick Cripps",
            team: "Carlton",
            position: "Midfielder",
            statistics: {
              speed: { max: 29.8, average: 22.1, unit: "km/h" },
              distance: { total: 13.2, sprints: 1.8, unit: "km" },
              touches: { total: 35, effective: 31, efficiency: 88.6 },
              goals: 1,
              assists: 5,
              tackles: 9,
              marks: 6,
              disposals: 34,
              timeOnGround: 92.3,
            },
          },
        ],
        crowdAnalysis: {
          totalAttendance: 47832,
          capacity: 50000,
          utilizationRate: 95.7,
          sections: [
            {
              sectionId: "north_stand",
              name: "Northern Stand",
              attendance: 14250,
              capacity: 15000,
              density: 95.0,
              noiseLevel: { peak: 95.2, average: 78.4, unit: "dB" },
            },
            {
              sectionId: "south_stand",
              name: "Southern Stand",
              attendance: 11680,
              capacity: 12000,
              density: 97.3,
              noiseLevel: { peak: 92.8, average: 76.9, unit: "dB" },
            },
          ],
        },
        highlights: [
          {
            timestamp: "00:03:45",
            duration: 15,
            type: "goal",
            description: "Opening goal with crowd eruption",
            players: ["Marcus Bontempelli"],
            confidence: 0.94,
          },
        ],
        metadata: {
          confidence: 0.923,
          processingVersion: "2.1.3",
          qualityScore: 8.7,
        },
      },
    };
  };




  const handleDownloadReport = async (format: "pdf" | "json" | "txt" = "txt") => {
    if (!videoAnalysisComplete || !selectedVideoFile) {
      alert("Please complete video analysis first");
      return;
    }
    try {
      const analysisId = `analysis_${Date.now()}`;
      const backendData = await fetchBackendAnalysisData(analysisId);
      if (format === "json") {
        const jsonContent = JSON.stringify(backendData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `AFL_Analysis_${analysisId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        const htmlContent = convertBackendDataToHTML(backendData);
        generateDashboardPDF(htmlContent);
      } else {
        const textContent = convertBackendDataToText(backendData);
        downloadText(textContent, `AFL_Analysis_${analysisId}`);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  };


  const handleDownloadVideoClips = () => {
    if (!videoAnalysisComplete) {
      alert("Please complete video analysis first");
      return;
    }
    const insights = generateDashboardInsights();
    const clipEvents = [
      { time: "00:03:45", event: "Opening Goal", player: insights.playerStats[0].name, speed: insights.playerStats[0].speed, crowd: "Explosive reaction" },
      { time: "00:18:23", event: "Spectacular Mark", player: insights.playerStats[1].name, speed: insights.playerStats[1].speed, crowd: "Standing ovation" },
      { time: "00:34:56", event: "Crucial Tackle", player: insights.playerStats[2].name, speed: insights.playerStats[2].speed, crowd: "Defensive roar" },
      { time: "00:52:12", event: "Assist Play", player: insights.playerStats[3].name, speed: insights.playerStats[3].speed, crowd: "Building excitement" },
      { time: "01:08:34", event: "Match Winner", player: insights.playerStats[4].name, speed: insights.playerStats[4].speed, crowd: "Stadium eruption" },
      { time: "01:15:45", event: "Final Siren", player: "Multiple Players", speed: "N/A", crowd: "Celebration frenzy" },
    ];

    const clipsData = `AFL ANALYTICS VIDEO CLIPS EXPORT

Generated: ${new Date().toLocaleString()}
Source Video: ${selectedVideoFile?.name}
Analysis Type: ${
      selectedAnalysisType === "highlights"
        ? "Match Highlights"
        : selectedAnalysisType === "player"
        ? "Player Tracking"
        : selectedAnalysisType === "tactics"
        ? "Tactical Analysis"
        : selectedAnalysisType === "performance"
        ? "Performance Metrics"
        : "Crowd Reactions"
    }

==============================

EXTRACTED VIDEO CLIPS WITH INSIGHTS
===================================
${clipEvents
  .map(
    (clip, index) => `
Clip ${index + 1}: ${clip.event}
  • Timestamp: ${clip.time}
  • Featured Player: ${clip.player}
  • Player Speed: ${clip.speed} km/h
  • Duration: ${Math.floor(Math.random() * 25 + 10)}s
  • Crowd Reaction: ${clip.crowd}
  • Stands Most Active: ${insights.crowdDensity[Math.floor(Math.random() * insights.crowdDensity.length)].section}
  • Noise Level: ${(85 + Math.random() * 15).toFixed(1)} dB
`,
  )
  .join("")}

CLIP ANALYSIS SUMMARY
====================
• Total clips identified: ${clipEvents.length}
• Total duration: ${clipEvents.reduce((sum, _, index) => sum + Math.floor(Math.random() * 25 + 10), 0)} seconds
• Average crowd noise: ${(80 + Math.random() * 20).toFixed(1)} dB
• Most active stand: ${
      insights.crowdDensity.reduce((max, section) => (parseFloat(section.density) > parseFloat(max.density) ? section : max)).section
    }
• Player tracking accuracy: 97.2%

CROWD RESPONSE CORRELATION
==========================
${clipEvents
  .map(
    (clip) => `
${clip.event} (${clip.time}):
  Crowd Response Intensity: ${(7 + Math.random() * 3).toFixed(1)}/10
  Stands Reacting: ${Math.floor(Math.random() * 3 + 3)} of ${insights.crowdDensity.length}
  Duration of Reaction: ${Math.floor(Math.random() * 15 + 5)}s
`,
  )
  .join("")}

EXPORT DETAILS
==============
• Export Format: Metadata Analysis (TXT)
• Processing Time: ${Math.floor(Math.random() * 3 + 1)} minutes
• Clips Ready for Download: ${clipEvents.length}
• Analysis Confidence: 94.8%

NOTE: In a production environment, this would package actual video clip files.
Currently providing comprehensive metadata and analysis for demonstration.

Generated by AFL Analytics Platform - Advanced Video Intelligence
Export ID: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}
`;

    downloadText(clipsData, `AFL_Video_Clips_${Date.now()}`);
  };

  return {
    selectedVideoFile,
    isVideoUploading,
    videoUploadProgress,
    isVideoAnalyzing,
    videoAnalysisProgress,
    videoAnalysisComplete,
    videoAnalysisError,
    selectedAnalysisType,
    setSelectedAnalysisType,
    selectedFocusAreas,
    handleVideoFileSelect,
    handleFocusAreaChange,
    uploadAndAnalyzeVideo,
    handleDownloadReport,
    handleDownloadVideoClips,
  } as const;
}
