# Repository Guidelines

## Project Structure & Module Organization

GrowthBook is a Yarn workspaces monorepo. Core app code lives in `packages/front-end` (Next.js UI) and `packages/back-end` (Express API). Shared TypeScript utilities sit in `packages/shared`, enterprise code in `packages/enterprise`, while `packages/sdk-js` and `packages/sdk-react` house the public SDKs. The Python stats engine lives in `packages/stats` (Poetry-managed), and the documentation site resides in `docs`. Config templates (`.env.example`) ship with each package for local overrides.

## Build, Test, and Development Commands

- `yarn setup` installs workspace deps, builds shared artifacts, and primes the stats virtualenv.
- `yarn dev` runs front-end and back-end together with hot reload (`http://localhost:3000`, API on `:3100`).
- `yarn build` executes dependency builds then compiles the app; use before releasing.
- `yarn test`, `yarn type-check`, `yarn lint` cover monorepo Jest, TypeScript, and ESLint checks.
- `yarn workspace stats test|lint|build` targets the Python analytics engine pipelines.
- Docs preview: `cd docs && yarn dev` starts Docusaurus at `http://localhost:3200`.

## Coding Style & Naming Conventions

TypeScript and React code follow ESLint + Prettier defaults (2-space indent, semicolons, single quotes). Use `PascalCase` for components, `camelCase` for functions/variables, and `SCREAMING_SNAKE_CASE` for env keys. Prefer configured module aliases (`@back-end/...`, `@/components/...`) over deep relative imports. Python stats code is formatted with Black and linted via Flake8; keep identifiers snake_case.

## Testing Guidelines

Jest drives the Node packages; colocate specs in `test/` directories using `.test.ts` files. Run `yarn test` before pushing, or narrow scope with `yarn workspace <pkg> test`. The stats engine relies on PyTest through `yarn workspace stats test`. Add regression coverage alongside feature work and refresh mocked fixtures when APIs or schemas evolve.

## Commit & Pull Request Guidelines

Commits typically follow `MT-1234: short imperative summary`; include a ticket key when available and keep each commit focused. Ensure lint, type checks, and relevant tests succeed before pushing. Pull requests should link issues, explain intent, and flag rollout or config steps. Add screenshots or API samples when UI or behavior changes, and wait for passing CI before requesting review.

## Security & Configuration Tips

Never commit secrets; copy `.env.example` to `.env.local` within the package you touch and populate locally. Use Docker (`docker-compose up` or the documented `docker run` command) to provision MongoDB during development. Consult `SECURITY.md` for vulnerability reporting expectations.
