# Data & Types

Types
- QueueItem (client/types/dashboard.ts): lifecycle for a processing task
  - status: uploading | queued | processing | analyzing | completed | failed
  - progress (0–100), processingStage, retry/error counts, isUIControlled

Mock data (client/data/mock.ts)
- mockPlayers: name, team, position, stats
- matchEvents: timeline of in-game events
- getStaticAFLCrowdZones(): section capacity/current/density and absolute positioning
- generateTimelineFromStadiumData(zones): returns a time-series array for charts
- teamMatchesData: multiple matches with detailed stats for both teams

Report utilities (client/lib/report.ts)
- convertBackendDataToText(data)
- convertBackendDataToHTML(data)
- generateDashboardPDF(html)
- generateDashboardInsights(): synthetic players/crowd data for demos
