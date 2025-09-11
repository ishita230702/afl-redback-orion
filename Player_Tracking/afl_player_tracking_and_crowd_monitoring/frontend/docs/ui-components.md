# UI Components Map

Dashboard components (client/components/dashboard)
- ProcessingQueueList.tsx – Renders queue items, actions (view/download/retry/remove)
- QueueStatusIcon.tsx – Visual status indicator for queue items
- VideoUploadPanel.tsx – File input, analysis options, progress
- AnalysisResultsPanel.tsx – Post-analysis charts/metrics
- TeamMatchFilters.tsx – Search/filter controls for team matches
- TeamMatchCompare.tsx – Compare two teams across key stats
- TeamCompareBar.tsx – Small bar comparison widget
- PlayerComparison.tsx – Player stats comparison chart

Downloads tab
- Implemented directly in AFLDashboard.tsx with buttons to export Player, Team, and Crowd PDFs

Auth & Landing (client/components/auth)
- HeaderBrand.tsx – App brand and badges
- FeatureCards.tsx – Highlights features (Player Performance, Crowd Monitoring, Advanced Analytics, Video Analysis)
- DemoAccessCard.tsx – Prefills demo credentials
- AuthProviderButtons.tsx – Google/Apple buttons
- LoginForm.tsx – Email/password fields, remember me, show/hide password

UI primitives (client/components/ui)
- button.tsx, input.tsx, label.tsx, badge.tsx, card.tsx, tabs.tsx, progress.tsx, separator.tsx, dialog.tsx, dropdown-menu.tsx
