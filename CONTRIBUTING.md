# Cómo contribuir a Athletica

Este documento recoge lo acordado en el issue #49 y actualiza lo que aparecía resumido
en el README. Las reglas para agentes de IA están en [AGENTS.md](AGENTS.md), que se
enlaza aquí y no se copia.

## Antes de empezar

1. Abre el tablero **Project 28** y coge una tarea asignada.
2. Asígnatela en GitHub y lee sus criterios de aceptación (`gh issue view <n>`).
3. Una tarea = una rama = un PR. No mezcles cambios de varias tareas en el mismo PR.

## Rama

- Siempre desde `dev`. Forma de crearla:
  - en GitHub, desde la tarea: **Create a branch**, base `dev`;
  - o con la CLI: `gh issue develop <n> --base dev --checkout`.
- El nombre que se genera queda como `<número>-<título>` (por ejemplo
  `414-social-login-with-oauth2-google-or-github`).
- En local solo `git fetch` y `git checkout`; nunca crees ramas a mano.

## Spec primero

Antes del código, escribe `specs/<número>-<slug>.md`. Hay ejemplos en `specs/`
(`398-oauth2-password-flow.md`, `403-user-repository.md`).

## Commits

[Conventional Commits](https://www.conventionalcommits.org/) en inglés, con scope
entre paréntesis:

- `feat(auth): ...`
- `fix: ...`
- `test(auth): ...`
- `docs: ...`
- `refactor: ...`
- `chore: ...`

## Comprobaciones antes del PR

Ejecuta las comprobaciones del lado que tocas:

- **Backend** (desde `backend/`): `ruff check .` y `pytest`.
- **Frontend** (desde `frontend/`): `npm run lint`, `npm run format:check`,
  `npm run test` y `npm run build`.

## `docs/ai-log.md`

Cada PR de la parte 2 añade su entrada, según la plantilla que hay al principio del
archivo: fecha, persona y modelo, spec, prompt clave, qué se aceptó, qué se rechazó
y por qué, errores del agente y cómo se corrigieron, y revisión humana.

Si al abrir el PR hay conflicto en `docs/ai-log.md`, resuélvelo dejando **primero
las entradas de `dev` y después la tuya**.

## Revisión

- Si hay alguien conectado, añádelo en **Reviewers**. Esa persona aprueba con un
  comentario y fusiona.
- Si no, revisa tú tu PR (`Files changed` → `Review changes` → **Comment**) antes de
  fusionar.
- En los dos casos, mira con cuidado la seguridad: contraseñas, JWT, secretos y
  permisos.

## Revisión con IA

Cada PR recibe un comentario automático **AI review** (Gemini). Solo orienta: no
aprueba ni bloquea, y no sustituye la revisión humana.

## Pull request a `dev`

- Con la plantilla del repositorio ( `Closes #N` y checklist).
- CI en verde.
- Un PR pequeño (una historia o menos).
- No fusiones sin revisión humana.

## Secretos

- `.env` nunca se sube.
- Una variable nueva va también a `.env.example`, con valor ficticio.

## Idioma

- Código, ramas, commits y PR en **inglés**.
- Documentación y tablero en **español**.

## Agentes de IA

Las reglas para agentes están en [AGENTS.md](AGENTS.md). Enlazarlo desde aquí evita
copiarlas y que se desincronicen.