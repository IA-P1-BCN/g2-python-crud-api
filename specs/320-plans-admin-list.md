# #320 · PlansAdminList (organismo)

Parte de #317 (Página de planes de admin). Sustituye la tabla de planes de
`pages/admin/PlansPage.tsx` por una lista de `PlanCard` con las acciones que hoy tiene la tabla.
`PlansPage` no se toca en esta issue: componer la página con el nuevo diseño es #317.

## Alcance

- `components/ui/organisms/PlansAdminList/{PlansAdminList.tsx, PlansAdminList.test.tsx, index.ts}`:
  lista semántica (`ul`/`li`) con una `PlanCard` por plan — nombre, precio, «Cada N días»,
  descripción si existe, estado y las acciones **Editar**, **Activar/Desactivar** y **Borrar**.
- Estados de carga y vacío: mientras carga, tres tarjetas esqueleto con la forma de `PlanCard`
  más el texto `Cargando…` (convención del `Table`, que los esqueletos por sí solos son
  `aria-hidden`); sin planes, `EmptyState` con «Todavía no hay planes.».

## Decisiones

- **Presentacional**: props `plans`, `isLoading?`, `onEdit(plan)`, `onToggle(plan)`,
  `onRemove(plan)` y `className?`. Las confirmaciones (`window.confirm`) y las mutaciones se
  quedan en la página: la lista solo emite callbacks (regla de capas).
- **Opción B (confirmada por Nayeli)**: se conservan toggle y borrar en la card además de Editar
  — nada se quita de la tabla actual. El alta («Nuevo plan») es un botón de cabecera de página,
  no de la lista: su destino se decide al componer en #317.
- **Estado en la card** (Q2): `Badge tone="success"` «Activo» o `Badge tone="neutral"`
  «Inactivo», en el slot `children` de la `PlanCard`, en una fila con los botones.
- **Botones con las mismas variantes de la tabla** (Q1): Editar `secondary`, toggle `ghost` si
  está activo / `primary` si no, Borrar `danger`, tamaño `sm` por el espacio de la card. El texto
  del toggle sigue siendo «Desactivar»/«Activar».
- **Sin Figma** (Q3): se parte del enunciado y los tokens de tema.
- `PlanCard` ya formatea el precio (`formatPrice`) y la duración: la lista solo le pasa los datos
  de `MembershipPlan`.
- `PlansPage.tsx` y sus tests no cambian hasta #317.

## Pruebas

`PlansAdminList.test.tsx`: una card por plan con nombre, precio y duración; el estado pinta el
`Badge` correcto («Activo»/«Inactivo»); Editar, Activar/Desactivar y Borrar llaman a su callback
con el plan correspondiente; mientras carga muestra `Cargando…` y esqueletos (ni cards ni vacío);
`EmptyState` con el mensaje cuando la lista está vacía.
