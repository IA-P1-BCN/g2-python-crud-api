# #308 · Tarjeta resumen de entrenadores (organismo)

Parte de #299. Tarjeta del panel de administración con los **entrenadores activos** y sus
**sesiones semanales**. Era una **decisión pendiente** ("propuesto, no incluido en Figma").

## Decisión

La API **no** devuelve datos de entrenadores en `GET /admin/dashboard` ni existe un endpoint de
entrenadores/sesiones por entrenador. Se acordó **componer en cliente**:
`GET /users?role=trainer&is_active=true` + un `GET /classes?trainer_id=` por entrenador y un
`GET /class-schedules?class_id=` por clase, sumando los horarios por entrenador.

## Alcance

- `pages/admin/dashboard/useTrainersSummary.ts`: compone los entrenadores activos y cuenta sus
  sesiones semanales (con estados de carga y error).
- `components/ui/organisms/TrainersSummaryCard`: presente la tarjeta con `ChartCard` (insignia con el
  número de activos, un `Badge` con las sesiones por entrenador y estados de carga/error/vacío).
- `AdminDashboardPage`: añade la tarjeta al final; el resto de la página no cambia.

## Pruebas

Tests del hook (`useTrainersSummary`) y del organismo; y en `AdminDashboardPage.test` se mockea el
hook (el resto de sus tests siguen pasando) con un test del resumen de entrenadores.
