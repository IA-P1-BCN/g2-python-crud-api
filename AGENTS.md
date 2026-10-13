# AGENTS.md

Instructions for coding agents working in this repo. Do not duplicate the README.

## Project

Athletica is a monorepo: FastAPI API in `backend/`, React + Vite app in `frontend/`.

Backend layers: the **router** receives and responds, the **service** decides, the **repository** reads and writes, the **model** defines the table. Business rules live only in `services/`.

Users go through `app/repositories/user_repository.py`: services never query the `users` table themselves (a test enforces it). The other resources still keep their queries in their service.

## Stack

The versions that matter are declared in `backend/pyproject.toml` and `frontend/package.json`.

- **Backend:** Python 3.12+, FastAPI ≥0.115, SQLAlchemy 2, Alembic, PostgreSQL with psycopg 3, Pydantic v2 + pydantic-settings, PyJWT, pwdlib (Argon2). Dev: pytest + pytest-cov, ruff, pre-commit.
- **Frontend:** Node 22 LTS, React 18, Vite 5, TypeScript 5, Tailwind CSS v4 (tokens in `src/styles/theme.css`), React Router 6, TanStack Query 5, axios, lucide-react. Dev/test: Vitest + Testing Library, Playwright, ESLint, Prettier.

## Structure

```
backend/
├── app/
│   ├── api/            # routers (api/v1/) and deps.py
│   ├── core/           # config, security, logging, exceptions
│   ├── db/             # base, session, seed, init
│   ├── models/         # SQLAlchemy tables (one file per table)
│   ├── repositories/   # data access (SQL)
│   ├── schemas/        # Pydantic (one file per resource)
│   └── services/       # business rules
└── tests/{unit,integration}/

frontend/
├── src/
│   ├── api/            # the only place that talks HTTP
│   ├── auth/           # AuthContext, guards, roles
│   ├── components/ui/{atoms,molecules,organisms}/   # atomic design
│   ├── layouts/        # AppLayout, PublicLayout
│   ├── lib/            # cn, format, navigation, password, roles…
│   ├── pages/{admin,member,trainer,public}/
│   ├── sandbox/        # scratch page for quick checks
│   ├── styles/         # theme.css (design tokens)
│   └── types/          # schema.d.ts (generated) + api.ts (aliases)
└── tests/{unit,e2e}/

specs/                  # one spec per task, written before the code: `<issue>-<slug>.md`
docs/                   # Spanish docs: ai-log, design-tokens, errores, docker, memoria…
scripts/                # backlog generators
```

Component convention: `components/ui/<level>/<Name>/{Name.tsx, Name.test.tsx, index.ts}` (PascalCase folder, barrel export). Use the design tokens from `src/styles/theme.css`; no hex colours or arbitrary values.

## Commands

Run the checks for the side you changed (the README has the full first-time setup).

Backend, from `backend/`, with the virtualenv active:

- Install: `python3 -m venv .venv && source .venv/bin/activate && pip install -e ".[dev]"`, then `cp .env.example .env` (Windows: `.venv\Scripts\Activate.ps1`).
- Database: `alembic upgrade head` and `python -m app.db.seed` (first time or after pulling).
- Run: `uvicorn app.main:app --reload` → http://localhost:8000 (docs at `/docs`).
- Lint: `ruff check .` · Tests: `pytest`.

Frontend, from `frontend/`:

- Install: `npm install`, then `cp .env.example .env`.
- Run: `npm run dev` → http://localhost:5173.
- Lint / format: `npm run lint`, `npm run format:check`.
- Tests: `npm run test` (unit) and `npm run test:e2e` (Playwright).
- Build: `npm run build` · Regenerate API types: `npm run api:types`.

## Workflow (part 2)

One task = one session = one branch = one PR, and a human reviews before anything is merged.

1. **Spec first.** Write `specs/<issue>-<slug>.md` before the code.
2. **Agent.** Implement only that task, on that task's branch, following these rules.
3. **PR.** Open it to `dev` with the checks green (see "Pull request to `dev`").
4. **Human review.** The agent never merges on its own.

Keep `docs/ai-log.md` updated with what the agent was asked, what was accepted or rejected, and where it went wrong.

## Principles

- Follow **DRY** and **SOLID** strictly. Do not duplicate logic or mix layers.
- If a requirement, task, or design choice is ambiguous or confusing, **stop and ask**. Never decide, invent, or pick an option.

## What the agent must not do

- Never commit secrets or `.env`; those files are local only. Add new variables to `.env.example` with a fake value.
- Never create branches (they come from the board, always off `dev`); only `git fetch` and `git checkout`.
- Never merge, and never open a PR, without the human review first.
- Never skip, disable, or delete tests to make the suite pass; fix the cause instead.
- Never invent conventions, dependencies, or scope; if something is missing, stop and ask.
- Never touch files outside the task's side (`backend/` or `frontend/`) or its scope.

## Branches

Branches are created on GitHub Projects from the task, always off `dev`. Locally, only `git fetch` and `git checkout` that branch. Never create branches.

## Tasks

Board: https://github.com/orgs/IA-P1-BCN/projects/28

Work only the current issue. Read its title, body, and acceptance criteria with `gh issue view <number>`. Do not expand scope to sibling subtasks.

## Pull request to `dev`

When asked to open a PR to `dev`, review first. Do not open the PR until that review is done, and do not "fix" scope on your own.

1. Compare the diff to the issue's acceptance criteria and to these rules (DRY, SOLID, layering, conventions below).
2. Report any gap and ask before continuing.
3. Run the checks for the side that changed:
   - `backend/`: `ruff check .` and `pytest`
   - `frontend/`: `npm run lint`, `npm run format:check`, `npm run test`, and `npm run build`

## Conventions

- Code, names, and comments in English. Documentation in Spanish.
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) (`feat(bookings): ...`, `fix: ...`, `test: ...`, `docs: ...`, `refactor: ...`, `chore: ...`).
- Backend dependencies: add them in `backend/pyproject.toml`, then `pip install -e ".[dev]"`. Never `pip install` a package on its own.
- Frontend dependencies: add them in `frontend/package.json` and update the lockfile.
- Never commit `.env`. If you add a variable, also add it to `.env.example` with a fake value.
- Touch only the side the task requires (`backend/` or `frontend/`).
