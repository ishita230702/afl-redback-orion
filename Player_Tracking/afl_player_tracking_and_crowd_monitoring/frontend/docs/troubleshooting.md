# Troubleshooting

Hook order error
- Error: Cannot access 'setProcessingQueue' before initialization
- Fix: Call useProcessingQueue() before useVideoAnalysis(setProcessingQueue)

Exports not downloading
- PDF: allow popups; generateDashboardPDF opens a window and calls print()
- JSON/TXT: ensure Blob + anchor click runs; check console for errors

Progress never changes
- For UI-driven items set isUIControlled: true; the background simulator only touches non-UI-controlled items

Auth redirect loop
- Ensure localStorage isAuthenticated === 'true' and userEmail is set after login

Chart layout issues
- Check container sizes (ResponsiveContainer) and Tailwind classes

Build fails
- Run typecheck and test; fix TS errors first
- Clear node_modules and pnpm store if necessary and reinstall
