# Makez Frontend v2

A multi-tenant document processing and data management platform built with React 19.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19, TypeScript 5.7, React Router 7.5 |
| Build | Vite 6.2 |
| Styling | Tailwind CSS 4.0 |
| State | Zustand 5.0 (global), Context API (module-level) |
| HTTP | Fetch wrapper (`global-utils/httpRequest.ts`), Axios |
| Auth | Azure MSAL, Google OAuth |
| Testing | Vitest, React Testing Library |
| Docs | Storybook 9.0 |

## Project Structure

```
src/
├── assets/           # SVG icons, static assets
├── builders/         # UI builders (form, table, excel)
├── components/       # Reusable UI components
├── config/           # Environment config (default.ts)
├── global-utils/     # HTTP requests, utilities
├── hooks/            # Custom React hooks
├── modules/          # Feature modules
│   ├── auth/         # Login, signup, SSO
│   ├── config/       # Users, roles, tenants, modules
│   ├── docsnap/      # Document management
│   ├── transcript/   # Transcription
│   └── ...
├── router/           # Route definitions
├── zustand-store/    # Global state stores
└── main.tsx          # Entry point
```

## Essential Commands

```bash
# Development
npm run dev           # Start dev server (port 5173)

# Build
npm run build         # TypeScript check + Vite build

# Testing
npm run test          # Run Vitest in watch mode
npm run test:run      # Single test run
npm run test:coverage # Run with coverage report

# Code Quality
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix lint issues
npm run format        # Prettier format

# Documentation
npm run storybook     # Component docs (port 6006)
```

## Key Files

| Purpose | Location |
|---------|----------|
| HTTP wrapper | `global-utils/httpRequest.ts:1-105` |
| Environment config | `config/default.ts:1-53` |
| Permission system | `zustand-store/PermissionStore.ts:30-179` |
| Auth store | `modules/auth/AuthStore.ts:1-15` |
| Route definitions | `router/authenticated-routes/index.tsx:1-84` |
| Toast notifications | `components/toast/ToastStore.ts:1-80` |
| Test setup | `src/test/setup.ts` |

## Quick Reference

### Creating a new API call

Use the centralized HTTP wrapper with automatic auth headers:
- Reference: `global-utils/httpRequest.ts:16-60`
- Example usage: `transcriptStore.ts:60-75`

### Adding a new Zustand store

Follow existing store patterns:
- Simple store: `modules/auth/AuthStore.ts:1-15`
- API-integrated store: `zustand-store/transcriptStore.ts:43-95`

### Adding a new module

1. Create folder in `src/modules/`
2. Add route in `router/authenticated-routes/index.tsx`
3. Add permissions in `zustand-store/PermissionStore.ts`

### Toast notifications

```typescript
// In component
const toast = useToastStore();
toast.success('Message');

// Outside React
useToastStore.getState().error(error.message);
```

### Permission-based rendering

Components accept `permission` prop: `components/Button.tsx:14`

## Environment Variables

Development APIs configured in `.env`. Key variables:
- `VITE_NODE_ENV` - Environment: local/development/production
- `VITE_BASE_URL_*` - API base URLs per environment
- `VITE_AZURE_CLIENT_ID` - Azure SSO
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth

## Testing

- Coverage threshold: 80% (branches, functions, lines)
- Test location: `src/components/__tests__/`
- Config: `vite.config.ts:20-50`

## Additional Documentation

Check these files when working on specific topics:

| Topic | File |
|-------|------|
| Architectural patterns, conventions, state management | `.claude/docs/architectural_patterns.md` |
| Component examples | `src/components/__stories__/` |
| Test examples | `src/components/__tests__/` |
