# #319 · PlanEditForm (organismo)

Parte de #317 (Página de planes de admin). Rediseña el formulario de edición de planes que hoy
vive en `pages/admin/plans/PlanForm.tsx` (construido en #131, con las clases CSS antiguas) como
organismo presentacional. `PlansPage` no se toca en esta issue: sustituir el formulario viejo por
este organismo es #317.

## Alcance

- `components/ui/organisms/PlanEditForm/{PlanEditForm.tsx, PlanEditForm.test.tsx, index.ts}`:
  formulario de **edición** (no crea) con `FormField` para nombre, descripción, precio y duración,
  `Toggle` para el estado activo, botón «Guardar cambios» y botón «Cancelar».
- Conserva el comportamiento y las validaciones actuales del `PlanForm`:
  - precio con `parsePriceCents` → «El precio debe ser un importe mayor que 0»;
  - duración entera mayor que 0 → «La duración debe ser un número entero de días mayor que 0»;
  - errores de servidor en un `Alert`.
- Rellena los campos con el plan: nombre, descripción, precio (`price_cents / 100` con dos
  decimales) y duración; el `Toggle` refleja `is_active`.

## Decisiones

- **Presentacional** (patrón de `LoginForm`/`RegisterForm`, Q2): props `plan`, `onSubmit(values)`,
  `isLoading?`, `error?`, `onCancel?` y `className?`. El organismo guarda los campos y valida;
  la página hará la mutación al componer en #317.
- `onSubmit` emite `{ name, description: string | null, price_cents, duration_days, is_active }`
  — `is_active` se actualiza con el `Toggle` (nuevo respecto al formulario actual, Q3 de la epic).
- **Solo edición** (Q3): el modo «Crear plan» se queda en el `PlanForm` viejo hasta #317, donde
  decidirá su destino con el equipo. Título «Editar plan» y botón «Guardar cambios».
- **Descripción se conserva** (Q1 A): la `PlanCard` la muestra y si el formulario no la edita,
  nadie podrá cambiarla.
- **«Cancelar» se conserva** (Q4): `type="button"` secundario que llama a `onCancel` — en #317 se
  valorará si el `Sheet` (con su X) lo hace redundante.
- Copys y mensajes **idénticos** a los actuales; sin dismiss en el `Alert` de error de servidor
  (el formulario actual no lo tiene).
- `noValidate` en el `form`: sin él, la validación nativa del navegador tapa los mensajes
  personalizados (un precio vacío o una duración fuera de `min`/`step` bloquean el envío y
  «mayor que 0»/«entero de días» nunca aparecen — hoy son código muerto en el navegador real).
- Clases con tokens de tema (`rounded-card`, `border-line`, `bg-surface`…); desaparecen las
  clases `form`, `card`, `field` y `form__actions`.
- `FormField` pasa las props del `input` (`inputMode`, `min`, `autoComplete`, etc.).

## Pruebas

`PlanEditForm.test.tsx`: rellena los campos y el `Toggle` con el plan; envía con `onSubmit`
emitiendo los valores parseados (precio «39,99» → 3999, descripción vacía → `null`); el `Toggle`
cambia `is_active` emitido; no envía con precio inválido ni duración inválida y muestra el
mensaje; pinta el `error` de servidor en un `Alert`; «Cancelar» llama a `onCancel`; el envío
queda deshabilitado mientras `isLoading`.
