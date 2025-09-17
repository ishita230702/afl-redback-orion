import { useState, useMemo } from "react";
import { mockPlayers } from "@/lib/mock-data";
import { uploadVideo, runPlayerInference, runCrowdInference } from "@/lib/video";

// ---------------------------
// Types
// ---------------------------
export interface Player {
  id: number;
  name: string;
  team: string;
  position: string;
  kicks: number;
  handballs: number;
  marks: number;
  tackles: number;
  goals: number;
  efficiency: number;
  rating?: number;
}

export interface CompletedAnalysis {
  id: string;
  original_filename: string;
  created_at: string;
  status: string;
  services: {
    player: boolean;
    crowd: boolean;
  };
}

export interface TeamStats {
  goals: number;
  behinds: number;
  disposals: number;
  marks: number;
  tackles: number;
  clearances: number;
  inside50: number;
  efficiency: number;
}

export interface TeamComparison {
  a: TeamStats;
  b: TeamStats;
  aEff: number;
  bEff: number;
}

export function useDashboardState() {
  // ---------------------------
  // Player-related state
  // ---------------------------
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(
    mockPlayers[0] || {
      id: 0,
      name: "No Player",
      team: "Unknown",
      position: "Unknown",
      kicks: 0,
      handballs: 0,
      marks: 0,
      tackles: 0,
      goals: 0,
      efficiency: 0,
      rating: 0,
    }
  );

  const [comparisonPlayer, setComparisonPlayer] = useState<Player>(
    mockPlayers[1] || mockPlayers[0] || {
      id: 0,
      name: "No Player",
      team: "Unknown",
      position: "Unknown",
      kicks: 0,
      handballs: 0,
      marks: 0,
      tackles: 0,
      goals: 0,
      efficiency: 0,
      rating: 0,
    }
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");

  // ---------------------------
  // UI + Auth
  // ---------------------------
  const [isLive, setIsLive] = useState(true);
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || "Guest"
  );

  // ---------------------------
  // Video upload + analysis
  // ---------------------------
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [isVideoAnalyzing, setIsVideoAnalyzing] = useState(false);
  const [videoAnalysisError, setVideoAnalysisError] = useState<string | null>(
    null
  );

  // Completed analyses
  const [completedAnalyses, setCompletedAnalyses] = useState<
    CompletedAnalysis[]
  >([]);

  // ---------------------------
  // Team comparison state
  // ---------------------------
  const [teamA, setTeamA] = useState("Western Bulldogs");
  const [teamB, setTeamB] = useState("Richmond");

  const teamCompare = useMemo<TeamComparison>(() => {
    const empty: TeamStats = {
      goals: 0,
      behinds: 0,
      disposals: 0,
      marks: 0,
      tackles: 0,
      clearances: 0,
      inside50: 0,
      efficiency: 0,
    };

    // For now, just return dummy comparison (extend later)
    return { a: empty, b: empty, aEff: 0, bEff: 0 };
  }, [teamA, teamB]);

  // ---------------------------
  // Upload + Analyze handler
  // ---------------------------
  const handleAnalyze = async (
    file: File,
    runPlayer: boolean,
    runCrowd: boolean
  ) => {
    try {
      setIsVideoUploading(true);
      setVideoUploadProgress(0);
      setVideoAnalysisError(null);

      // 1. Upload
      const res = await uploadVideo(file);
      console.log("✅ Upload success:", res);

      setIsVideoUploading(false);
      setVideoUploadProgress(100);

      // 2. Run selected analyses
      setIsVideoAnalyzing(true);
      if (runPlayer && runCrowd) {
        await Promise.all([runPlayerInference(res.id), runCrowdInference(res.id)]);
      } else if (runPlayer) {
        await runPlayerInference(res.id);
      } else if (runCrowd) {
        await runCrowdInference(res.id);
      }
      setIsVideoAnalyzing(false);

      // 3. Save to completed list with service info
      setCompletedAnalyses((prev) => [
        ...prev,
        {
          id: res.id,
          original_filename: res.original_filename,
          created_at: res.created_at,
          status: "Completed",
          services: {
            player: runPlayer,
            crowd: runCrowd,
          },
        },
      ]);
    } catch (err: any) {
      console.error("❌ Analyze failed:", err.message || err);
      setVideoAnalysisError(err.message || "Analysis failed");
      setIsVideoUploading(false);
      setIsVideoAnalyzing(false);
    }
  };

  // ---------------------------
  // Available Teams
  // ---------------------------
  const availableTeams = useMemo(() => {
    return Array.from(new Set(mockPlayers.map((p) => p.team)));
  }, []);

  return {
    // Upload & analysis
    selectedVideoFile,
    setSelectedVideoFile,
    isVideoUploading,
    videoUploadProgress,
    isVideoAnalyzing,
    videoAnalysisError,
    completedAnalyses,
    setCompletedAnalyses,
    handleAnalyze,

    // Player state
    selectedPlayer,
    setSelectedPlayer,
    comparisonPlayer,
    setComparisonPlayer,
    searchTerm,
    setSearchTerm,
    selectedTeam,
    setSelectedTeam,

    // UI
    isLive,
    setIsLive,
    userEmail,
    setUserEmail,

    // Teams
    teamA,
    setTeamA,
    teamB,
    setTeamB,
    teamCompare,
    availableTeams,
  };
}
