# #295 · Página principal del entrenador

Parte de la **Fase 4 · Experto**. Subtemas: #296 (molécula `NextSessionCard`), #297 (datos de hoy) y #298 (`TrainerHomePage`).

## Historia de usuario

Como entrenador, quiero una pantalla de inicio con los datos de hoy, mi próxima sesión y la lista de tareas del día para empezar el día preparado.

## Criterios de aceptación

1. Muestra las clases y el número de miembros de hoy.
2. Destaca la próxima sesión con su capacidad y "Ver inscritos".
3. Lista las sesiones de hoy.
4. No hay turno, ni Head Coach, ni registro, ni notificaciones.

## Alcance

- **#296 `NextSessionCard`** (`components/ui/molecules/NextSessionCard`): tarjeta azul (`bg-secondary`) con la clase, la hora, la sala, la barra de capacidad (`ProgressBar`), el `AvatarStack` de inscritos y el botón "Ver inscritos". Reutiliza `ProgressBar`, `AvatarStack` y `Button`; estado vacío cuando no hay sesión.
- **#297 `useTrainerToday`** (`pages/trainer/useTrainerToday`): reutiliza `useTrainerSessions` (clases y horarios del entrenador) y lo combina con las reservas de hoy, las salas y los nombres de socios para devolver: nº de sesiones de hoy, nº de miembros de hoy, la próxima sesión y la lista de sesiones de hoy.
- **#298 `TrainerHomePage`** (`pages/trainer/TrainerHomePage`): `ProfileGreeting`, dos `StatCard` (sesiones y miembros de hoy), `NextSessionCard` y `SessionList` (sesiones de hoy). Pasa a ser la ruta índice `/trainer`.

## Decisiones

- La "próxima sesión" es la primera de hoy que todavía no ha terminado (`end_time` >= hora actual), de modo que también vale la sesión en curso.
- La lista de hoy se ordena por hora de inicio y se filtra por el día de la semana actual.
- "Ver inscritos" de la tarjeta y de la lista llevan a `/trainer/sessions`, donde está el panel de inscritos.
- Se extrae `weekdayOf` a `lib/dates.ts` y `TrainerSessionsPage` deja de duplicarlo (DRY).

## Pruebas

- `NextSessionCard.test.tsx`: datos + "Ver inscritos" y estado vacío.
- `useTrainerToday.test.tsx`: resumen de hoy y filtrado de reservas; error si fallan las clases.
- `TrainerHomePage.test.tsx`: saludo, métricas, próxima sesión y lista; error.
- E2E: home del entrenador y sesiones de la semana.
