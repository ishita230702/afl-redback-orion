# Architecture Overview

Project Root (frontend)
- client/pages/AFLDashboard.tsx: Main dashboard with tabs and data visualizations
- client/hooks/use-processing-queue.ts: Queue state and actions (retry/remove)
- client/hooks/use-video-analysis.ts: Upload + simulated analysis + report export
- client/lib/report.ts: TXT/HTML generation and printable PDF window; insights generator
- client/data/mock.ts: Players, matches, events, crowd zones, timeline
- client/types/dashboard.ts: Shared types (QueueItem)
- client/components/dashboard/*: Reusable dashboard UI blocks (filters, lists, charts)
- server/*: Express server entry and serverless function wiring (demo)

State management
- Local React state/hook-based
- Queue: useProcessingQueue controls items and mutations
- Video flow: useVideoAnalysis drives item lifecycle via setProcessingQueue

Routing
- React Router: pages under client/pages (e.g., Login.tsx, AFLDashboard.tsx)
- Auth gate: AFLDashboard checks localStorage flags and redirects to Login

Styling & UI
- TailwindCSS for utility styles
- Radix UI primitives via shadcn-like components in client/components/ui
- Recharts for charts

Build & runtime
- Vite for dev/build
- Server build: vite.config.server.ts produces dist/server/node-build.mjs
- Netlify function (netlify/functions/api.ts) available for API demos

Key conventions
- Keep page components thin; push logic to hooks/lib
- Co-locate reusable UI in client/components/**
- Use types from client/types to avoid drift
- Avoid hard-coded, one-off logic inside pages
