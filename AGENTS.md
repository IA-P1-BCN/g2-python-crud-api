# AGENTS.md

Instructions for coding agents working in this repo. Do not duplicate the README.

## Project

GymFlow is a monorepo: FastAPI API in `backend/`, React + Vite app in `frontend/`.

Backend layers: the **router** receives and responds, the **service** decides, the **model** persists. Business rules live only in `services/`.

## Principles

- Follow **DRY** and **SOLID** strictly. Do not duplicate logic or mix layers.
- If a requirement, task, or design choice is ambiguous or confusing, **stop and ask**. Never decide, invent, or pick an option.

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
