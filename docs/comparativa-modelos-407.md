# Comparativa de dos modelos gratuitos (#407)

Entregable del nivel Medio: la **misma tarea**, con la **misma spec** y el **mismo prompt**,
ejecutada por dos modelos gratuitos de OpenCode. Aquí se documentan la tarea, el prompt exacto,
los resultados y la conclusión.

- **Fecha:** 16 de octubre de 2026.
- **Modelos:** pendiente de elección (ver «Modelos» más abajo).
- **Alcance del código:** ninguno se fusiona: la comparación es el entregable. Los worktrees
  se descartan tras medir.

## Modelos

| | Modelo A | Modelo B |
| --- | --- | --- |
| Identificador | `opencode/mimo-v2.6-flash-free` | `opencode/deepseek-v4.1-flash-free` |
| Rol | baseline (el modelo del proyecto) | contrincante |

Ambas ejecuciones arrancaron a la vez (14:14:40), en paralelo, cada una en su propio
worktree con las dependencias ya instaladas. Los checks fueron **re-ejecutados y verificados
por la revisión humana** después, no solo certificados por cada agente.

## Tarea (misma spec para ambos)

Implementar la molécula **`ConfirmDialog`**: un diálogo de confirmación controlado que
sustituiría los `window.confirm` actuales del panel de administración. Es pequeña, objetiva
y con checks automáticos medibles.

### Especificación

**Contrato (props)**

- `isOpen: boolean` — controlada; con `false` no se pinta nada.
- `onClose: () => void` — se llama con Escape, clic en el fondo o botón «Cancelar».
- `onConfirm: () => void` — se llama con el botón de confirmar.
- `title: ReactNode` (obligatorio), `description?: ReactNode`.
- `confirmLabel?: string` (por defecto «Confirmar»), `cancelLabel?: string` («Cancelar»).
- `tone?: 'default' | 'danger'` — con `danger`, el botón de confirmar usa la variante `danger`
  de `Button`.
- `isLoading?: boolean` — mientras sea `true`, el botón de confirmar está deshabilitado.
- `className?: string`.

**Comportamiento**

- `createPortal` a `document.body`; sin librerías nuevas: React + Tailwind con los **tokens del
  design system** (`frontend/src/styles/theme.css`); sin colores hex ni valores arbitrarios.
- Accesible: `role="dialog"` + `aria-modal`, nombre accesible = título; Escape cierra; el foco
  queda atrapado dentro del diálogo y **vuelve al elemento que lo abrió** al cerrar.
- El clic en el fondo cierra (`onClose`); nunca confirma.
- Reutiliza `Button` (atoms); no inventa controles nuevos.

**Estructura (convención del repo)**

```
frontend/src/components/ui/molecules/ConfirmDialog/
├── ConfirmDialog.tsx
├── ConfirmDialog.test.tsx
└── index.ts          # barrel export
```

**Tests obligatorios** (Testing Library + Vitest + `userEvent`): no se pinta con `isOpen`
false; pinta título y descripción; «Confirmar» llama a `onConfirm» y «Cancelar» a `onClose`;
Escape cierra; con `isLoading` el confirmar está deshabilitado; el diálogo es accesible
(`role` dialog con nombre = título).

**Checks obligatorios** (desde `frontend/`): `npm run lint`, `npm run format:check`,
`npm run test` (la suite entera) y `npm run build`, todos en verde.

**Referencia permitida**: el moléculo `Sheet` existente (`frontend/src/components/ui/molecules/Sheet/`)
muestra el patrón de portal, focus trap y devolución de foco del repo.

## Prompt (verbatim, idéntico para ambos; solo cambia la ruta del worktree al final)

```text
You are a coding agent working in the Athletica repository (a git worktree of the monorepo).
The repo has a FastAPI backend in backend/ and a React 18 + Vite 5 + TypeScript 5 +
Tailwind CSS v4 frontend in frontend/.

First read AGENTS.md at the repository root and follow its rules (atomic design, design
tokens in src/styles/theme.css, English code and comments, component convention).

TASK: implement the ConfirmDialog molecule exactly as specified below. Work ONLY inside
frontend/src/components/ui/molecules/ConfirmDialog/ and do not modify any other file of
the repository.

SPECIFICATION

Molecule `ConfirmDialog`: a controlled confirmation dialog that will replace the current
`window.confirm` calls in the admin panel.

Props (contract):
- `isOpen: boolean` — controlled; when false nothing is rendered.
- `onClose: () => void` — called on Escape, backdrop click and the cancel button.
- `onConfirm: () => void` — called by the confirm button.
- `title: ReactNode` (required), `description?: ReactNode`.
- `confirmLabel?: string` (default «Confirmar»), `cancelLabel?: string` (default «Cancelar»).
- `tone?: 'default' | 'danger'` — with `danger`, the confirm button uses the `danger`
  variant of `Button`.
- `isLoading?: boolean` — while true the confirm button is disabled.
- `className?: string`.

Behaviour:
- Render with `createPortal` into `document.body`; no new dependencies: React + Tailwind
  using the design tokens of `frontend/src/styles/theme.css` (no hex colours, no arbitrary
  values).
- Accessible: `role="dialog"` + `aria-modal`, accessible name = the title; Escape closes;
  focus is trapped inside the dialog and returns to the element that opened it when it
  closes.
- Backdrop click closes (`onClose`); it never confirms.
- Reuse the `Button` atom; do not invent new controls.

Structure (repo convention):
frontend/src/components/ui/molecules/ConfirmDialog/{ConfirmDialog.tsx, ConfirmDialog.test.tsx,
index.ts} (PascalCase folder, barrel export).

Tests (required, Testing Library + Vitest + userEvent): nothing rendered with isOpen false;
title and description rendered; «Confirmar» calls onConfirm and «Cancelar» calls onClose;
Escape closes; with isLoading the confirm button is disabled; the dialog is accessible
(role dialog named after the title).

Reference allowed: the existing Sheet molecule (frontend/src/components/ui/molecules/Sheet/)
shows the repo's portal, focus-trap and focus-return pattern.

ENVIRONMENT
- Node 22; dependencies are already installed in frontend/ — do NOT run npm install.
- Working directory for this task: <RUTA DEL WORKTREE DE ESTE MODELO>

DONE WHEN (run from frontend/): `npm run lint`, `npm run format:check`, `npm run test`
(full suite) and `npm run build` all pass. Fix failures while staying inside your folder;
if a fix would require touching another file, do not do it — report it instead.

Do NOT create commits, branches or PRs.

REPORT when done: files created, each check's result, and anything you were unsure about
or that failed because it needed changes outside your folder.
```

## Resultados

| Métrica | MiMo Flash | DeepSeek V4.1 Flash |
| --- | --- | --- |
| Calidad (cumple la spec) | Completa. 11 tests: los 6 obligatorios + Tab en ambas direcciones, tono `danger` y clic en el fondo. `max-w-md` como el `Sheet`; `text-text-soft` (token real, como `Alert` y `PlanCard`) | Completa. 9 tests: los 6 obligatorios + tono `danger`, clic en el fondo y devolución de foco. Añade `aria-describedby`. `max-w-sm`; `type="button"` explícito en ambos botones |
| Checks (lint/format/tests/build), verificados | ✅ verde — 410 tests (11 nuevos) | ✅ verde — 408 tests (9 nuevos) |
| Tiempo de ejecución | ≈7,5 min (14:14:40 → ~14:22, con un autoarreglo de formato) | ≈2,5 min (14:14:40 → ~14:17) |
| Errores o alucinaciones | Ninguno: solo tokens existentes, patrón de `Sheet` bien copiado | Ninguno: ídem |
| Correcciones necesarias tras la revisión | 0 | 0 |

Ambos tocaron **solo** su carpeta (`git status` limpio en los dos worktrees) y documentaron
sus dudas de forma honesta (variante del botón cancelar, `isLoading` vs. etiqueta de carga,
scroll lock). El agente de MiMo señaló además que la regla «spec antes que código» del repo
no aplicaba por la restricción de la tarea — buen criterio.

## Conclusión

**En una tarea pequeña y con una spec cerrada, los dos modelos entregaron código listo para
merge sin una sola corrección.** Las diferencias reales:

- **Velocidad**: DeepSeek ≈3× más rápido (2,5 min vs 7,5 min).
- **Exhaustividad**: MiMo añadió más tests (11 vs 9) y detalles extra (Tab en ambas
  direcciones); DeepSeek fue más rápido y con ligeramente menos cobertura.
- **Ambigüedad manejada**: ambos resolvieron las dudas de la spec con criterio del repo y
  las reportaron en vez de callarlas.

**Qué modelo usamos y para qué**: se mantiene **MiMo Flash** como modelo del proyecto
(baseline en uso, cumplió igual y fue más exhaustivo en tests, que es lo que más nos
protege); **DeepSeek V4.1 Flash** queda como alternativa recomendada cuando se prioriza
velocidad en tareas pequeñas y bien cerradas.

**Límites de esta comparación**: una sola ejecución por modelo y una tarea pequeña — no hay
validez estadística. Para tareas grandes o ambiguas convendría repetir la comparación.
