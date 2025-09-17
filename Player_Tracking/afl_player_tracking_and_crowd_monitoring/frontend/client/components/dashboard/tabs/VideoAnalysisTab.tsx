import React, { useState } from "react";
import { deleteUpload } from "@/lib/video"; // ✅ API call

interface CompletedAnalysis {
  id: string;
  original_filename: string;
  created_at: string;
  status: string; // "Analyzing..." | "Completed" | "Failed"
}

interface VideoAnalysisTabProps {
  selectedVideoFile: File | null;
  videoAnalysisError: string | null;
  isVideoUploading: boolean;
  videoUploadProgress: number;
  isVideoAnalyzing: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: (file: File, runPlayer: boolean, runCrowd: boolean) => void;
  completedAnalyses: CompletedAnalysis[];
  setCompletedAnalyses: React.Dispatch<React.SetStateAction<CompletedAnalysis[]>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setSelectedUploadId: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function VideoAnalysisTab({
  selectedVideoFile,
  videoAnalysisError,
  isVideoUploading,
  videoUploadProgress,
  isVideoAnalyzing,
  onFileSelect,
  onAnalyze,
  completedAnalyses,
  setCompletedAnalyses,
  setActiveTab,
  setSelectedUploadId,
}: VideoAnalysisTabProps) {
  const [runPlayer, setRunPlayer] = useState(true);
  const [runCrowd, setRunCrowd] = useState(false);

  const isDisabled = !selectedVideoFile || isVideoUploading || isVideoAnalyzing;

  const getStatusColor = (status: string) => {
    if (status.includes("Analyzing")) return "text-amber-600";
    if (status.includes("Failed")) return "text-red-600";
    return "text-green-600";
  };

  const handleDelete = async (uploadId: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await deleteUpload(uploadId);
      setCompletedAnalyses((prev) => prev.filter((item) => item.id !== uploadId));
    } catch (err) {
      console.error("❌ Failed to delete upload:", err);
      alert("Failed to delete video.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* File input */}
      <div className="space-y-2">
        <input
          type="file"
          accept="video/*"
          onChange={onFileSelect}
          className="block w-full text-sm text-gray-700"
        />

        {/* ✅ Checklist for services */}
        <div className="flex flex-col space-y-2 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={runPlayer}
              onChange={(e) => setRunPlayer(e.target.checked)}
            />
            Run Player Tracking
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={runCrowd}
              onChange={(e) => setRunCrowd(e.target.checked)}
            />
            Run Crowd Analysis
          </label>
        </div>

        <button
          onClick={() =>
            selectedVideoFile && onAnalyze(selectedVideoFile, runPlayer, runCrowd)
          }
          disabled={isDisabled}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {isVideoUploading || isVideoAnalyzing ? "Analyzing..." : "Analyze"}
        </button>

        {isVideoUploading && (
          <p className="text-sm text-gray-500">
            Uploading... {videoUploadProgress}%
          </p>
        )}
        {videoAnalysisError && (
          <p className="text-sm text-red-500">{videoAnalysisError}</p>
        )}
      </div>

      {/* ✅ Analysis Completed Section (disabled while analyzing) */}
      <div
        className={`transition-opacity space-y-2 ${
          isVideoAnalyzing ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <h3 className="text-lg font-semibold">Analysis Completed</h3>

        {/* 🔹 Banner shown only while analyzing */}
        {isVideoAnalyzing && (
          <div className="p-3 bg-yellow-100 text-yellow-800 text-sm rounded border border-yellow-300">
            ⏳ Analysis is in progress… Please wait until it finishes before accessing results.
          </div>
        )}

        {completedAnalyses.length === 0 ? (
          <p className="text-sm text-gray-500">No analyses yet.</p>
        ) : (
          <div className="space-y-2 mt-3">
            {completedAnalyses.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="truncate max-w-xs">
                  <span className="font-medium truncate block">
                    {video.original_filename}
                  </span>
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(video.created_at).toLocaleString()}
                  </p>
                  <p
                    className={`text-xs font-semibold ${getStatusColor(video.status)}`}
                  >
                    Status: {video.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedUploadId(video.id);
                      setActiveTab("performance");
                    }}
                    disabled={video.status !== "Completed"}
                    className="px-2 py-1 bg-green-500 text-white rounded disabled:bg-gray-300"
                  >
                    Player Performance
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUploadId(video.id);
                      setActiveTab("crowd");
                    }}
                    disabled={video.status !== "Completed"}
                    className="px-2 py-1 bg-purple-500 text-white rounded disabled:bg-gray-300"
                  >
                    Crowd Monitor
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
