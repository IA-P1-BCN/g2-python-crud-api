# Spec 406: CRUD de usuarios

- **Tarea:** #406 (specs retroactivas de las historias ya construidas).
- **Historia de usuario:** Como administrador, quiero crear, consultar y actualizar cuentas de
  usuario desde el panel para gestionar el gimnasio.
- **Retroactiva:** esta spec se escribió **después** del código, el 16 de octubre de 2026; el
  router `users` lleva en `dev` desde la parte 1 y la página `AdminUsersPage` se rediseñó con
  el nuevo design system.

## Requisitos

1. `POST /users` crea un usuario y devuelve **201** con su `UserRead`. Requiere rol `admin`.
2. Email duplicado responde **409**; contraseña débil responde **422** (igual que en el
   registro).
3. `GET /users/{user_id}` devuelve el usuario por id — **404** si no existe. Acceso: el propio
   usuario o un `admin` (regla de propiedad).
4. `PUT /users/{user_id}` actualiza campos del usuario (`UserUpdate`: nombre, email, rol,
   estado). Requiere `admin`; no permite desactivarse a sí mismo (ver spec de baja).
5. `GET /users/{user_id}/memberships` y `GET /users/{user_id}/bookings` devuelven las
   membresías y reservas de un usuario, paginadas. Acceso: el propio usuario o un `admin`.
6. `GET /users/{user_id}/audit` devuelve quién creó el usuario y quién lo modificó por última
   vez con sus fechas. Solo `admin`; en usuarios anteriores a la auditoría los datos vienen
   vacíos (spec #410).
7. **No hay borrado físico**: el «DELETE» de la API es una baja reversible (spec propia
   `406-baja-usuarios.md`), para conservar el historial.

## Criterios de aceptación

- [x] Un admin crea, consulta y actualiza usuarios; un email repetido o una contraseña débil
  se rechazan.
- [x] Un socio no puede consultar ni actualizar a otros.
- [x] Ningún endpoint devuelve la contraseña.

## Vocabulario

[User](ontology.md#user) · [Repository](ontology.md#repository-no-es-una-entidad).

## Tests que la cubren

- `backend/tests/integration/test_users.py`: `test_create_and_get_user`,
  `test_duplicate_email_returns_409`, `test_unknown_user_returns_404`, `test_update_user`,
  `test_admin_cannot_create_a_user_with_a_weak_password`,
  `test_admin_cannot_set_a_weak_password_on_update`.
- `backend/tests/integration/test_permissions.py`: `test_role_permissions` (tabla de
  permisos por rol sobre estos endpoints).
- Frontend: `frontend/tests/unit/AdminUsersPage.test.tsx`.

## Specs compañeras (no se repite aquí)

- #403 `403-user-repository.md` (acceso a datos) · #410 `410-user-audit-trail.md`
  (auditoría) · `406-roles-y-permisos.md` y `406-baja-usuarios.md` de esta serie.

## Fuera de alcance

El listado con filtros y paginación (spec propia `406-filtros-y-paginacion-usuarios.md`),
el perfil propio (`406-perfil-y-cambio-contrasena.md`) y el registro de socios por la web
(`406-registro.md`).
