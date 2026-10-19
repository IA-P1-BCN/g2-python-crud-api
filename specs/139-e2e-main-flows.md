# Spec 139: tests E2E de los flujos principales

- **Tarea:** #139 (parte de #137)
- **Estado:** escrita antes del código (16 de octubre de 2026)

## Historia de usuario

Como equipo, queremos tests de extremo a extremo de los flujos principales, para saber que la web
sigue funcionando entera después de cada cambio.

## Punto de partida

La tarea pide cuatro flujos con Playwright: login, reservar, cancelar y acceso prohibido por rol.
Tres ya están cubiertos en `frontend/tests/e2e/` y se ejecutan en la CI:

| Flujo | Dónde |
| --- | --- |
| Login | `auth.spec.ts` (login y registro abren la sesión) |
| Reservar y cancelar | `member.spec.ts` (reserva desde el calendario, la consulta y la cancela; error de la API al reservar) |
| Acceso prohibido por rol | **Falta** |

## Requisitos

1. Nuevo `frontend/tests/e2e/access.spec.ts` con el mismo patrón que los demás: la API se simula
   con `mockApi` de `fixtures.ts`, sin backend real.
2. **Sin sesión:** abrir una ruta protegida (`/member/bookings`) lleva a `/login`.
3. **Con sesión y rol equivocado:** cada rol que abre la zona de otro rol acaba en `/forbidden`,
   con el título «403 · Acceso denegado»:
   - socio → `/admin/dashboard` y `/trainer`;
   - entrenador → `/admin/dashboard` y `/member/bookings`;
   - admin → `/member/bookings` y `/trainer`.
4. **Con el rol correcto** no se bloquea: un admin entra en `/admin/dashboard` sin ir a
   `/forbidden`.
5. No se tocan los tests existentes ni el código de la aplicación.

## Criterios de aceptación

| Caso | Resultado |
| --- | --- |
| Ruta protegida sin sesión | Redirige a `/login` |
| Rol equivocado (6 combinaciones) | `/forbidden` con «403 · Acceso denegado» |
| Rol correcto | Entra; no aparece el 403 |
| Checks | `npm run lint`, `npm run format:check`, `npm run test`, `npm run build` y `npm run test:e2e` en verde |

## Fuera de alcance

Tests E2E contra el backend real (la CI no levanta la API ni la base de datos) y la comprobación
de permisos en la API, que ya cubre `backend/tests/integration/test_permissions.py`.
