# Contributing

## Getting Started

1. Fork the repository
2. Clone your fork
3. Run `npm install`
4. Copy `.env.example` to `.env` and fill in your Supabase credentials
5. Run `npm run dev` to start the development server

## Code Style

- This project uses plain JSX with React 18 (no TypeScript)
- Use functional components with hooks
- Inline styles only (no CSS files)
- All text content rendered via JSX expressions (no dangerouslySetInnerHTML)

## Pull Request Process

1. Keep changes focused and atomic
2. Update the README if introducing new features
3. Verify the build passes: `npm run build`
4. Ensure no new `pg` or server-side dependencies are added to package.json

## Commit Messages

Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
