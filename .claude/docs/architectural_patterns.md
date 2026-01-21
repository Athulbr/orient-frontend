# Architectural Patterns

This document describes the core architectural patterns and conventions used throughout the Makez frontend codebase.

## State Management Architecture

### Global State with Zustand

The application uses Zustand as the primary state management solution. Stores are located in `src/zustand-store/`.

**Store Interface Pattern** - All stores define a TypeScript interface with state and actions:
- `zustand-store/PermissionStore.ts:7-28` - Permission state interface
- `zustand-store/extractionStore.ts:18-34` - Extraction queue interface
- `zustand-store/transcriptStore.ts:25-42` - Transcript CRUD interface

**Store Creation Pattern** - Stores use `create<Interface>((set, get) => ({...}))`:
- `zustand-store/PermissionStore.ts:30-179`
- `zustand-store/extractionStore.ts:36-155`
- `modules/auth/AuthStore.ts:7-15`

**Store Categories:**
1. **Simple getter/setter stores** - Basic state with setters (AuthStore, PermissionStore)
2. **API-integrated stores** - Async CRUD with loading states (`transcriptStore.ts:60-95`)
3. **Queue/tracking stores** - Progress tracking (`extractionStore.ts`)

### Module-Level State with Context API

For state scoped to a feature module, Context API wraps related components:
- `modules/auth/login/hooks/LoginPageStateProvider.ts:1-19`
- Pattern: `createContext` + custom hook wrapper + Provider component

### Session Storage for Persistence

Authentication and user context stored in sessionStorage:
- `accessToken` - JWT token
- `user`, `role`, `permissions` - User context
- `selectedTenant`, `selectedModule`, `selectedRole` - Current selection
- `tablebuilder`, `formbuilder`, `templates` - Builder configs

## HTTP Request Pattern

### Centralized Fetch Wrapper

All API calls go through `global-utils/httpRequest.ts:1-105`:
- Bearer token from sessionStorage
- Tenant/role/module headers added automatically
- 20-minute timeout via AbortController
- Status-specific error handling (401 triggers logout)
- Client error logging to backend

**Usage in stores** - `transcriptStore.ts:60-95`:
```
const res = await httpRequest('POST', `${config.nodeApiUrl}/idp/transcript/create`, payload);
```

### Server-Sent Events (SSE)

For streaming responses: `extractionStore.ts:88-154` - `processStream()` method
- Parses SSE format (`data: {json}`)
- Updates queue state incrementally

## Permission-Based Access Control

### Permission Store

`zustand-store/PermissionStore.ts:30-179`:
- `checkPermission(permission)` - Check if user has permission
- `checkRolePermission(permission)` - Role-based check
- Dynamic sidebar generation based on permissions
- Superadmin bypass for all permissions

### Component-Level Permissions

Components accept `permission` prop for conditional rendering:
- `components/Button.tsx:14` - Permission prop in interface
- `components/Button.tsx:132` - Permission check before render

## Component Patterns

### Props Interface Convention

All component props extend HTML attributes and use `IF` suffix:
- `components/Button.tsx:5-18` - ButtonPropsIF
- `components/TextField.tsx` - TextFieldPropsIF

### Composition Pattern

Modules compose multiple sub-components:
- `modules/config/user/list-user/index.tsx:1-44`
- Pattern: Page wraps List, Create, Edit components with shared state via Context

### Material-UI Style Effects

Custom ripple animation in Button:
- `components/Button.tsx:160-174` - CSS animation injected at runtime

## Module Organization

Each feature module in `src/modules/` contains:
```
module-name/
├── components/     # UI components
├── hooks/          # Business logic, API calls
├── interfaces/     # TypeScript types
└── index.tsx       # Entry point with state setup
```

Examples:
- `modules/auth/` - Authentication flows
- `modules/config/` - Admin configuration
- `modules/docsnap/` - Document management

## Routing Architecture

### Two-Tier Routing

- `router/index.tsx:1-18` - Root router with auth check
- `router/authenticated-routes/index.tsx:1-84` - Protected routes

**Auth Check Pattern:**
- Token existence in sessionStorage determines authenticated state
- Lazy-loaded route modules with Suspense
- Permission-based module access

## Toast Notification System

### Centralized Toast Store

`components/toast/ToastStore.ts:1-80`:
- `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`
- Auto-dismiss with configurable duration

**Usage:**
- In components: `const toast = useToastStore(); toast.success('Message');`
- Outside React: `useToastStore.getState().error(error.message);`

## Environment Configuration

### Multi-Environment Config

`config/default.ts:1-53`:
- `local`, `development`, `production`, `rehab` environments
- Environment selected via `VITE_NODE_ENV`
- API URLs from environment variables

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `TextField.tsx` |
| Utilities | camelCase | `httpRequest.ts` |
| Stores | camelCase + Store | `PermissionStore.ts` |
| Interfaces | Suffix `IF` | `ButtonPropsIF`, `UserStateIF` |
| Tests | Same name + `.test.tsx` | `Button.test.tsx` |

## Error Handling Pattern

1. **Try-catch in async** - All async operations wrapped
2. **Toast for user feedback** - `useToastStore.getState().error(error.message)`
3. **Client logging** - Errors logged via `global-utils/clientLog.ts`
4. **HTTP status handling** - Specific handling for 401, 403, 404, 409, 500, 504

## Custom Hooks

Located in `src/hooks/`:
- `useBackButtonOverride.ts` - Override browser back navigation
- `useEscapeKey.ts` - Handle Escape key press
- `useTablepersistance.ts` - Sync table state with URL params
- `useToggleHook.ts` - Simple boolean toggle
