import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { QueueItem } from "@/types/dashboard";
import { downloadText } from "@/lib/download";

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

  const convertBackendDataToText = (data: any) => {
    return `AFL VIDEO ANALYSIS REPORT
Generated: ${new Date(data.timestamp).toLocaleString()}
Analysis ID: ${data.analysisId}

VIDEO INFORMATION
================
File: ${data.videoFile.name}
Duration: ${data.videoFile.duration}
Size: ${data.videoFile.size}
Resolution: ${data.videoFile.resolution}
Processing Time: ${data.processingTime} seconds

PLAYER PERFORMANCE
==================
${data.results.playerPerformance
  .map(
    (player: any) => `
${player.name} (${player.team} - ${player.position})
- Max Speed: ${player.statistics.speed.max} ${player.statistics.speed.unit}
- Average Speed: ${player.statistics.speed.average} ${player.statistics.speed.unit}
- Total Distance: ${player.statistics.distance.total} ${player.statistics.distance.unit}
- Goals: ${player.statistics.goals} | Assists: ${player.statistics.assists}
- Tackles: ${player.statistics.tackles} | Marks: ${player.statistics.marks}
- Disposals: ${player.statistics.disposals} | Efficiency: ${player.statistics.touches.efficiency}%
- Time on Ground: ${player.statistics.timeOnGround}%
`,
  )
  .join("\n")}

CROWD ANALYSIS
==============
Total Attendance: ${data.results.crowdAnalysis.totalAttendance.toLocaleString()}
Stadium Utilization: ${data.results.crowdAnalysis.utilizationRate}%

${data.results.crowdAnalysis.sections
  .map(
    (section: any) => `
${section.name}: ${section.attendance.toLocaleString()} / ${section.capacity.toLocaleString()} (${section.density}%)
Peak Noise: ${section.noiseLevel.peak} ${section.noiseLevel.unit}
`,
  )
  .join("")}

HIGHLIGHTS
==========
${data.results.highlights
  .map(
    (highlight: any) =>
      `${highlight.timestamp} - ${highlight.type.toUpperCase()}: ${highlight.description} (${Math.round(
        highlight.confidence * 100,
      )}% confidence)`,
  )
  .join("\n")}

TECHNICAL METADATA
==================
Overall Confidence: ${Math.round(data.results.metadata.confidence * 100)}%
Quality Score: ${data.results.metadata.qualityScore}/10
Processing Version: ${data.results.metadata.processingVersion}

Report generated by AFL Analytics Platform
`;
  };

  const convertBackendDataToHTML = (data: any) => {
    return `
      <div class="section">
        <h1>AFL Video Analysis Report</h1>
        <div class="metric">
          <strong>Generated:</strong> ${new Date(data.timestamp).toLocaleString()}<br>
          <strong>Analysis ID:</strong> ${data.analysisId}<br>
          <strong>Video File:</strong> ${data.videoFile.name}<br>
          <strong>Duration:</strong> ${data.videoFile.duration}<br>
          <strong>Processing Time:</strong> ${data.processingTime} seconds
        </div>
      </div>

      <div class="section">
        <h2>Player Performance Analysis</h2>
        <div class="player-grid">
          ${data.results.playerPerformance
            .map(
              (player: any) => `
            <div class="player-card">
              <h3 style="margin: 0 0 8px 0; color: #059669;">${player.name}</h3>
              <div class="player-team">${player.team} - ${player.position}</div>
              <div><strong>Max Speed:</strong> ${player.statistics.speed.max} ${player.statistics.speed.unit}</div>
              <div><strong>Distance:</strong> ${player.statistics.distance.total} ${player.statistics.distance.unit}</div>
              <div><strong>Goals:</strong> ${player.statistics.goals} | <strong>Assists:</strong> ${player.statistics.assists}</div>
              <div><strong>Efficiency:</strong> ${player.statistics.touches.efficiency}%</div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>

      <div class="section">
        <h2>Crowd Analysis</h2>
        <div class="metric">
          <strong>Total Attendance:</strong> ${data.results.crowdAnalysis.totalAttendance.toLocaleString()}<br>
          <strong>Utilization Rate:</strong> ${data.results.crowdAnalysis.utilizationRate}%
        </div>
        ${data.results.crowdAnalysis.sections
          .map(
            (section: any) => `
          <div class="crowd-item">
            <strong>${section.name}:</strong> ${section.attendance.toLocaleString()} / ${section.capacity.toLocaleString()} (${section.density}%)<br>
            Peak Noise: ${section.noiseLevel.peak} ${section.noiseLevel.unit}
          </div>
        `,
          )
          .join("")}
      </div>

      <div class="section">
        <h2>Technical Information</h2>
        <div class="metric">
          <strong>Analysis Confidence:</strong> ${Math.round(data.results.metadata.confidence * 100)}%<br>
          <strong>Quality Score:</strong> ${data.results.metadata.qualityScore}/10<br>
          <strong>Processing Version:</strong> ${data.results.metadata.processingVersion}
        </div>
      </div>
    `;
  };

  const generateDashboardPDF = (content: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to generate PDF reports");
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>AFL Analytics Dashboard Report</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { color: #059669; font-size: 28px; font-weight: bold; margin-bottom: 5px; }
            .subtitle { color: #666; font-size: 14px; }
            h1 { color: #059669; font-size: 24px; margin: 30px 0 15px 0; }
            h2 { color: #2563eb; font-size: 18px; margin: 25px 0 10px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
            .metric { background: #f0fdf4; padding: 10px; margin: 8px 0; border-left: 4px solid #059669; }
            .section { margin-bottom: 25px; }
            .player-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
            .player-card { background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; }
            .crowd-item { background: #ecfdf5; padding: 8px; margin: 4px 0; border-radius: 4px; }
            @media print { body { margin: 20px; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">AFL Analytics Dashboard</div>
            <div class="subtitle">Professional Sports Analytics Platform</div>
          </div>
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button onclick="window.print()" style="background: #059669; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">Generate PDF</button>
            <button onclick="window.close()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
          ${content}
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
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

  const generateDashboardInsights = () => {
    const players = [
      "Marcus Bontempelli",
      "Patrick Cripps",
      "Clayton Oliver",
      "Lachie Neale",
      "Dustin Martin",
      "Jeremy Cameron",
      "Tom Hawkins",
      "Charlie Curnow",
      "Jack Steele",
      "Andrew Brayshaw",
      "Christian Petracca",
      "Max Gawn",
    ];
    const stadiumSections = [
      "MCC Members",
      "AFL Members",
      "Southern Stand",
      "Olympic Stand",
      "Ponsford Stand",
      "Great Southern Stand",
      "Premium Seating",
      "General Admission",
    ];
    const playerStats = players.slice(0, 6).map((player) => ({
      name: player,
      speed: (25 + Math.random() * 10).toFixed(1),
      goals: Math.floor(Math.random() * 4),
      tackles: Math.floor(Math.random() * 12 + 3),
      assists: Math.floor(Math.random() * 6),
      disposals: Math.floor(Math.random() * 25 + 12),
      marks: Math.floor(Math.random() * 10 + 2),
      efficiency: (65 + Math.random() * 30).toFixed(1),
      timeOnGround: Math.floor(Math.random() * 25 + 70),
    }));
    const crowdDensity = stadiumSections.slice(0, 6).map((section) => ({
      section,
      capacity: Math.floor(Math.random() * 6000 + 2000),
      attendance: Math.floor(Math.random() * 5500 + 1800),
      density: (75 + Math.random() * 20).toFixed(1),
      avgMovement: (6 + Math.random() * 12).toFixed(1),
      noiseLevel: (65 + Math.random() * 25).toFixed(1),
      peakMoments: Math.floor(Math.random() * 6 + 2),
    }));
    return { playerStats, crowdDensity };
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
