# AFL Analytics Dashboard – Junior Developer Guide

This guide explains the core parts of the frontend in simple terms, shows where things live, and how data flows through the app. Use this to get productive quickly.

## 1) What this app does (in plain English)
- Lets a user upload a match video
- Simulates analysis (player stats, crowd data, highlights)
- Shows results in charts and tables
- Lets the user export reports (TXT/JSON/PDF)
- Tracks uploads/processing in a queue so you can see progress

## 2) Where things are (folders you’ll touch)
- client/pages/AFLDashboard.tsx – The main dashboard page with tabs (Team, Performance, Crowd, Reports, Video)
- client/hooks/use-processing-queue.ts – Manages the processing queue (status, progress, retry/remove)
- client/hooks/use-video-analysis.ts – Handles video upload, fake analysis, and report export
- client/lib/report.ts – Turns analysis data into TXT/HTML and opens a printable PDF window; provides quick “insights” samples
- client/data/mock.ts – Mock data for players, matches, events, stadium zones, and time-series
- client/types/dashboard.ts – Shared types like QueueItem
- client/components/** – UI parts used by the dashboard (cards, lists, charts)

All paths above are relative to: Player_Tracking/afl_player_tracking_and_crowd_monitoring/frontend/

## 3) The big picture (how pieces work together)
1. AFLDashboard loads and sets up state for tabs, filters, and visuals.
2. useProcessingQueue creates queue state and helpers.
3. useVideoAnalysis is given setProcessingQueue so it can add/update queue items while uploading/analysing.
4. While analysis runs, AFLDashboard shows progress (and simulates background updates).
5. When done, users can export reports via useVideoAnalysis handlers.

## 4) Key types
- QueueItem (client/types/dashboard.ts)
  - id, name, analysisType
  - status: uploading | queued | processing | analyzing | completed | failed
  - progress (0–100)
  - duration, size
  - uploadTime, completedTime, estimatedCompletion
  - priority: low | medium | high
  - userId, processingStage, errorCount, retryCount
  - isUIControlled? (true when a UI flow drives progress exactly)

## 5) Hooks you’ll use

A) useProcessingQueue (client/hooks/use-processing-queue.ts)
- Purpose: Owns the list of queue items and simple actions.
- Returns:
  - processingQueue: QueueItem[] – current items
  - setProcessingQueue: React setState – update items
  - retryProcessing(itemId: string): sets item back to queued, resets progress
  - removeFromQueue(itemId: string): deletes an item from the queue

When to use: Any time you need to add/update/remove items in the queue, or support retry.

B) useVideoAnalysis (client/hooks/use-video-analysis.ts)
- Purpose: Handles video selection, simulated upload/analysis, and exports.
- Requires: setProcessingQueue from useProcessingQueue.
- Returns:
  - selectedVideoFile, isVideoUploading, videoUploadProgress
  - isVideoAnalyzing, videoAnalysisProgress, videoAnalysisComplete, videoAnalysisError
  - selectedAnalysisType, setSelectedAnalysisType
  - selectedFocusAreas
  - handleVideoFileSelect(event)
  - handleFocusAreaChange(area, checked)
  - uploadAndAnalyzeVideo() – drives: add queue item → upload progress → analysis progress → completed
  - handleDownloadReport(format: 'pdf'|'json'|'txt') – fetches mock backend data then exports
  - handleDownloadVideoClips() – exports a text summary of highlight clips

Common flow:
- User picks a file → handleVideoFileSelect
- Clicks Analyze → uploadAndAnalyzeVideo
- Progress shows in UI and queue
- When complete → handleDownloadReport or handleDownloadVideoClips

## 6) Utilities for reports (client/lib/report.ts)
- convertBackendDataToText(data): string – human-readable TXT report
- convertBackendDataToHTML(data): string – HTML snippet used for PDF window
- generateDashboardPDF(html): opens a new window with a styled report (user prints to PDF)
- generateDashboardInsights(): quick synthetic stats for players and crowd sections used in exports

Tip: In real projects, replace these with real API responses and a proper PDF generator.

## 7) Mock data (client/data/mock.ts)
- mockPlayers: sample players with stats
- matchEvents: sample event timeline (goals, marks, tackles)
- getStaticAFLCrowdZones(): fixed stadium sections with densities/positions
- generateTimelineFromStadiumData(zones): builds time-series from crowd zones
- teamMatchesData: sample matches with scores & team stats

Use these for charts, lists, and comparisons without real APIs.

## 8) Data flow end-to-end (simple mental model)
1) Select file → useVideoAnalysis validates type/size and stores it
2) Start analysis → adds QueueItem (status: uploading)
3) Upload progress → 0→100, flips to analyzing, then completes
4) Queue item updates to completed (progress: 100)
5) Export → create JSON/TXT/HTML then download or open printable report

## 9) Add something new (recipes)
A) Add a new analysis type (e.g., 'heatmap')
- UI: Add an option where selectedAnalysisType is set (page or panel control)
- In useVideoAnalysis: selectedAnalysisType already flows into the queue item and report
- Update any conditional UI that checks analysis type (labels, descriptions)

B) Push a new queue item from another feature
- Get setProcessingQueue from useProcessingQueue
- setProcessingQueue(prev => [{...yourItem}, ...prev])
- Do periodic progress updates, and switch status when complete

C) Export another format
- Extend handleDownloadReport: add a new format branch (e.g., CSV)
- Build content and download a Blob like the JSON flow

## 10) Troubleshooting (quick fixes)
- “Cannot access 'setProcessingQueue' before initialization”
  - Ensure useProcessingQueue() is called BEFORE useVideoAnalysis(setProcessingQueue) in a component.
- Nothing downloads on export
  - Browser blocked popups; allow popups for PDF. For JSON/TXT, ensure Blob and anchor logic runs (no errors in console).
- Progress never moves
  - For UI-driven uploads, isUIControlled should be true while your code is managing progress. The background simulator in AFLDashboard skips UI-controlled items.

## 11) Tips for contributing
- Keep AFLDashboard.tsx lean; push logic into hooks or lib files
- Reuse types from client/types to avoid drift
- Prefer small, focused components in client/components/**
- Start with mock data; swap in real APIs later

## 12) Glossary
- Queue item: one video processing task shown in the dashboard list
- Analysis type: what we compute (highlights, player, tactics, performance, crowd)
- Focus areas: extra filters/topics for an analysis run
- Export: download a file with analysis results (JSON/TXT/PDF)
