# #317 · PlansPage de admin (composición)

Issue final de la epic #317. La página pasa de tabla + `PlanForm` viejo a los tres componentes
nuevos: `Sheet` (#318), `PlansAdminList` (#320) y `PlanEditForm` (#319, ahora también en modo
creación). `PlanForm.tsx` (#131) se elimina: su comportamiento vive en el organismo nuevo y en
las mutaciones de la página.

## Alcance

- `pages/admin/PlansPage.tsx`: se reescribe con `Sheet` + `PlansAdminList` + `PlanEditForm`;
  desaparecen `Table`, `Badge`, `formatPrice` y las clases `.page`/`.card__meta` de la página.
- `pages/admin/plans/PlanForm.tsx`: **se borra** con su carpeta.
- `organisms/PlanEditForm`: se extiende a **modo creación** (`plan` opcional) y gana `hideTitle`.
- `tests/unit/PlansPage.test.tsx`: se reescribe contra el nuevo DOM conservando la cobertura.

## Decisiones

- **Crear se queda** (Q1 A, decisión del equipo): «Nuevo plan» en la cabecera abre el `Sheet` con
  `PlanEditForm` en modo creación (sin `plan`): campos vacíos, duración por defecto «30», toggle
  activo, botón «Crear plan» y título/`aria-label` «Nuevo plan». Los AC de la epic dejan la alta
  fuera, pero mandan decidir con el equipo antes de quitarla y el equipo la conserva.
- **Paginación se mantiene** (Q2 A): la actual `Pagination` con `PAGE_SIZE = 10`; «muestra todo
  tipo de planes» se cumple alcanzando todas las páginas, y es «aplicar el nuevo diseño,
  conservar el comportamiento».
- **Formulario dentro del `Sheet`** (Q3): el `Sheet` lleva el `title` del modo («Editar plan» /
  «Nuevo plan», que es además su nombre accesible como diálogo) y el formulario recibe
  `hideTitle` para no duplicar el encabezado; el `aria-label` del `form` sigue siendo el título
  del modo.
- **Una sola mutación `save`** para crear y editar: `mutationFn({ id?, values })` → `create` si
  no hay `id`, `update(id, values)` si lo hay; `onSuccess` invalida la query y cierra el `Sheet`;
  `error` e `isLoading` se pasan al formulario. Toggle y borrar quedan como estaban, con sus
  `window.confirm` y su `Alert` de error.
- **Cambio de comportamiento exigido por los AC**: el payload de `update` ahora incluye
  `is_active` (el estado del `Toggle` del formulario), que el formulario viejo no enviaba.
- Claves: `key={plan.id}` al editar y `key="new"` al crear, para reiniciar el formulario entre
  planes (como el `key={panel.plan.id}` actual).
- Copy conservado: «Planes», «Nuevo plan», el texto auxiliar sobre planes con socios, los
  mensajes de confirmación y los de validación.
- Contenedor `flex flex-col gap-4` + `.page__header` (clase global de `index.css` compartida por
  las páginas admin hermanas) + `h1` con tokens, como `AdminRoomsPage`.

## Pruebas

`PlansPage.test.tsx` reescritas (las 7 actuales) y añadidas:

- lista los planes por tarjeta con precio, duración y estado (activo e inactivo), y pide la
  página 1 con `size` 10;
- «Nuevo plan» abre el diálogo y crea convirtiendo «299,90» a 29990 céntimos, cierra el `Sheet`
  tras el éxito;
- precio no válido muestra el mensaje y no llama a la API;
- «Editar» abre el diálogo con el plan rellenado y guarda con `update(id, { …, is_active })`;
- «Desactivar» pide confirmación y manda `{ is_active: false }`;
- el aviso de la API aparece al borrar un plan con socios; y no borra sin confirmar;
- **nueva**: con más de una página aparece `Pagination` y «Siguiente» pide la página 2.

Se conserva el bloque `parsePriceCents` que vive en este archivo. El organismo `PlanEditForm`
añade tests de modo creación (valores por defecto, emisión con «Crear plan») y de `hideTitle`.
