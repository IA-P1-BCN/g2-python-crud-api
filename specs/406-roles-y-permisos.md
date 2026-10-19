# Spec 406: roles y permisos

- **Tarea:** #406 (specs retroactivas de las historias ya construidas).
- **Historia de usuario:** Como equipo, quiero que cada rol (`admin`, `trainer`, `member`) solo
  pueda hacer lo que le corresponde para que los datos de socios y entrenadores estén protegidos.
- **Retroactiva:** esta spec se escribió **después** del código, el 16 de octubre de 2026; las
  dependencias de acceso llevan en `dev` desde la parte 1.

## Requisitos

1. El rol vive en el token (claim `role`) y en la tabla `users`; por defecto `member`.
2. `get_current_user` identifica al usuario del Bearer token; sin token responde **401**.
3. `require_roles(...)` deja pasar solo a los roles indicados; el resto recibe **403**
   «No tienes permiso para realizar esta acción». El proyecto usa:
   - `require_admin`: solo administradores (crear/actualizar usuarios, bajas, auditoría,
     listados de admin…).
   - `require_staff`: administradores y entrenadores (listados de gestión).
   - `require_member_or_admin`: administradores y socios.
4. **Propiedad del dato**: `ensure_self_or_admin` permite a cualquier rol acceder solo a lo
   suyo (perfil, contraseña, membresías, reservas); un admin accede al de cualquiera.
5. **El entrenador solo ve socios**: al listar usuarios, un `trainer` no puede pedir otro rol
   (si lo pide, **403**) y siempre recibe la lista de `member`.
6. Nadie se da de baja a sí mismo: `ensure_not_own_account` responde **409** (incluso para un
   admin, para no quedarse sin nadie que gestione el panel).

## Criterios de aceptación

- [x] Cada endpoint protegido rechaza con 401 (sin token) y 403 (rol insuficiente).
- [x] Un socio solo alcanza sus propios datos.
- [x] Un entrenador lista socios, nunca otros entrenadores ni admins.
- [x] Ningún admin puede desactivar su propia cuenta.

## Vocabulario

[Role](ontology.md#role) ·
[Autenticación vs. autorización](ontology.md#glosario-términos-que-no-se-deben-confundir).

## Tests que la cubren

- `backend/tests/integration/test_permissions.py`: `test_role_permissions`
  (matriz rol × endpoint).
- `backend/tests/integration/test_users.py`: `test_trainer_filters_still_see_members_only`,
  `test_member_cannot_update_another_member_profile`,
  `test_admin_cannot_deactivate_their_own_account`.
- `backend/tests/integration/test_ownership.py` (propiedad de datos en el resto de recursos).

## Specs compañeras (no se repite aquí)

- #403 `403-user-repository.md` (separación de capas) · las specs de cada historia de esta
  serie detallan qué exige cada endpoint.

## Fuera de alcance

La autenticación en sí (`406-login.md`), las reglas de reservas de entrenadores y el
permiso de propiedad sobre clases.
