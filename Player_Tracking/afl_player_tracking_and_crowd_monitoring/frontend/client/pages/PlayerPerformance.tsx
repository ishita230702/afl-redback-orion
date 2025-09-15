import PlayerPerformanceTab from "@/components/dashboard/tabs/PlayerPerformanceTab";
import { useDashboardState } from "@/hooks/useDashboardState";

export default function PlayerPerformance() {
  const {
    selectedPlayer,
    setSelectedPlayer,
    comparisonPlayer,
    setComparisonPlayer,
    searchTerm,
    setSearchTerm,
    selectedTeam,
    setSelectedTeam,
    filteredPlayers,
    availableTeams,
    performanceTrendData,
    playerComparisonData,
  } = useDashboardState();

  return (
    <div className="min-h-screen bg-gray-50">
      <PlayerPerformanceTab
        selectedPlayer={selectedPlayer}
        setSelectedPlayer={setSelectedPlayer}
        comparisonPlayer={comparisonPlayer}
        setComparisonPlayer={setComparisonPlayer}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        filteredPlayers={filteredPlayers}
        availableTeams={availableTeams}
        performanceTrendData={performanceTrendData}
        playerComparisonData={playerComparisonData}
      />
    </div>
  );
}


