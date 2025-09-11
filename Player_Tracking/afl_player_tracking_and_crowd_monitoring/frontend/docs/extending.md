# Extending the Platform

Add a new analysis type (e.g., Heatmap)
- UI: add option where selectedAnalysisType is chosen (e.g., VideoUploadPanel)
- Flow: selectedAnalysisType is embedded in queue items and report payloads
- Update conditional labels or charts as needed

Wire a real backend
- Replace fetchBackendAnalysisData in useVideoAnalysis with a real API call
- Persist queue server-side and reconcile by id
- Secure uploads (pre-signed URLs), handle retries and resumable uploads
- Validate media server-side; map backend statuses to QueueItem fields

New export formats
- Extend handleDownloadReport: add new branch (e.g., CSV)
- Build content, create a Blob, trigger download like JSON path

Persist and restore queue across sessions
- On mount: hydrate from localStorage or fetch from API
- Periodically sync progress and stages from backend

Add charts or sections
- Use data from mock.ts initially; later switch to API
- Keep chart config in small, testable helpers

Deployment & observability
- Netlify: use netlify/functions for API shims and configure redirects
- Add Sentry for error monitoring and performance. Consider [Connect to Sentry](#open-mcp-popover).
- Track build size and vitest coverage in CI
