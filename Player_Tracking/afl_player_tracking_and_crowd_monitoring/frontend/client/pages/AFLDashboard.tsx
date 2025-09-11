import { useState, useEffect, useMemo } from "react";
import QueueStatusIcon from "@/components/dashboard/QueueStatusIcon";
import TeamCompareBar from "@/components/dashboard/TeamCompareBar";
import ProcessingQueueList from "@/components/dashboard/ProcessingQueueList";
import VideoUploadPanel from "@/components/dashboard/VideoUploadPanel";
import AnalysisResultsPanel from "@/components/dashboard/AnalysisResultsPanel";
import VideoTab from "@/components/dashboard/tabs/VideoTab";
// ReportsPanel removed; replaced with Downloads tab
import TeamMatchFilters from "@/components/dashboard/TeamMatchFilters";
import TeamMatchCompare from "@/components/dashboard/TeamMatchCompare";
import PlayerComparison from "@/components/dashboard/PlayerComparison";
import DownloadsPanel from "@/components/dashboard/DownloadsPanel";
import PlayerPerformanceTab from "@/components/dashboard/tabs/PlayerPerformanceTab";
import TeamTab from "@/components/dashboard/tabs/TeamTab";
import CrowdTab from "@/components/dashboard/tabs/CrowdTab";
import type { QueueItem } from "@/types/dashboard";
import { useProcessingQueue } from "@/hooks/use-processing-queue";
import { useVideoAnalysis } from "@/hooks/use-video-analysis";
import { useNavigate } from "react-router-dom";
import { mockPlayers, matchEvents, getStaticAFLCrowdZones, teamMatchesData, generateTimelineFromStadiumData } from "@/data/mock";
import { downloadText, downloadFile } from "@/lib/download";
import { formatTimeAgo, formatETA } from "@/lib/format";
import { convertBackendDataToText, convertBackendDataToHTML, generateDashboardPDF, buildPlayerPerformanceReportHTML, buildTeamPerformanceReportHTML, buildCrowdMonitorReportHTML } from "@/lib/report";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  Users,
  BarChart3,
  Download,
  Upload,
  Search,
  Filter,
  Play,
  Pause,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Video,
  Eye,
  Target,
  Zap,
  Calendar,
  FileText,
  LogOut,
  ChevronDown,
  Flag,
} from "lucide-react";

// Mock data moved to @/data/mock

// matchEvents moved to @/data/mock

// generateTimelineFromStadiumData moved to @/data/mock

// getStaticAFLCrowdZones moved to @/data/mock


export default function AFLDashboard() {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState(mockPlayers[0]);
  const [comparisonPlayer, setComparisonPlayer] = useState(mockPlayers[1]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [isLive, setIsLive] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  // Static crowd zones data
  const crowdZones = getStaticAFLCrowdZones();

  // Team Match Performance data for Team tab
  const teamMatches = teamMatchesData;

  const [teamSearch, setTeamSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [teamRound, setTeamRound] = useState("all");
  const teamRounds = useMemo(() => ["all", ...Array.from(new Set(teamMatches.map((m) => m.round)))], []);
  const teamTeams = useMemo(() => {
    const s = new Set<string>();
    teamMatches.forEach((m) => { s.add(m.teams.home); s.add(m.teams.away); });
    return ["all", ...Array.from(s).sort()];
  }, []);
  const teamFiltered = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    return teamMatches.filter((m) => {
      const matchesRound = teamRound === "all" || m.round === teamRound;
      const matchesTeam = teamFilter === "all" || m.teams.home === teamFilter || m.teams.away === teamFilter;
      const hay = `${m.teams.home} ${m.teams.away} ${m.venue}`.toLowerCase();
      return matchesRound && matchesTeam && (q === "" || hay.includes(q));
    });
  }, [teamMatches, teamRound, teamFilter, teamSearch]);
  const teamSummary = useMemo(() => {
    return teamFiltered.reduce(
      (acc, m) => {
        acc.games += 1;
        acc.goals += m.stats.home.goals + m.stats.away.goals;
        acc.disposals += m.stats.home.disposals + m.stats.away.disposals;
        acc.inside50 += m.stats.home.inside50 + m.stats.away.inside50;
        return acc;
      },
      { games: 0, goals: 0, disposals: 0, inside50: 0 },
    );
  }, [teamFiltered]);

  // Compare Teams helpers
  const [teamA, setTeamA] = useState<string>("all");
  const [teamB, setTeamB] = useState<string>("all");
  const calcTotals = (name: string) => {
    const base = { goals: 0, disposals: 0, marks: 0, tackles: 0, clearances: 0, inside50: 0, effSum: 0, effCount: 0 };
    if (!name || name === "all") return base;
    for (const m of teamMatches) {
      if (m.teams.home === name) {
        base.goals += m.stats.home.goals; base.disposals += m.stats.home.disposals; base.marks += m.stats.home.marks; base.tackles += m.stats.home.tackles; base.clearances += m.stats.home.clearances; base.inside50 += m.stats.home.inside50; base.effSum += m.stats.home.efficiency; base.effCount += 1;
      }
      if (m.teams.away === name) {
        base.goals += m.stats.away.goals; base.disposals += m.stats.away.disposals; base.marks += m.stats.away.marks; base.tackles += m.stats.away.tackles; base.clearances += m.stats.away.clearances; base.inside50 += m.stats.away.inside50; base.effSum += m.stats.away.efficiency; base.effCount += 1;
      }
    }
    return base;
  };
  const teamCompare = useMemo(() => {
    const a = calcTotals(teamA); const b = calcTotals(teamB);
    const aEff = a.effCount ? Math.round(a.effSum / a.effCount) : 0;
    const bEff = b.effCount ? Math.round(b.effSum / b.effCount) : 0;
    return { a, b, aEff, bEff };
  }, [teamA, teamB]);


  // Player card display state
  const [showAllCards, setShowAllCards] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);

  // Expanded card state
  const [expandedCardId, setExpandedCardId] = useState(null);

  /* video analysis hook initialized after queue hook */

  // Analysis view modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAnalysisItem, setSelectedAnalysisItem] = useState<any>(null);

  // Processing Queue state and actions
  const { processingQueue, setProcessingQueue, retryProcessing, removeFromQueue } = useProcessingQueue();

  // Video upload & analysis state via hook (depends on setProcessingQueue)
  const {
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
  } = useVideoAnalysis(setProcessingQueue);

  // Generate dynamic chart data for analysis results
  const generateAnalysisChartData = (item: any) => {
    // Player performance data for charts
    const playerStatsData = [
      {
        name: "Marcus Bontempelli",
        goals: 2,
        assists: 3,
        tackles: 6,
        marks: 8,
        efficiency: 85.7,
        maxSpeed: 32.4,
        distance: 12.8,
        disposals: 31,
      },
      {
        name: "Patrick Cripps",
        goals: 1,
        assists: 5,
        tackles: 9,
        marks: 6,
        efficiency: 88.6,
        maxSpeed: 29.8,
        distance: 13.2,
        disposals: 34,
      },
      {
        name: "Clayton Oliver",
        goals: 0,
        assists: 4,
        tackles: 7,
        marks: 5,
        efficiency: 82.3,
        maxSpeed: 28.1,
        distance: 11.5,
        disposals: 28,
      },
      {
        name: "Christian Petracca",
        goals: 3,
        assists: 2,
        tackles: 4,
        marks: 7,
        efficiency: 89.2,
        maxSpeed: 31.8,
        distance: 10.9,
        disposals: 26,
      },
    ];

    // Crowd density data for charts
    const crowdDensityData = [
      {
        section: "Northern Stand",
        density: 95.0,
        attendance: 14250,
        capacity: 15000,
        noiseLevel: 95.2,
      },
      {
        section: "Southern Stand",
        density: 97.3,
        attendance: 11680,
        capacity: 12000,
        noiseLevel: 92.8,
      },
      {
        section: "Eastern Wing",
        density: 88.5,
        attendance: 7080,
        capacity: 8000,
        noiseLevel: 87.4,
      },
      {
        section: "Western Wing",
        density: 91.2,
        attendance: 7296,
        capacity: 8000,
        noiseLevel: 89.6,
      },
      {
        section: "Premium Seats",
        density: 94.8,
        attendance: 2844,
        capacity: 3000,
        noiseLevel: 78.2,
      },
      {
        section: "MCC Members",
        density: 89.1,
        attributes: 4455,
        capacity: 5000,
        noiseLevel: 82.1,
      },
    ];

    // Performance timeline data
    const performanceTimelineData = [
      { time: "Q1", goals: 3, tackles: 15, marks: 12, efficiency: 84 },
      { time: "Q2", goals: 4, tackles: 18, marks: 14, efficiency: 87 },
      { time: "Q3", goals: 2, tackles: 12, marks: 10, efficiency: 82 },
      { time: "Q4", goals: 5, tackles: 20, marks: 16, efficiency: 89 },
    ];

    // Speed comparison data
    const speedComparisonData = [
      { player: "M. Bontempelli", maxSpeed: 32.4, avgSpeed: 24.8 },
      { player: "P. Cripps", maxSpeed: 29.8, avgSpeed: 22.1 },
      { player: "C. Oliver", maxSpeed: 28.1, avgSpeed: 21.5 },
      { player: "C. Petracca", maxSpeed: 31.8, avgSpeed: 25.2 },
    ];

    return {
      playerStats: playerStatsData,
      crowdDensity: crowdDensityData,
      performanceTimeline: performanceTimelineData,
      speedComparison: speedComparisonData,
    };
  };

  // Chart color schemes
  const chartColors = {
    primary: "#059669",
    secondary: "#2563eb",
    accent: "#dc2626",
    warning: "#d97706",
    success: "#16a34a",
    purple: "#7c3aed",
    pink: "#ec4899",
    teal: "#0d9488",
  };

  // PDF Downloads for dashboard sections
  const [includeComparison, setIncludeComparison] = useState(true);
  const [includeMatches, setIncludeMatches] = useState(true);
  const [includeTimelineChart, setIncludeTimelineChart] = useState(true);
  const [playerReportMode, setPlayerReportMode] = useState<'individual' | 'comparison'>("individual");
  const [teamReportMode, setTeamReportMode] = useState<'individual' | 'comparison'>("comparison");

  const handleDownloadPlayerPDF = () => {
    const html = buildPlayerPerformanceReportHTML({
      mode: playerReportMode,
      selectedPlayer,
      comparisonPlayer: playerReportMode === 'comparison' && includeComparison ? comparisonPlayer : null,
      comparisonData: playerReportMode === 'comparison' ? playerComparisonData : null,
    });
    generateDashboardPDF(html);
  };

  const handleDownloadTeamPDF = () => {
    const singleTeam = teamReportMode === 'individual' ? (teamA !== 'all' ? teamA : teamB) : null;
    if (teamReportMode === 'individual') {
      if (!singleTeam || singleTeam === 'all') {
        alert('Select a team for the individual team report.');
        return;
      }
    } else if (teamA === 'all' && teamB === 'all') {
      alert('Select Team A or Team B to generate a comparison report.');
      return;
    }
    const filteredForReport = includeMatches
      ? teamMatches.filter(m => {
          if (teamReportMode === 'individual') {
            return m.teams.home === singleTeam || m.teams.away === singleTeam;
          }
          return (
            (teamA !== 'all' && (m.teams.home === teamA || m.teams.away === teamA)) ||
            (teamB !== 'all' && (m.teams.home === teamB || m.teams.away === teamB))
          );
        })
      : [];

    const html = buildTeamPerformanceReportHTML({
      mode: teamReportMode,
      teamA,
      teamB,
      singleTeam,
      teamCompare,
      summary: teamSummary,
      matches: filteredForReport,
    });
    generateDashboardPDF(html);
  };

  const handleDownloadCrowdPDF = () => {
    const timeline = generateTimelineFromStadiumData(crowdZones);
    const html = buildCrowdMonitorReportHTML({ zones: crowdZones, timeline, includeTimeline: includeTimelineChart });
    generateDashboardPDF(html);
  };

  // View analysis results for a queue item
  const handleViewAnalysis = (item: any) => {
    setSelectedAnalysisItem(item);
    setViewModalOpen(true);
  };

  // Download analysis report for a queue item
  const handleDownloadFromQueue = async (
    item: any,
    format: "pdf" | "json" | "txt" = "pdf",
  ) => {
    try {
      // Generate analysis data for this specific item
      const analysisId = item.id;
      const backendData = {
        analysisId,
        timestamp: item.completedTime || item.uploadTime,
        videoFile: {
          name: item.name,
          duration: item.duration,
          size: item.size,
          resolution: "1920x1080",
          framerate: "30fps",
        },
        analysisType: item.analysisType,
        focusAreas: [], // Queue items don't have focus areas stored
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

      if (format === "json") {
        // Download raw JSON data
        const jsonContent = JSON.stringify(backendData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${item.name.replace(/\.[^/.]+$/, "")}_Analysis.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        // Generate PDF from backend data
        const htmlContent = convertBackendDataToHTML(backendData);
        generateDashboardPDF(htmlContent);
      } else {
        // Generate TXT from backend data
        const textContent = convertBackendDataToText(backendData);
        downloadText(
          textContent,
          `${item.name.replace(/\.[^/.]+$/, "")}_Analysis`,
        );
      }
    } catch (error) {
      console.error("Error downloading analysis:", error);
      alert("Failed to download analysis. Please try again.");
    }
  };

  // Simulate realistic processing queue progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingQueue((prev) =>
        prev.map((item) => {
          // Only update items that are actively processing AND not controlled by UI
          if (
            (item.status === "analyzing" ||
              item.status === "processing" ||
              item.status === "uploading" ||
              item.status === "queued") &&
            !item.isUIControlled
          ) {
            // Variable progress based on file size and complexity
            const sizeMultiplier = parseFloat(item.size) > 1000 ? 0.5 : 1; // Slower for large files
            const complexityMultiplier =
              item.analysisType === "Full Match Analysis"
                ? 0.3
                : item.analysisType === "Tactical Analysis"
                  ? 0.6
                  : 1;
            const progressIncrement =
              Math.random() * 3 * sizeMultiplier * complexityMultiplier + 0.5;
            const newProgress = Math.min(
              100,
              item.progress + progressIncrement,
            );

            // Simulate stage transitions
            let newStage = item.processingStage;
            let newStatus: QueueItem["status"] = item.status;

            if (item.status === "uploading" && newProgress >= 100) {
              newStatus = "queued";
              newStage = "queue_waiting";
              return {
                ...item,
                status: newStatus,
                progress: 0,
                processingStage: newStage,
              };
            }

            if (item.status === "queued" && Math.random() > 0.7) {
              newStatus = "processing";
              newStage = "preprocessing";
              return {
                ...item,
                status: newStatus,
                progress: 5,
                processingStage: newStage,
              };
            }

            if (
              item.status === "processing" &&
              item.progress > 30 &&
              Math.random() > 0.8
            ) {
              newStatus = "analyzing";
              newStage = "video_analysis";
            }

            if (newProgress >= 100) {
              newStatus = "completed";
              newStage = "analysis_complete";
              return {
                ...item,
                status: newStatus,
                progress: 100,
                processingStage: newStage,
                completedTime: new Date().toISOString(),
                estimatedCompletion: null,
              };
            }

            // Realistic failure scenarios based on file characteristics
            const failureChance =
              parseFloat(item.size) > 2000
                ? 0.005 // Higher chance for very large files
                : item.analysisType === "Tactical Analysis"
                  ? 0.003 // Complex analysis more prone to failure
                  : item.retryCount > 0
                    ? 0.001 // Lower chance if already retried
                    : 0.002; // Base failure chance

            if (
              Math.random() < failureChance &&
              item.errorCount < 2 &&
              item.progress > 10
            ) {
              const errorReasons = [
                "insufficient_memory",
                "corrupted_segment",
                "processing_timeout",
                "unsupported_codec",
                "server_overload",
              ];
              return {
                ...item,
                status: "failed",
                processingStage:
                  errorReasons[Math.floor(Math.random() * errorReasons.length)],
                errorCount: item.errorCount + 1,
              };
            }

            return {
              ...item,
              progress: newProgress,
              status: newStatus,
              processingStage: newStage,
            };
          }
          return item;
        }),
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const email = localStorage.getItem("userEmail");

    if (!isAuthenticated || isAuthenticated !== "true") {
      // Redirect to login if not authenticated
      navigate("/");
      return;
    }

    if (email) {
      setUserEmail(email);
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/");
  };

  /* Video upload handlers moved to useVideoAnalysis hook */



  // Generate dynamic summaries for dashboard reports
  const generateDynamicDashboardSummary = (
    insights: any,
    analysisType: string,
    focusAreas: string[],
  ) => {
    const totalAttendance = insights.crowdDensity.reduce(
      (sum: number, section: any) => sum + section.attendance,
      0,
    );
    const topPlayer = insights.playerStats.reduce((best: any, current: any) =>
      parseFloat(current.efficiency) > parseFloat(best.efficiency)
        ? current
        : best,
    );
    const avgCrowdDensity = (
      insights.crowdDensity.reduce(
        (sum: number, section: any) => sum + parseFloat(section.density),
        0,
      ) / insights.crowdDensity.length
    ).toFixed(1);

    return {
      overview: `Comprehensive analysis of ${totalAttendance.toLocaleString()} attendees across ${insights.crowdDensity.length} stadium sections with ${focusAreas.length || "general"} focus areas.`,
      performance: `Top performer: ${topPlayer.name} achieved ${topPlayer.efficiency}% efficiency with ${topPlayer.goals} goals and ${topPlayer.tackles} tackles.`,
      crowd: `Stadium operated at ${avgCrowdDensity}% average density with peak engagement in ${
        insights.crowdDensity.reduce((max: any, section: any) =>
          parseFloat(section.density) > parseFloat(max.density) ? section : max,
        ).section
      }.`,
      analysis:
        analysisType === "highlights"
          ? `Key highlight moments identified with real-time crowd correlation analysis.`
          : analysisType === "player"
            ? `Individual player tracking completed for ${insights.playerStats.length} athletes with speed and positioning data.`
            : analysisType === "tactics"
              ? `Tactical formations and strategic patterns analyzed throughout the match.`
              : analysisType === "performance"
                ? `Comprehensive performance metrics calculated for all tracked players.`
                : `Crowd engagement patterns analyzed across all stadium sections.`,
    };
  };



  // Simulate getting JSON data from backend
  const fetchBackendAnalysisData = async (analysisId: string) => {
    // Simulate backend JSON response
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





  // Player cards data
  const playerCards = [
    {
      id: 1,
      name: "DAYNE ZORKO",
      team: "Brisbane Lions",
      number: 7,
      background: "from-red-800 to-red-900",
      image:
        "https://images.pexels.com/photos/159666/rugby-runner-player-running-159666.jpeg",
      stats: {
        goalAccuracy: 67,
        handballs: 16,
        disposals: 34,
        kicks: 18,
        marks: 8,
        tackles: 6,
      },
    },
    {
      id: 2,
      name: "MARCUS BONTEMPELLI",
      team: "Western Bulldogs",
      number: 4,
      background: "from-orange-600 to-orange-700",
      image:
        "https://images.pexels.com/photos/159555/soccer-football-athlete-player-159555.jpeg",
      stats: {
        goalAccuracy: 60,
        handballs: 18,
        disposals: 42,
        kicks: 24,
        marks: 10,
        tackles: 8,
      },
    },
    {
      id: 3,
      name: "PATRICK CRIPPS",
      team: "Carlton",
      number: 9,
      background: "from-blue-800 to-blue-900",
      image: "https://images.pexels.com/photos/209961/pexels-photo-209961.jpeg",
      stats: {
        goalAccuracy: 100,
        handballs: 12,
        disposals: 38,
        kicks: 26,
        marks: 7,
        tackles: 9,
      },
    },
    {
      id: 4,
      name: "DUSTIN MARTIN",
      team: "Richmond",
      number: 3,
      background: "from-yellow-500 to-yellow-600",
      image:
        "https://images.pexels.com/photos/159684/soccer-football-soccer-player-sport-159684.jpeg",
      stats: {
        goalAccuracy: 80,
        handballs: 8,
        disposals: 28,
        kicks: 20,
        marks: 6,
        tackles: 4,
      },
    },
  ];

  // Player comparison chart data
  const playerComparisonData = [
    {
      stat: "Kicks",
      [selectedPlayer.name]: selectedPlayer.kicks,
      [comparisonPlayer.name]: comparisonPlayer.kicks,
    },
    {
      stat: "Handballs",
      [selectedPlayer.name]: selectedPlayer.handballs,
      [comparisonPlayer.name]: comparisonPlayer.handballs,
    },
    {
      stat: "Marks",
      [selectedPlayer.name]: selectedPlayer.marks,
      [comparisonPlayer.name]: comparisonPlayer.marks,
    },
    {
      stat: "Tackles",
      [selectedPlayer.name]: selectedPlayer.tackles,
      [comparisonPlayer.name]: comparisonPlayer.tackles,
    },
    {
      stat: "Goals",
      [selectedPlayer.name]: selectedPlayer.goals,
      [comparisonPlayer.name]: comparisonPlayer.goals,
    },
    {
      stat: "Efficiency",
      [selectedPlayer.name]: selectedPlayer.efficiency,
      [comparisonPlayer.name]: comparisonPlayer.efficiency,
    },
  ];

  const filteredPlayers = mockPlayers.filter(
    (player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedTeam === "all" || player.team === selectedTeam),
  );

  // Handle card click
  const handleCardClick = (card, index) => {
    setSelectedCard(card);
    setSelectedCardIndex(index);
    // Toggle expanded state
    setExpandedCardId(expandedCardId === card.id ? null : card.id);
  };

  // Initialize selectedCard when component mounts
  useEffect(() => {
    if (playerCards.length > 0 && !selectedCard) {
      setSelectedCard(playerCards[0]);
    }
  }, [playerCards, selectedCard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-orange-600 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
                  AFL Analytics
                </h1>
                <p className="text-sm text-gray-600">
                  Real-time match insights & player analytics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant={isLive ? "destructive" : "secondary"}
                className="animate-pulse"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                {isLive ? "LIVE" : "OFFLINE"}
              </Badge>
              {userEmail && (
                <span className="text-sm text-gray-600 hidden sm:block">
                  Welcome, {userEmail}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="video" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video Analysis
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Player Performance
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Team Match
            </TabsTrigger>
            <TabsTrigger value="crowd" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Crowd Monitor
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Downloads
            </TabsTrigger>
          </TabsList>

          {/* Team Match Performance */}
          <TabsContent value="team" className="space-y-6">
            <TeamTab
              teamMatches={teamMatches}
              teamSearch={teamSearch} setTeamSearch={setTeamSearch}
              teamFilter={teamFilter} setTeamFilter={setTeamFilter}
              teamRound={teamRound} setTeamRound={setTeamRound}
              teamA={teamA} setTeamA={setTeamA}
              teamB={teamB} setTeamB={setTeamB}
            />
          </TabsContent>

          {/* Player Performance Tracker */}
          <TabsContent value="performance" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search and Filters */}
              <Card className="lg:w-1/3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Player Search & Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Search Players
                    </label>
                    <Input
                      placeholder="Search by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Filter by Team
                    </label>
                    <Select
                      value={selectedTeam}
                      onValueChange={setSelectedTeam}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        <SelectItem value="Western Bulldogs">
                          Western Bulldogs
                        </SelectItem>
                        <SelectItem value="Richmond">Richmond</SelectItem>
                        <SelectItem value="Geelong">Geelong</SelectItem>
                        <SelectItem value="Melbourne">Melbourne</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {filteredPlayers.map((player) => (
                      <div
                        key={player.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPlayer.id === player.id
                            ? "border-blue-500 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">
                          {player.team} ��� {player.position}
                        </div>
                        <div className="text-xs text-orange-600 mt-1">
                          Efficiency: {player.efficiency}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Player Statistics */}
              <div className="lg:w-2/3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Player Statistics - {selectedPlayer.name}</span>
                      <Badge variant="outline">{selectedPlayer.team}</Badge>
                    </CardTitle>
                    <CardDescription>{selectedPlayer.position}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedPlayer.kicks}
                        </div>
                        <div className="text-sm text-gray-600">Kicks</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedPlayer.handballs}
                        </div>
                        <div className="text-sm text-gray-600">Handballs</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedPlayer.marks}
                        </div>
                        <div className="text-sm text-gray-600">Marks</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedPlayer.tackles}
                        </div>
                        <div className="text-sm text-gray-600">Tackles</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedPlayer.goals}
                        </div>
                        <div className="text-sm text-gray-600">Goals</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedPlayer.efficiency}%
                        </div>
                        <div className="text-sm text-gray-600">Efficiency</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AFL Trading Cards */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Player Profiles
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllCards(!showAllCards)}
                      >
                        {showAllCards ? "Show One" : "View All"}
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      View AFL player profiles with stats and performance data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {showAllCards ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {playerCards.map((card, index) => {
                          const isExpanded = expandedCardId === card.id;
                          return (
                            <div
                              key={card.id}
                              className={`relative w-full mx-auto cursor-pointer transform transition-all duration-500 hover:shadow-xl ${
                                isExpanded
                                  ? "col-span-full max-w-2xl scale-105 z-10"
                                  : "max-w-xs hover:scale-105"
                              }`}
                              onClick={() => handleCardClick(card, index)}
                            >
                              <div className="absolute top-3 left-3 z-20">
                                <div className="bg-white rounded-full p-2 shadow-md">
                                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">
                                      AFL
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute top-3 right-3 z-20">
                                <div className="bg-black/70 text-white px-2 py-1 rounded text-sm font-bold">
                                  #{card.number}
                                </div>
                              </div>
                              {isExpanded && (
                                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20">
                                  <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                    EXPANDED VIEW
                                  </div>
                                </div>
                              )}
                              <div
                                className={`relative rounded-lg overflow-hidden shadow-lg border-2 bg-gradient-to-b ${card.background} transition-all duration-500 ${
                                  isExpanded
                                    ? "h-[500px] border-orange-400"
                                    : "h-80 border-gray-200"
                                }`}
                              >
                                <img
                                  src={card.image}
                                  alt={card.name}
                                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                                    isExpanded ? "opacity-95" : "opacity-80"
                                  }`}
                                />
                                <div
                                  className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-500 ${
                                    isExpanded
                                      ? "from-transparent via-black/20 to-black/90"
                                      : "from-transparent via-transparent to-black/80"
                                  }`}
                                />
                                <div
                                  className={`absolute left-3 right-3 z-10 transition-all duration-500 ${
                                    isExpanded ? "top-16" : "top-12"
                                  }`}
                                >
                                  <h3
                                    className={`text-white font-bold leading-tight transition-all duration-500 ${
                                      isExpanded ? "text-2xl" : "text-lg"
                                    }`}
                                  >
                                    {card.name}
                                  </h3>
                                  <p
                                    className={`text-white/80 transition-all duration-500 ${
                                      isExpanded ? "text-lg" : "text-sm"
                                    }`}
                                  >
                                    {card.team}
                                  </p>
                                  {isExpanded && (
                                    <div className="mt-3 flex gap-2 opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.3s_forwards]">
                                      <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-xs">
                                        🏆 Season MVP
                                      </div>
                                      <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-xs">
                                        ��� Top Performer
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div
                                  className={`absolute left-3 right-3 z-10 transition-all duration-500 ${
                                    isExpanded ? "bottom-32" : "bottom-16"
                                  }`}
                                >
                                  <div
                                    className={`bg-black/80 backdrop-blur-sm rounded transition-all duration-500 ${
                                      isExpanded ? "p-4" : "p-3"
                                    }`}
                                  >
                                    <div
                                      className={`text-white space-y-1 transition-all duration-500 ${
                                        isExpanded ? "text-sm" : "text-xs"
                                      }`}
                                    >
                                      <div className="flex justify-between">
                                        <span>GOAL ACCURACY:</span>
                                        <span className="font-bold">
                                          {card.stats.goalAccuracy}%
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>HANDBALLS:</span>
                                        <span className="font-bold">
                                          {card.stats.handballs}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>DISPOSALS:</span>
                                        <span className="font-bold">
                                          {card.stats.disposals}
                                        </span>
                                      </div>
                                      {isExpanded && (
                                        <div className="opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.4s_forwards]">
                                          <div className="border-t border-white/20 my-2"></div>
                                          <div className="flex justify-between">
                                            <span>EFFICIENCY:</span>
                                            <span className="font-bold">
                                              87%
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>CONTESTED MARKS:</span>
                                            <span className="font-bold">4</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>INTERCEPTS:</span>
                                            <span className="font-bold">3</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-700 z-10 transition-all duration-500 ${
                                    isExpanded ? "p-4" : "p-3"
                                  }`}
                                >
                                  <div
                                    className={`grid grid-cols-3 gap-2 text-white text-center transition-all duration-500 ${
                                      isExpanded ? "mb-2" : ""
                                    }`}
                                  >
                                    <div>
                                      <div
                                        className={`font-bold transition-all duration-500 ${
                                          isExpanded ? "text-xl" : "text-lg"
                                        }`}
                                      >
                                        {card.stats.kicks}
                                      </div>
                                      <div
                                        className={`transition-all duration-500 ${
                                          isExpanded ? "text-sm" : "text-xs"
                                        }`}
                                      >
                                        KICKS
                                      </div>
                                    </div>
                                    <div>
                                      <div
                                        className={`font-bold transition-all duration-500 ${
                                          isExpanded ? "text-xl" : "text-lg"
                                        }`}
                                      >
                                        {card.stats.marks}
                                      </div>
                                      <div
                                        className={`transition-all duration-500 ${
                                          isExpanded ? "text-sm" : "text-xs"
                                        }`}
                                      >
                                        MARKS
                                      </div>
                                    </div>
                                    <div>
                                      <div
                                        className={`font-bold transition-all duration-500 ${
                                          isExpanded ? "text-xl" : "text-lg"
                                        }`}
                                      >
                                        {card.stats.tackles}
                                      </div>
                                      <div
                                        className={`transition-all duration-500 ${
                                          isExpanded ? "text-sm" : "text-xs"
                                        }`}
                                      >
                                        TACKLES
                                      </div>
                                    </div>
                                  </div>
                                  {isExpanded && (
                                    <div className="text-center text-white/80 text-xs opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.5s_forwards]">
                                      Click again to collapse • Background image
                                      now more visible
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newIndex = Math.max(
                                0,
                                selectedCardIndex - 1,
                              );
                              setSelectedCardIndex(newIndex);
                              setSelectedCard(playerCards[newIndex]);
                            }}
                            disabled={selectedCardIndex === 0}
                          >
                            ← Previous
                          </Button>
                          <span className="text-sm text-gray-600">
                            {selectedCardIndex + 1} of {playerCards.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newIndex = Math.min(
                                playerCards.length - 1,
                                selectedCardIndex + 1,
                              );
                              setSelectedCardIndex(newIndex);
                              setSelectedCard(playerCards[newIndex]);
                            }}
                            disabled={
                              selectedCardIndex === playerCards.length - 1
                            }
                          >
                            Next →
                          </Button>
                        </div>

                        <div
                          className={`relative w-full mx-auto cursor-pointer transform transition-all duration-500 hover:shadow-xl ${
                            expandedCardId === playerCards[selectedCardIndex].id
                              ? "max-w-2xl scale-105"
                              : "max-w-sm hover:scale-105"
                          }`}
                          onClick={() =>
                            handleCardClick(
                              playerCards[selectedCardIndex],
                              selectedCardIndex,
                            )
                          }
                        >
                          {(() => {
                            const card = playerCards[selectedCardIndex];
                            const isExpanded = expandedCardId === card.id;
                            return (
                              <>
                                <div className="absolute top-3 left-3 z-20">
                                  <div className="bg-white rounded-full p-2 shadow-md">
                                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-xs">
                                        AFL
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute top-3 right-3 z-20">
                                  <div className="bg-black/70 text-white px-2 py-1 rounded text-sm font-bold">
                                    #{card.number}
                                  </div>
                                </div>
                                {isExpanded && (
                                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20">
                                    <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                      EXPANDED VIEW
                                    </div>
                                  </div>
                                )}
                                <div
                                  className={`relative rounded-lg overflow-hidden shadow-lg border-2 bg-gradient-to-b ${card.background} transition-all duration-500 ${
                                    isExpanded
                                      ? "h-[600px] border-orange-400"
                                      : "h-96 border-gray-200"
                                  }`}
                                >
                                  <img
                                    src={card.image}
                                    alt={card.name}
                                    className={`w-full h-full object-cover transition-opacity duration-500 ${
                                      isExpanded ? "opacity-95" : "opacity-80"
                                    }`}
                                  />
                                  <div
                                    className={`absolute inset-0 bg-gradient-to-b transition-opacity duration-500 ${
                                      isExpanded
                                        ? "from-transparent via-black/20 to-black/90"
                                        : "from-transparent via-transparent to-black/80"
                                    }`}
                                  />
                                  <div
                                    className={`absolute left-3 right-3 z-10 transition-all duration-500 ${
                                      isExpanded ? "top-16" : "top-12"
                                    }`}
                                  >
                                    <h3
                                      className={`text-white font-bold leading-tight transition-all duration-500 ${
                                        isExpanded ? "text-3xl" : "text-xl"
                                      }`}
                                    >
                                      {card.name}
                                    </h3>
                                    <p
                                      className={`text-white/80 transition-all duration-500 ${
                                        isExpanded ? "text-xl" : "text-base"
                                      }`}
                                    >
                                      {card.team}
                                    </p>
                                    {isExpanded && (
                                      <div className="mt-4 flex gap-3 opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.3s_forwards]">
                                        <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-sm">
                                          🏆 Season MVP
                                        </div>
                                        <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-sm">
                                          ⭐ Top Performer
                                        </div>
                                        <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded text-white text-sm">
                                          💪 Best Midfielder
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div
                                    className={`absolute left-3 right-3 z-10 transition-all duration-500 ${
                                      isExpanded ? "bottom-40" : "bottom-20"
                                    }`}
                                  >
                                    <div
                                      className={`bg-black/80 backdrop-blur-sm rounded transition-all duration-500 ${
                                        isExpanded ? "p-6" : "p-4"
                                      }`}
                                    >
                                      <div
                                        className={`text-white space-y-2 transition-all duration-500 ${
                                          isExpanded ? "text-base" : "text-sm"
                                        }`}
                                      >
                                        <div className="flex justify-between">
                                          <span>GOAL ACCURACY:</span>
                                          <span className="font-bold">
                                            {card.stats.goalAccuracy}%
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>HANDBALLS:</span>
                                          <span className="font-bold">
                                            {card.stats.handballs}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>DISPOSALS:</span>
                                          <span className="font-bold">
                                            {card.stats.disposals}
                                          </span>
                                        </div>
                                        {isExpanded && (
                                          <div className="opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.4s_forwards]">
                                            <div className="border-t border-white/20 my-3"></div>
                                            <div className="grid grid-cols-2 gap-4">
                                              <div className="flex justify-between">
                                                <span>EFFICIENCY:</span>
                                                <span className="font-bold">
                                                  87%
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span>INTERCEPTS:</span>
                                                <span className="font-bold">
                                                  3
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span>CONTESTED MARKS:</span>
                                                <span className="font-bold">
                                                  4
                                                </span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span>ONE PERCENTERS:</span>
                                                <span className="font-bold">
                                                  7
                                                </span>
                                              </div>
                                            </div>
                                            <div className="border-t border-white/20 mt-3 pt-3">
                                              <div className="text-center">
                                                <span className="text-white/70 text-sm">
                                                  MATCH RATING
                                                </span>
                                                <div className="text-yellow-400 text-2xl font-bold">
                                                  ★ 9.2/10
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-700 z-10 transition-all duration-500 ${
                                      isExpanded ? "p-6" : "p-4"
                                    }`}
                                  >
                                    <div
                                      className={`grid grid-cols-3 gap-2 text-white text-center transition-all duration-500 ${
                                        isExpanded ? "mb-3" : ""
                                      }`}
                                    >
                                      <div>
                                        <div
                                          className={`font-bold transition-all duration-500 ${
                                            isExpanded ? "text-2xl" : "text-xl"
                                          }`}
                                        >
                                          {card.stats.kicks}
                                        </div>
                                        <div
                                          className={`transition-all duration-500 ${
                                            isExpanded ? "text-base" : "text-sm"
                                          }`}
                                        >
                                          KICKS
                                        </div>
                                      </div>
                                      <div>
                                        <div
                                          className={`font-bold transition-all duration-500 ${
                                            isExpanded ? "text-2xl" : "text-xl"
                                          }`}
                                        >
                                          {card.stats.marks}
                                        </div>
                                        <div
                                          className={`transition-all duration-500 ${
                                            isExpanded ? "text-base" : "text-sm"
                                          }`}
                                        >
                                          MARKS
                                        </div>
                                      </div>
                                      <div>
                                        <div
                                          className={`font-bold transition-all duration-500 ${
                                            isExpanded ? "text-2xl" : "text-xl"
                                          }`}
                                        >
                                          {card.stats.tackles}
                                        </div>
                                        <div
                                          className={`transition-all duration-500 ${
                                            isExpanded ? "text-base" : "text-sm"
                                          }`}
                                        >
                                          TACKLES
                                        </div>
                                      </div>
                                    </div>
                                    {isExpanded && (
                                      <div className="text-center text-white/80 text-sm opacity-0 animate-[fadeIn_0.5s_ease-in-out_0.5s_forwards]">
                                        Click again to collapse �� Background
                                        image more visible • Full player details
                                        shown
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        <div className="text-center text-sm text-gray-600 max-w-md">
                          <p className="font-medium">
                            Current: {playerCards[selectedCardIndex].name} from{" "}
                            {playerCards[selectedCardIndex].team}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Player Comparison */}
                <PlayerComparison
                  selectedPlayer={selectedPlayer}
                  comparisonPlayer={comparisonPlayer}
                  setComparisonPlayer={setComparisonPlayer}
                  mockPlayers={mockPlayers}
                  playerComparisonData={playerComparisonData}
                />
              </div>
            </div>
          </TabsContent>

          {/* Crowd Monitoring Dashboard */}
          <TabsContent value="crowd" className="space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Stadium Zone Density
                      </CardTitle>
                      <CardDescription>
                        Real-time crowd distribution across stadium zones
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {crowdZones.map((zone, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{zone.zone}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {zone.current.toLocaleString()} /{" "}
                                  {zone.capacity.toLocaleString()}
                                </span>
                                {zone.trend === "up" && (
                                  <TrendingUp className="w-4 h-4 text-green-500" />
                                )}
                                {zone.trend === "down" && (
                                  <TrendingDown className="w-4 h-4 text-red-500" />
                                )}
                                {zone.trend === "stable" && (
                                  <div className="w-4 h-4 rounded-full bg-gray-400" />
                                )}
                              </div>
                            </div>
                            <Progress value={zone.density} className="h-3" />
                            <div className="text-xs text-gray-600 text-right">
                              {zone.density}% capacity
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Visual Stadium Map
                      </CardTitle>
                      <CardDescription>
                        Interactive crowd density visualization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative bg-orange-50 rounded-lg p-4 min-h-80">
                        {/* AFL Ground - Oval Shape */}
                        <div
                          className="absolute inset-6 border-4 border-orange-600 bg-orange-200"
                          style={{
                            borderRadius: "50%",
                            clipPath: "ellipse(45% 40% at 50% 50%)",
                          }}
                        >
                          {/* Goal squares */}
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-6 border-2 border-orange-700 bg-orange-300"></div>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-6 border-2 border-orange-700 bg-orange-300"></div>

                          {/* Center circle */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-2 border-orange-700 rounded-full"></div>

                          {/* AFL text */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-orange-800 mt-6">
                            AFL GROUND
                          </div>
                        </div>

                        {/* Dynamic Zone overlays */}
                        {crowdZones.map((zone, index) => (
                          <div
                            key={index}
                            className="absolute transition-all duration-1000 cursor-pointer hover:scale-105"
                            style={{
                              ...zone.position,
                              backgroundColor: zone.color,
                              opacity: (zone.density / 100) * 0.8 + 0.2,
                              borderRadius: "8px",
                              border: "2px solid rgba(255,255,255,0.8)",
                            }}
                            title={`${zone.zone}: ${zone.current.toLocaleString()}/${zone.capacity.toLocaleString()} (${zone.density}%)`}
                          >
                            <div className="p-2 text-white text-center">
                              <div className="text-xs font-medium leading-tight">
                                {zone.zone.split(" ")[0]}
                              </div>
                              <div className="text-xs font-bold">
                                {zone.density}%
                              </div>
                              <div className="text-xs opacity-90">
                                {zone.current.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Stadium info */}
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-700 bg-white/80 px-2 py-1 rounded">
                            MCG
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Legend */}
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded"></div>
                            <span>Low (0-49%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span>Medium (50-84%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded"></div>
                            <span>High (85-94%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-600 rounded"></div>
                            <span>Critical (95%+)</span>
                          </div>
                        </div>

                        {/* Summary stats */}
                        <div className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                          <span>
                            Total Attendance:{" "}
                            <strong>
                              {crowdZones
                                .reduce((sum, zone) => sum + zone.current, 0)
                                .toLocaleString()}
                            </strong>
                          </span>
                          <span>
                            Avg Density:{" "}
                            <strong>
                              {Math.round(
                                crowdZones.reduce(
                                  (sum, zone) => sum + zone.density,
                                  0,
                                ) / crowdZones.length,
                              )}
                              %
                            </strong>
                          </span>
                          <span>
                            Critical Zones:{" "}
                            <strong className="text-red-600">
                              {
                                crowdZones.filter((zone) => zone.density >= 95)
                                  .length
                              }
                            </strong>
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Historical Crowd Data
                    </CardTitle>
                    <CardDescription>
                      Crowd patterns from previous matches
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {crowdZones
                            .reduce((sum, zone) => sum + zone.current, 0)
                            .toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Current Attendance
                        </div>
                        <div className="text-xs text-orange-600 mt-1">
                          Live Stadium Data
                        </div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {Math.round(
                            crowdZones.reduce(
                              (sum, zone) => sum + zone.density,
                              0,
                            ) / crowdZones.length,
                          )}
                          %
                        </div>
                        <div className="text-sm text-gray-600">
                          Average Density
                        </div>
                        <div className="text-xs text-orange-600 mt-1">
                          Across {crowdZones.length} zones
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {crowdZones
                            .reduce((sum, zone) => sum + zone.capacity, 0)
                            .toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Capacity
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Stadium Maximum
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        Density Distribution Pie Chart
                      </CardTitle>
                      <CardDescription>
                        Visual breakdown of zones by density levels
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Low (0-49%)",
                                  value: crowdZones.filter(
                                    (zone) => zone.density < 50,
                                  ).length,
                                  color: "#22c55e",
                                },
                                {
                                  name: "Medium (50-84%)",
                                  value: crowdZones.filter(
                                    (zone) =>
                                      zone.density >= 50 && zone.density < 85,
                                  ).length,
                                  color: "#f59e0b",
                                },
                                {
                                  name: "High (85-94%)",
                                  value: crowdZones.filter(
                                    (zone) =>
                                      zone.density >= 85 && zone.density < 95,
                                  ).length,
                                  color: "#f97316",
                                },
                                {
                                  name: "Critical (95%+)",
                                  value: crowdZones.filter(
                                    (zone) => zone.density >= 95,
                                  ).length,
                                  color: "#dc2626",
                                },
                              ].filter((item) => item.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={120}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ value, percent }) =>
                                value > 0
                                  ? `${value} (${(percent * 100).toFixed(0)}%)`
                                  : ""
                              }
                              labelLine={false}
                            >
                              {[
                                {
                                  name: "Low (0-49%)",
                                  value: crowdZones.filter(
                                    (zone) => zone.density < 50,
                                  ).length,
                                  color: "#22c55e",
                                },
                                {
                                  name: "Medium (50-84%)",
                                  value: crowdZones.filter(
                                    (zone) =>
                                      zone.density >= 50 && zone.density < 85,
                                  ).length,
                                  color: "#f59e0b",
                                },
                                {
                                  name: "High (85-94%)",
                                  value: crowdZones.filter(
                                    (zone) =>
                                      zone.density >= 85 && zone.density < 95,
                                  ).length,
                                  color: "#f97316",
                                },
                                {
                                  name: "Critical (95%+)",
                                  value: crowdZones.filter(
                                    (zone) => zone.density >= 95,
                                  ).length,
                                  color: "#dc2626",
                                },
                              ]
                                .filter((item) => item.value > 0)
                                .map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                            </Pie>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  const densityRange = data.name;
                                  let zones = [];

                                  if (densityRange.includes("Low (0-49%)")) {
                                    zones = crowdZones.filter(
                                      (zone) => zone.density < 50,
                                    );
                                  } else if (
                                    densityRange.includes("Medium (50-84%)")
                                  ) {
                                    zones = crowdZones.filter(
                                      (zone) =>
                                        zone.density >= 50 && zone.density < 85,
                                    );
                                  } else if (
                                    densityRange.includes("High (85-94%)")
                                  ) {
                                    zones = crowdZones.filter(
                                      (zone) =>
                                        zone.density >= 85 && zone.density < 95,
                                    );
                                  } else if (
                                    densityRange.includes("Critical (95%+)")
                                  ) {
                                    zones = crowdZones.filter(
                                      (zone) => zone.density >= 95,
                                    );
                                  }

                                  return (
                                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                                      <p className="font-medium">{data.name}</p>
                                      <p className="text-sm text-gray-600">
                                        {data.value} zone
                                        {data.value !== 1 ? "s" : ""}
                                      </p>
                                      {zones.length > 0 && (
                                        <div className="mt-2 text-xs">
                                          <p className="font-medium">Zones:</p>
                                          {zones.map((zone) => (
                                            <p key={zone.zone}>
                                              • {zone.zone} ({zone.density}%)
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              formatter={(value) => (
                                <span className="text-sm">{value}</span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Summary below chart */}
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Total Zones:</span>
                            <span className="font-medium">
                              {crowdZones.length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Safe Zones:</span>
                            <span className="font-medium text-orange-600">
                              {
                                crowdZones.filter((zone) => zone.density < 85)
                                  .length
                              }
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Alert Zones:</span>
                            <span className="font-medium text-orange-600">
                              {
                                crowdZones.filter(
                                  (zone) =>
                                    zone.density >= 85 && zone.density < 95,
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Critical Zones:</span>
                            <span className="font-medium text-red-600">
                              {
                                crowdZones.filter((zone) => zone.density >= 95)
                                  .length
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Zone Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {crowdZones.map((zone, index) => {
                          const densityLevel =
                            zone.density >= 95
                              ? "Critical"
                              : zone.density >= 85
                                ? "High"
                                : zone.density >= 70
                                  ? "Medium"
                                  : "Low";
                          const colorClass =
                            zone.density >= 95
                              ? "text-red-600"
                              : zone.density >= 85
                                ? "text-orange-600"
                                : zone.density >= 70
                                  ? "text-yellow-600"
                                  : "text-orange-600";

                          return (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{zone.zone}</span>
                                <span
                                  className={`text-sm font-medium ${colorClass}`}
                                >
                                  {densityLevel}
                                </span>
                              </div>
                              <Progress
                                value={zone.density}
                                className="h-2 mb-1"
                              />
                              <div className="text-xs text-gray-600">
                                {zone.current.toLocaleString()} /{" "}
                                {zone.capacity.toLocaleString()}({zone.density}
                                %)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Crowd Density Timeline
                    </CardTitle>
                    <CardDescription>
                      Historical crowd data and density trends over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={generateTimelineFromStadiumData(crowdZones)}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                          <YAxis
                            yAxisId="attendance"
                            orientation="left"
                            tick={{ fontSize: 12 }}
                            label={{
                              value: "Attendance",
                              angle: -90,
                              position: "insideLeft",
                            }}
                          />
                          <YAxis
                            yAxisId="density"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                            label={{
                              value: "Density %",
                              angle: 90,
                              position: "insideRight",
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #ccc",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                            formatter={(value, name) => {
                              if (name === "attendance")
                                return [
                                  value.toLocaleString(),
                                  "Total Attendance",
                                ];
                              if (name === "density")
                                return [`${value}%`, "Average Density"];
                              if (name === "critical")
                                return [value, "Critical Zones"];
                              if (name === "high")
                                return [value, "High Density Zones"];
                              return [value, name];
                            }}
                          />
                          <Legend />
                          <Area
                            yAxisId="attendance"
                            type="monotone"
                            dataKey="attendance"
                            stackId="1"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                            name="Total Attendance"
                          />
                          <Area
                            yAxisId="density"
                            type="monotone"
                            dataKey="density"
                            stackId="2"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.6}
                            name="Average Density %"
                          />
                          <Area
                            yAxisId="density"
                            type="monotone"
                            dataKey="critical"
                            stackId="3"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.8}
                            name="Critical Zones"
                          />
                          <Area
                            yAxisId="density"
                            type="monotone"
                            dataKey="high"
                            stackId="4"
                            stroke="#f97316"
                            fill="#f97316"
                            fillOpacity={0.8}
                            name="High Density Zones"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Peak Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {generateTimelineFromStadiumData(crowdZones)
                          .sort((a, b) => b.attendance - a.attendance)
                          .slice(0, 3)
                          .map((entry, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <span className="text-sm font-medium">
                                {entry.time}
                              </span>
                              <div className="text-right">
                                <div className="text-sm font-bold">
                                  {entry.attendance.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {entry.density}% density
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Density Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-50 rounded">
                          <div className="text-lg font-bold text-purple-700">
                            {Math.round(
                              crowdZones.reduce(
                                (sum, zone) => sum + zone.density,
                                0,
                              ) / crowdZones.length,
                            )}
                            %
                          </div>
                          <div className="text-sm text-purple-600">
                            Current Average Density
                          </div>
                        </div>
                        <div className="p-3 bg-red-50 rounded">
                          <div className="text-lg font-bold text-red-700">
                            {
                              crowdZones.filter((zone) => zone.density >= 95)
                                .length
                            }
                          </div>
                          <div className="text-sm text-red-600">
                            Critical Zones
                          </div>
                        </div>
                        <div className="p-3 bg-orange-50 rounded">
                          <div className="text-lg font-bold text-orange-700">
                            {
                              crowdZones.filter(
                                (zone) =>
                                  zone.density >= 85 && zone.density < 95,
                              ).length
                            }
                          </div>
                          <div className="text-sm text-orange-600">
                            High Density Zones
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Capacity Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-orange-50 rounded">
                          <div className="text-lg font-bold text-orange-700">
                            {Math.round(
                              (crowdZones.reduce(
                                (sum, zone) => sum + zone.current,
                                0,
                              ) /
                                crowdZones.reduce(
                                  (sum, zone) => sum + zone.capacity,
                                  0,
                                )) *
                                100,
                            )}
                            %
                          </div>
                          <div className="text-sm text-orange-600">
                            Current Stadium Fill
                          </div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded">
                          <div className="text-lg font-bold text-purple-700">
                            {crowdZones
                              .reduce((sum, zone) => sum + zone.current, 0)
                              .toLocaleString()}
                          </div>
                          <div className="text-sm text-purple-600">
                            Current Attendance
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <div className="text-lg font-bold text-gray-700">
                            {(
                              crowdZones.reduce(
                                (sum, zone) => sum + zone.capacity,
                                0,
                              ) -
                              crowdZones.reduce(
                                (sum, zone) => sum + zone.current,
                                0,
                              )
                            ).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Available Capacity
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Downloads: encapsulated in DownloadsPanel */}
          <TabsContent value="downloads" className="space-y-6">
            <DownloadsPanel
              players={mockPlayers}
              teams={teamTeams.filter((t)=>t !== 'all')}
              crowdZonesCount={crowdZones.length}
              totalAttendance={crowdZones.reduce((s,z)=>s+z.current,0)}
              onDownloadPlayer={({ mode, primary, comparison }) => {
                const buildComparisonData = (p1: any, p2: any) => ([
                  { stat: 'Kicks', [p1.name]: p1.kicks, [p2.name]: p2.kicks },
                  { stat: 'Handballs', [p1.name]: p1.handballs, [p2.name]: p2.handballs },
                  { stat: 'Marks', [p1.name]: p1.marks, [p2.name]: p2.marks },
                  { stat: 'Tackles', [p1.name]: p1.tackles, [p2.name]: p2.tackles },
                  { stat: 'Goals', [p1.name]: p1.goals, [p2.name]: p2.goals },
                  { stat: 'Efficiency', [p1.name]: p1.efficiency, [p2.name]: p2.efficiency },
                ]);
                const html = buildPlayerPerformanceReportHTML({
                  mode,
                  selectedPlayer: primary,
                  comparisonPlayer: mode==='comparison' ? comparison : null,
                  comparisonData: mode==='comparison' && comparison ? buildComparisonData(primary, comparison) : null,
                });
                generateDashboardPDF(html);
              }}
              onDownloadTeam={({ mode, teamA, teamB, includeMatches }) => {
                const teamsSel = (teamTeams.filter((t)=>t !== 'all'));
                const a = teamA && teamsSel.includes(teamA) ? teamA : undefined;
                const b = teamB && teamsSel.includes(teamB) ? teamB : undefined;
                const filtered = includeMatches ? teamMatchesData.filter(m => {
                  if (mode === 'individual') return (a && (m.teams.home === a || m.teams.away === a));
                  return (a && (m.teams.home === a || m.teams.away === a)) || (b && (m.teams.home === b || m.teams.away === b));
                }) : [];
                const sumFor = (team?: string) => {
                  if (!team) return { goals: 0, disposals: 0, marks: 0, tackles: 0, efficiency: 0, games: 0 };
                  let goals=0, disposals=0, marks=0, tackles=0, efficiency=0, games=0;
                  teamMatchesData.forEach(m => {
                    if (m.teams.home === team) {
                      goals += m.stats.home.goals; disposals += m.stats.home.disposals; marks += m.stats.home.marks; tackles += m.stats.home.tackles; efficiency += m.stats.home.efficiency; games += 1;
                    } else if (m.teams.away === team) {
                      goals += m.stats.away.goals; disposals += m.stats.away.disposals; marks += m.stats.away.marks; tackles += m.stats.away.tackles; efficiency += m.stats.away.efficiency; games += 1;
                    }
                  });
                  return { goals, disposals, marks, tackles, efficiency: games? Math.round(efficiency/games):0, games };
                };
                const ta = sumFor(a); const tb = sumFor(b);
                const teamCompareLocal = { a: ta, b: tb, aEff: ta.efficiency, bEff: tb.efficiency } as any;
                const summaryLocal = {
                  games: filtered.length,
                  goals: filtered.reduce((s,m)=> s + m.stats.home.goals + m.stats.away.goals, 0),
                  disposals: filtered.reduce((s,m)=> s + m.stats.home.disposals + m.stats.away.disposals, 0),
                  inside50: filtered.reduce((s,m)=> s + m.stats.home.inside50 + m.stats.away.inside50, 0),
                } as any;
                const html = buildTeamPerformanceReportHTML({
                  mode,
                  teamA: a || '',
                  teamB: b || '',
                  singleTeam: mode==='individual' ? (a || b || '') : undefined,
                  teamCompare: teamCompareLocal,
                  summary: summaryLocal,
                  matches: filtered,
                });
                generateDashboardPDF(html);
              }}
              onDownloadCrowd={({ includeTimeline }) => {
                const timeline = generateTimelineFromStadiumData(crowdZones);
                const html = buildCrowdMonitorReportHTML({ zones: crowdZones, timeline, includeTimeline });
                generateDashboardPDF(html);
              }}
            />
          </TabsContent>

          {/* Video Analytics Input */}
          <TabsContent value="video" className="space-y-6">
            <VideoTab
              selectedVideoFile={selectedVideoFile}
              videoAnalysisError={videoAnalysisError}
              isVideoUploading={isVideoUploading}
              videoUploadProgress={videoUploadProgress}
              isVideoAnalyzing={isVideoAnalyzing}
              videoAnalysisProgress={videoAnalysisProgress}
              videoAnalysisComplete={videoAnalysisComplete}
              selectedAnalysisType={selectedAnalysisType}
              setSelectedAnalysisType={setSelectedAnalysisType}
              selectedFocusAreas={selectedFocusAreas}
              handleFocusAreaChange={handleFocusAreaChange}
              handleVideoFileSelect={handleVideoFileSelect}
              uploadAndAnalyzeVideo={uploadAndAnalyzeVideo}
              handleDownloadVideoClips={handleDownloadVideoClips}
              handleDownloadReport={handleDownloadReport}
              processingQueue={processingQueue}
              onRetry={retryProcessing}
              onRemove={removeFromQueue}
              onView={handleViewAnalysis}
              onDownload={handleDownloadFromQueue}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Analysis View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Analysis Results: {selectedAnalysisItem?.name}
            </DialogTitle>
            <DialogDescription>
              Complete analysis details for {selectedAnalysisItem?.analysisType}
            </DialogDescription>
          </DialogHeader>

          {selectedAnalysisItem && (
            <div className="space-y-6">
              {/* Analysis Overview */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Video Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Duration:</span>{" "}
                      {selectedAnalysisItem.duration}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">File Size:</span>{" "}
                      {selectedAnalysisItem.size}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Analysis Type:</span>{" "}
                      {selectedAnalysisItem.analysisType}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Completed:</span>{" "}
                      {selectedAnalysisItem.completedTime
                        ? formatTimeAgo(selectedAnalysisItem.completedTime)
                        : "N/A"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Processing Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Priority:</span>
                      <Badge
                        variant={
                          selectedAnalysisItem.priority === "high"
                            ? "destructive"
                            : selectedAnalysisItem.priority === "medium"
                              ? "secondary"
                              : "outline"
                        }
                        className="ml-2 text-xs"
                      >
                        {selectedAnalysisItem.priority}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant="default" className="ml-2 text-xs">
                        {selectedAnalysisItem.status}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Stage:</span>{" "}
                      {selectedAnalysisItem.processingStage
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Progress:</span>{" "}
                      {selectedAnalysisItem.progress}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Analysis Results with Charts */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Analysis Results</h3>
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-700 border-green-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                    Analysis Complete
                  </Badge>
                </div>

                {(() => {
                  // Simple mock data to avoid chart rendering issues
                  return (
                    <>
                      {/* Player Performance Analysis - Fixed */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Player Performance Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Player Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="font-medium">
                                  Marcus Bontempelli
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Goals: 2 | Tackles: 6 | Efficiency: 85.7%
                                </div>
                                <div className="text-sm text-gray-600">
                                  Max Speed: 32.4 km/h | Distance: 12.8 km
                                </div>
                              </div>
                              <div className="p-3 bg-orange-50 rounded-lg">
                                <div className="font-medium">
                                  Patrick Cripps
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Goals: 1 | Tackles: 9 | Efficiency: 88.6%
                                </div>
                                <div className="text-sm text-gray-600">
                                  Max Speed: 29.8 km/h | Distance: 13.2 km
                                </div>
                              </div>
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="font-medium">
                                  Clayton Oliver
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Goals: 0 | Tackles: 7 | Efficiency: 82.3%
                                </div>
                                <div className="text-sm text-gray-600">
                                  Max Speed: 28.1 km/h | Distance: 11.5 km
                                </div>
                              </div>
                              <div className="p-3 bg-orange-50 rounded-lg">
                                <div className="font-medium">
                                  Christian Petracca
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Goals: 3 | Tackles: 4 | Efficiency: 89.2%
                                </div>
                                <div className="text-sm text-gray-600">
                                  Max Speed: 31.8 km/h | Distance: 10.9 km
                                </div>
                              </div>
                            </div>

                            {/* Chart Placeholder */}
                            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                                <div className="text-lg font-medium text-gray-600">
                                  Performance Charts
                                </div>
                                <div className="text-sm text-gray-500">
                                  Interactive visualizations will be displayed
                                  here
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Crowd Analysis - Simplified */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Crowd Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="p-3 bg-orange-50 rounded-lg">
                                <div className="font-medium">
                                  Northern Stand
                                </div>
                                <div className="text-sm text-gray-600">
                                  14,250 / 15,000 (95.0%)
                                </div>
                                <div className="text-sm text-gray-600">
                                  Noise: 95.2 dB peak
                                </div>
                              </div>
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="font-medium">
                                  Southern Stand
                                </div>
                                <div className="text-sm text-gray-600">
                                  11,680 / 12,000 (97.3%)
                                </div>
                                <div className="text-sm text-gray-600">
                                  Noise: 92.8 dB peak
                                </div>
                              </div>
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="font-medium">Eastern Wing</div>
                                <div className="text-sm text-gray-600">
                                  7,080 / 8,000 (88.5%)
                                </div>
                                <div className="text-sm text-gray-600">
                                  Noise: 87.4 dB peak
                                </div>
                              </div>
                            </div>

                            {/* Crowd Chart Placeholder */}
                            <div className="h-48 bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg border-2 border-dashed border-purple-300 flex items-center justify-center">
                              <div className="text-center">
                                <Users className="w-10 h-10 mx-auto text-blue-400 mb-2" />
                                <div className="text-lg font-medium text-purple-600">
                                  Crowd Density Charts
                                </div>
                                <div className="text-sm text-purple-500">
                                  Stadium utilization and movement patterns
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Key Highlights */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Key Highlights
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                              <div className="font-medium">
                                00:03:45 - Opening Goal
                              </div>
                              <div className="text-sm text-gray-600">
                                Marcus Bontempelli scores with crowd eruption
                                (94% confidence)
                              </div>
                            </div>
                            <div className="p-3 bg-orange-50 border-l-4 border-orange-400">
                              <div className="font-medium">
                                00:18:23 - Spectacular Mark
                              </div>
                              <div className="text-sm text-gray-600">
                                Defensive mark leads to standing ovation (91%
                                confidence)
                              </div>
                            </div>
                            <div className="p-3 bg-purple-50 border-l-4 border-purple-400">
                              <div className="font-medium">
                                00:34:56 - Crucial Tackle
                              </div>
                              <div className="text-sm text-gray-600">
                                Game-changing defensive play (88% confidence)
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Analysis Summary */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Analysis Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-purple-200">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-purple-600" />
                                <span className="font-medium text-blue-800">
                                  Top Performer
                                </span>
                              </div>
                              <div className="text-sm text-purple-700">
                                Patrick Cripps leads with 88.6% efficiency and
                                strong defensive stats
                              </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-orange-600" />
                                <span className="font-medium text-orange-800">
                                  Crowd Impact
                                </span>
                              </div>
                              <div className="text-sm text-orange-700">
                                Southern Stand achieved 97.3% density with peak
                                engagement
                              </div>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                              <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-4 h-4 text-purple-600" />
                                <span className="font-medium text-purple-800">
                                  Match Flow
                                </span>
                              </div>
                              <div className="text-sm text-purple-700">
                                Q4 showed highest intensity with 5 goals and 89%
                                efficiency
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-white" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">
                                  Analysis Quality Score: 9.2/10
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  High-confidence analysis with 94.8% accuracy
                                  across all tracking metrics
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>

              {/* Download Options */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Download this analysis in different formats
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadFromQueue(selectedAnalysisItem, "pdf")
                    }
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadFromQueue(selectedAnalysisItem, "json")
                    }
                  >
                    <Download className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDownloadFromQueue(selectedAnalysisItem, "txt")
                    }
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    TXT
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setViewModalOpen(false)}
                    className="ml-4"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
