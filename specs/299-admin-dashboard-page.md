# #299 · Página del panel de administración

Rediseño de `frontend/src/pages/admin/AdminDashboardPage.tsx` con el diseño nuevo
(tokens + `components/ui`). La página ya existía (construida en #180 sobre
`GET /admin/dashboard`) con las clases CSS antiguas: se mantiene su comportamiento y sus tests
pasan.

## Historia de usuario

Como administrador, quiero un panel de control con datos relevantes sobre socios, clases,
entrenadores e ingresos para poder gestionar el gimnasio.

## Decisiones previas

- **Alcance:** solo los criterios de aceptación (#300–#306 + #311). Se dejan sin hacer #307 (altas vs
  bajas), #308 (entrenadores) y #309 (acciones rápidas) por ser decisiones pendientes en el issue.
- **Gráficos:** hechos a mano con SVG/CSS y los tokens de gráficos (`--color-chart-1..4`), sin
  añadir librerías.
- **#310** (endpoints nuevos) se cerró: los datos ya los da `GET /admin/dashboard`.

## Criterios de aceptación

1. Muestra socios activos, ingresos mensuales, reservas diarias, ocupación de las clases,
   membresías por vencer, planes más contratados y clases más populares.
2. Filtro de rango de fechas (Hoy / 7 / 30 días).
3. Fuera del diseño: retención, objetivo de ingresos, ticket promedio, mapa de habitaciones, botón de
   renovación automática, cronograma de monitoreo y calificaciones.
4. Usa los datos agregados de `GET /admin/dashboard`.

## Componentes

- **#300 `DateRangeFilter`** (molécula): control segmentado Hoy / 7 días / 30 días.
- **#301 `ChartCard`** (molécula): tarjeta con título, subtítulo, insignia opcional y slot de
  contenido; variante `secondary` (tarjeta azul).
- **#302 `BookingsByDayChart`** (organismo): barras por día en tarjeta azul, con el pico destacado.
- **#303 `OccupancyList`** (organismo): ocupación por clase con `ProgressBar` y media como insignia.
- **#304 `ExpiringMembershipsList`** (organismo): socios que vencen en 7 días con insignia de días;
  sin botón de renovación.
- **#305 `PlansDistributionChart`** (organismo): donut con leyenda por plan.
- **#306 `TopClassesList`** (organismo): clases ordenadas por reservas; sin calificaciones.
- **#311 `AdminDashboardPage`**: compone el filtro, las `StatCard` y las tarjetas.

## Cambios de apoyo

- `StatCard`: la etiqueta pasa a ser un encabezado y se añade `hint` opcional, para no romper los
  tests actuales de la página.
- `lib/format.ts`: `formatPercent(rate)` reutilizado por la página y los organismos.

## Pruebas

Tests unitarios de cada componente nuevo y la suite existente de `AdminDashboardPage`
(sin cambios): cifras, filtro de periodo, membresías por vencer, ocupación, vacíos y error.
