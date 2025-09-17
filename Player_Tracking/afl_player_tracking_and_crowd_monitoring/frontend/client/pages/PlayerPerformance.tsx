import React from "react";
import PlayerPerformanceTab from "@/components/dashboard/tabs/PlayerPerformanceTab";
import { useDashboardState } from "@/hooks/useDashboardState";

export default function PlayerPerformance() {
  const dashboardState = useDashboardState();

  return (
    <div className="min-h-screen bg-gray-50">
      <PlayerPerformanceTab uploadId={dashboardState.uploadId} />
    </div>
  );
}
