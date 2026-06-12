# @iankibetsh/sh-core

Core JS layer for the sh frameworks family. UI-library free (no Bootstrap, no Tailwind) — only sweetalert2 for notifications/dialogs. UI packages layer on top:

- `@iankibetsh/shframework` (v6+) — Bootstrap 5 components (ShTable, ShForm, ...)
- `@iankibetsh/sh-tailwind` (planned) — Tailwind components

## What's inside

- **API client** — single axios instance with request/response interceptors, configurable free (public) endpoints and central 401 handling. `shApis.doGet/doPost/doPut/doPatch/doDelete` keep the classic signatures.
- **Auth strategies** —
  - `bearer` (default): token kept in memory + sessionStorage (`tokenStorage: 'memory' | 'session' | 'local'`). Existing v5 tokens in localStorage are migrated automatically on first request.
  - `cookie`: Laravel Sanctum SPA mode — httpOnly session cookie set by the server, automatic CSRF (`sanctum/csrf-cookie`), `withCredentials`. No token ever stored in JS.
- **`useAuth()`** composable — `login`, `logout`, `fetchUser`, `isAllowedTo`, `user`.
- **Pinia stores** — `useUserStore` (id `user-store`), `useAppStore` (id `sh-app`).
- **Streamline** — `useStreamline`, `getActionUrl` and the IndexedDB cache, built in (successor of `@iankibetsh/vue-streamline`). Auth rides on the shared client; no manual headers needed.
- **Notifications** — `swalSuccess`, `swalError`, `swalHttpError`, `showToast`, `confirmAction`, `runPlainRequest`.
- **Helpers** — `shRepo` aggregate, `shStorage`, `formatDate`/`formatNumber`, session timeout handling, `v-if-user-can` directive.

## Install

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ShCore } from '@iankibetsh/sh-core'

const app = createApp(App)
app.use(createPinia())
app.use(ShCore, {
    baseApiUrl: import.meta.env.VITE_APP_API_URL,
    authMode: 'bearer',        // or 'cookie' for Sanctum SPA
    tokenStorage: 'session',   // 'memory' | 'session' | 'local'
    sessionTimeout: 400,       // minutes
    loginUrl: '/sh-auth',
    streamlineUrl: '/api/streamline',
    enableCache: true
})
```

### Cookie (Sanctum SPA) mode

```js
app.use(ShCore, {
    baseApiUrl: 'https://api.example.test',
    authMode: 'cookie',
    csrfEndpoint: 'sanctum/csrf-cookie'
})
```

Backend requirements: `SANCTUM_STATEFUL_DOMAINS` includes the SPA host, session driver configured and `supports_credentials: true` in CORS config.

## Migration notes (from shframework v5 core)

- Tokens move from localStorage `access_token` to sessionStorage (auto-migrated). sessionStorage is per-tab; pass `tokenStorage: 'local'` if you need multi-tab continuity.
- `doDelete(endpoint, data)` now correctly sends `data` as the request body.
- Session timer no longer starts on import; it starts when the plugin receives `sessionTimeout` or after `login()`.
