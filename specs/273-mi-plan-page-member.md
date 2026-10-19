# #273 · Página «Mi membresía» del socio (incluye la subtask #277)

La página ya existe en `dev` como `pages/member/MembershipPage.tsx` (ruta `/member/membership`,
bajo `AppLayout` y `ProtectedRoute` de socio). Esta tarea **no la reescribe desde cero**: aplica el
diseño nuevo (tokens + `components/ui`) conservando su comportamiento, y la convierte en el primer
consumidor de las moléculas `MembershipCard` y `PlanBenefitsList` (ya construidas y testadas, hoy
sin uso) — eso es exactamente lo que pide la subtask #277.

## Datos disponibles (lo que da y no da la API)

- `GET /users/{id}/memberships` devuelve `MembershipRead`: `id`, `plan_id`, `start_date`,
  `end_date`, `status`, `created_at`. **No** trae `plan_name` ni `days_left`, así que la página ya
  resuelve el nombre con un lookup en el query de planes (`GET /membership-plans`) y los días se
  calculan en el front.
- `MembershipPlanRead` solo tiene `name`, `description`, `price_cents`, `duration_days` — **no**
  tiene beneficios; por eso `PlanBenefitsList` usa la lista compartida `PLAN_BENEFITS`
  (`lib/plan-benefits.ts`), documentada como «lo mismo para todos los planes».

## Criterios de aceptación

1. Título de página «Mi membresía» (se mantiene el actual).
2. `MembershipCard` con: nombre del plan (lookup por `plan_id`, fallback `Plan #{id}`), estado
   (Activa / Caducada / Cancelada), fecha de fin formateada (`formatDate`), **días restantes** y
   barra de progreso de la duración total.
3. Días calculados en el front: `daysLeft = max(0, ceil((fin − hoy) / día))` y
   `totalDays = días entre start_date y end_date`; las fechas se parsean por año/mes/día en UTC
   para que no bailen con la zona horaria.
4. `PlanBenefitsList` debajo de la tarjeta, con título «Tu plan incluye» y los beneficios por
   defecto.
5. Estado vacío (sin ninguna membresía): el `Alert` informativo actual, con el mismo mensaje
   «No tienes ninguna membresía asignada.».
6. Estado de carga: `Skeleton` (diseño nuevo) en lugar del «Cargando…» con clase vieja.
7. Estado de error: se mantiene el `Alert` de error con `toApiError`.
8. Sin cambios de comportamiento: se sigue mostrando `items[0]`, las mismas dos queries
   (`memberships` size 10, `plans` size 100), la misma ruta y el mismo guard de rol.

## Alcance

- `pages/member/MembershipPage.tsx`: reescritura con tokens y las dos moléculas; cálculo de días
  con el parseo UTC descrito arriba. Sin tocar moléculas, átomos ni backend.
- `pages/member/MembershipPage.test.tsx` (nuevo): la página hoy no tiene tests.
- `docs/ai-log.md`: entrada de la tarea.

## Pruebas

`MembershipPage.test.tsx` con Testing Library y los mocks de `@/api` ya usados en el repo:

1. Muestra la tarjeta con plan, estado y días cuando hay membresía activa.
2. Estado vacío cuando `items` viene vacío (y mensaje completo).
3. Skeleton durante la carga.

`npm run lint`, `npm run format:check`, `npm run test` y `npm run build` en verde.
