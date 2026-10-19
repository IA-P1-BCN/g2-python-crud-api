# Spec 487: pantallas del socio que funcionan con un socio real

- **Tarea:** #487 (depende de #486, ya fusionada)
- **Estado:** escrita antes del código (18 de octubre de 2026)

## Historia de usuario

Como socio, quiero que el calendario de clases y el detalle de una sesión carguen, para poder
reservar.

## El fallo

`frontend/src/pages/member/useMemberSessions.ts` y `useSessionDetail.ts`:

1. Piden `size: 200`; la API admite 100 como máximo → **422** («Input should be less than or equal
   to 100», que el usuario ve tal cual).
2. Llaman a `GET /users` para el nombre del entrenador: solo staff → **403** para el socio.
3. Llaman a `GET /bookings` para contar plazas y saber si el socio ya reservó: solo staff → **403**.

Los E2E no lo vieron porque `mockApi` responde a todo sin comprobar permisos.

## Requisitos

1. Ninguna lista pide más de 100 elementos.
2. **Nombre del entrenador:** `trainer_name` de la respuesta de la clase (#486).
3. **Plazas:** `GET /class-schedules/{id}/availability?on_date=` (público), una petición por sesión
   del día; capacidad, reservadas y libres salen de ahí.
4. **«Ya reservada»:** las reservas del propio socio con `GET /users/{id}/bookings`. Ese endpoint
   ordena por id y no filtra por fecha, así que se recorren **todas sus páginas** (normalmente una)
   para no perder las más recientes; se cuentan solo las confirmadas de esa sesión y fecha.
5. Las pantallas no llaman nunca a `/users` (lista) ni a `/bookings` (lista).
6. Los hooks devuelven la misma forma que hoy: las páginas que los usan no cambian.
7. **Tipos:** `src/types/schema.d.ts` se regenera desde el backend actual (estaba sin regenerar desde
   el 8 de octubre).
8. **Tests:**
   - los de las dos páginas que usan los hooks (`ClassesPage.test.tsx`, `SessionDetailPage.test.tsx`),
     que además comprueban que no se llama a `/bookings` ni se piden más de 100;
   - `mockApi` de los E2E responde **403** a `GET /users` y `GET /bookings` cuando el usuario simulado
     es socio, igual que la API, y simula `availability` y `trainer_name`; así este fallo no vuelve a
     pasar desapercibido.

## Criterios de aceptación

| Caso | Resultado |
| --- | --- |
| Socio abre el calendario de clases | Carga; cada sesión con entrenador, sala, plazas libres y su estado |
| Socio abre el detalle de una sesión | Carga con los mismos datos |
| Sesión llena / ya reservada por el socio | Estado `full` / `booked` |
| Peticiones del socio | Ninguna a `/users` ni a `/bookings`; ningún `size` > 100 |
| Checks | `lint`, `format:check`, `test`, `build` y `test:e2e` en verde |

## Fuera de alcance

Traducir al español los mensajes de validación del backend, y cambiar `/users/{id}/bookings` para
filtrar por fecha.
