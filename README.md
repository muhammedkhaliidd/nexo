# Nexo

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

Nx monorepo: **user-app** (Angular SSR + Capacitor-ready), **admin-app** (Angular SSR), **api** (NestJS), and shared libraries (`shared-types`, `shared-auth`, `shared-ui`). UI stack: **Tailwind CSS** + **PrimeNG**.

## Prerequisites

- Node.js (LTS recommended) and npm

## Quick start

```sh
npm install
npm run start:user     # http://localhost:4200
npm run start:admin    # http://localhost:4300
npm run start:api      # API at http://localhost:3333/ and http://localhost:3333/api
```

Run **all three** dev servers in one terminal (logs prefixed by project):

```sh
npm run start-all
```

Capacitor (after a user-app build):

```sh
npm run cap:sync:user
```

### API ports

- Default API port is **3333** (`PORT` in `apps/api/src/main.ts`).
- `npm run start:api:3333` forces `PORT=3333` (same as default; useful if `PORT` is set globally).

### Docs

Architecture notes: [docs/two_apps_architecture_plan.md](docs/two_apps_architecture_plan.md).

---

## Nx workspace

Run `npx nx graph` to explore projects and dependencies.

| Task | Command |
|------|---------|
| Serve user app | `npx nx serve user-app` |
| Serve admin app | `npx nx serve admin-app` |
| Serve API | `npx nx serve api` |
| Build user app | `npx nx build user-app` |
| Project details | `npx nx show project user-app` |

More: [Nx: running tasks](https://nx.dev/features/run-tasks) · [Angular monorepo tutorial](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial)

## Add new projects

```sh
npx nx g @nx/angular:app demo
npx nx g @nx/angular:lib mylib
```

Use `npx nx list` for installed plugins, or [Nx Console](https://nx.dev/getting-started/editor-setup) in your editor.

## CI (optional)

- `npx nx connect` — Nx Cloud
- `npx nx g ci-workflow` — workflow stub

## Community

- [Discord](https://go.nx.dev/community) · [Nx blog](https://nx.dev/blog)
