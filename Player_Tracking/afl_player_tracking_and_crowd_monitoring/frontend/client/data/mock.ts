export const mockPlayers = [
  { id: 1, name: "Marcus Bontempelli", team: "Western Bulldogs", position: "Midfielder", kicks: 28, handballs: 12, marks: 8, tackles: 6, goals: 2, efficiency: 87 },
  { id: 2, name: "Dustin Martin", team: "Richmond", position: "Forward", kicks: 22, handballs: 8, marks: 6, tackles: 4, goals: 3, efficiency: 82 },
  { id: 3, name: "Patrick Dangerfield", team: "Geelong", position: "Midfielder", kicks: 25, handballs: 15, marks: 7, tackles: 8, goals: 1, efficiency: 84 },
  { id: 4, name: "Max Gawn", team: "Melbourne", position: "Ruckman", kicks: 18, handballs: 6, marks: 10, tackles: 3, goals: 1, efficiency: 78 },
];

export const matchEvents = [
  { time: "1:32", event: "GOAL", player: "Charlie Curnow", team: "Carlton", description: "Beautiful mark and goal from 30m out" },
  { time: "3:45", event: "BEHIND", player: "Taylor Walker", team: "Adelaide", description: "Shot from the boundary line" },
  { time: "5:12", event: "MARK", player: "Jeremy McGovern", team: "West Coast", description: "Spectacular defensive mark" },
  { time: "7:22", event: "TACKLE", player: "Clayton Oliver", team: "Melbourne", description: "Crucial tackle in defensive 50" },
];

export const generateTimelineFromStadiumData = (crowdZones: { current: number; density: number }[]) => {
  const currentAttendance = crowdZones.reduce((sum, zone) => sum + zone.current, 0);
  const currentDensity = Math.round(
    crowdZones.reduce((sum, zone) => sum + zone.density, 0) / crowdZones.length,
  );
  const currentCritical = crowdZones.filter((zone) => zone.density >= 95).length;
  const currentHigh = crowdZones.filter((zone) => zone.density >= 85 && zone.density < 95).length;
  return [
    { time: "12:00", attendance: Math.round(currentAttendance * 0.6), density: Math.round(currentDensity * 0.7), critical: 0, high: Math.max(0, currentHigh - 2) },
    { time: "13:00", attendance: Math.round(currentAttendance * 0.7), density: Math.round(currentDensity * 0.8), critical: Math.max(0, currentCritical - 1), high: Math.max(0, currentHigh - 1) },
    { time: "14:00", attendance: Math.round(currentAttendance * 0.8), density: Math.round(currentDensity * 0.85), critical: Math.max(0, currentCritical - 1), high },
    { time: "15:00", attendance: Math.round(currentAttendance * 0.9), density: Math.round(currentDensity * 0.9), critical: currentCritical, high: currentHigh },
    { time: "16:00", attendance: currentAttendance, density: currentDensity, critical: currentCritical, high: currentHigh },
    { time: "17:00", attendance: Math.round(currentAttendance * 0.95), density: Math.round(currentDensity * 0.95), critical: Math.max(0, currentCritical - 1), high: currentHigh },
    { time: "18:00", attendance: Math.round(currentAttendance * 0.85), density: Math.round(currentDensity * 0.9), critical: Math.max(0, currentCritical - 1), high: Math.max(0, currentHigh - 1) },
  ];
};

export const getStaticAFLCrowdZones = () => [
  { zone: "Northern Stand", capacity: 15000, current: 14250, density: 95, trend: "stable", color: "#dc2626", position: { top: "5%", left: "25%", width: "50%", height: "15%" } },
  { zone: "Southern Stand", capacity: 12000, current: 10800, density: 90, trend: "up", color: "#f97316", position: { bottom: "5%", left: "25%", width: "50%", height: "15%" } },
  { zone: "Eastern Wing", capacity: 8000, current: 3200, density: 40, trend: "down", color: "#22c55e", position: { top: "25%", right: "5%", width: "15%", height: "50%" } },
  { zone: "Western Wing", capacity: 8000, current: 7200, density: 90, trend: "stable", color: "#f97316", position: { top: "25%", left: "5%", width: "15%", height: "50%" } },
  { zone: "Northeast Corner", capacity: 5000, current: 2750, density: 55, trend: "up", color: "#eab308", position: { top: "15%", right: "15%", width: "20%", height: "20%" } },
  { zone: "Northwest Corner", capacity: 5000, current: 4750, density: 95, trend: "stable", color: "#dc2626", position: { top: "15%", left: "15%", width: "20%", height: "20%" } },
  { zone: "Southeast Corner", capacity: 5000, current: 3750, density: 75, trend: "down", color: "#f59e0b", position: { bottom: "15%", right: "15%", width: "20%", height: "20%" } },
  { zone: "Southwest Corner", capacity: 5000, current: 1500, density: 30, trend: "stable", color: "#22c55e", position: { bottom: "15%", left: "15%", width: "20%", height: "20%" } },
];

export const teamMatchesData = [
  {
    id: 1,
    round: "Round 12",
    venue: "MCG",
    date: "2025-07-02",
    teams: { home: "Western Bulldogs", away: "Richmond" },
    stats: {
      home: { goals: 12, behinds: 8, disposals: 368, marks: 86, tackles: 57, clearances: 34, inside50: 55, efficiency: 76 },
      away: { goals: 10, behinds: 11, disposals: 341, marks: 73, tackles: 62, clearances: 31, inside50: 49, efficiency: 72 },
    },
  },
  {
    id: 2,
    round: "Round 12",
    venue: "Marvel Stadium",
    date: "2025-07-03",
    teams: { home: "Geelong", away: "Collingwood" },
    stats: {
      home: { goals: 14, behinds: 7, disposals: 402, marks: 90, tackles: 51, clearances: 39, inside50: 61, efficiency: 79 },
      away: { goals: 9, behinds: 12, disposals: 359, marks: 77, tackles: 66, clearances: 30, inside50: 47, efficiency: 71 },
    },
  },
  {
    id: 3,
    round: "Round 13",
    venue: "Adelaide Oval",
    date: "2025-07-10",
    teams: { home: "Adelaide", away: "Port Adelaide" },
    stats: {
      home: { goals: 11, behinds: 13, disposals: 372, marks: 81, tackles: 64, clearances: 37, inside50: 58, efficiency: 73 },
      away: { goals: 12, behinds: 10, disposals: 365, marks: 75, tackles: 59, clearances: 35, inside50: 54, efficiency: 75 },
    },
  },
];
