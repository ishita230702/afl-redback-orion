# Conventions & Code Style

General
- TypeScript everywhere; keep types in client/types when shared
- Prefer small, focused hooks and components; keep pages thin
- Avoid duplication; extract shared logic to client/lib or hooks

React
- Use functional components and hooks
- Order hooks top-to-bottom; avoid conditional hooks
- Custom hooks: prefix with use-, return stable API objects

State
- Local state via useState/useMemo/useEffect
- Central queue state via useProcessingQueue; pass setProcessingQueue to dependents

Styling & UI
- Tailwind utility classes; keep classNames readable
- Use components/ui primitives and dashboard components for composition

Testing & quality
- Run pnpm test and pnpm typecheck before commit
- Prefer pure helpers in client/lib for easy unit tests

Naming & files
- kebab-case for files, PascalCase for components, camelCase for variables
- Co-locate component styles and helpers when only used there

Error handling
- Show clear user messages for validation/download issues
- Never swallow errors silently; log to console in dev

Performance
- Wrap expensive calculations with useMemo
- Use React.Suspense patterns if introducing async components later
