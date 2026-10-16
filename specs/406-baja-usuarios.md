# Spec 406: baja de usuarios

- **Tarea:** #406 (specs retroactivas de las historias ya construidas).
- **Historia de usuario:** Como administrador, quiero dar de baja una cuenta sin borrarla para
  que deje de entrar pero se conserve su historial de membresías y reservas.
- **Retroactiva:** esta spec se escribió **después** del código, el 16 de octubre de 2026; el
  comportamiento lleva en `dev` desde la parte 1.

## Requisitos

1. `DELETE /users/{user_id}` **no borra**: pone `is_active = false` y registra
   `deactivated_at`, y responde **204**. Requiere rol `admin`.
2. Las membresías y reservas del usuario **se conservan**; la baja solo corta el acceso.
3. Un usuario dado de baja **no puede iniciar sesión** (login **403** «La cuenta está
   desactivada») y sus tokens dejan de valer.
4. Al reactivar (`PUT /users/{user_id}` con `is_active = true`), `deactivated_at` vuelve a
   `null`.
5. Repetir la baja conserva la **primera** fecha de `deactivated_at` (no se pisa).
6. Nadie se da de baja a sí mismo: responde **409** «No puedes dar de baja tu propia cuenta»,
   también para un admin (para no dejar el panel sin gestión).
7. Un usuario puede crearse ya inactivo (alta por panel con `is_active = false`); en ese caso
   `deactivated_at` queda establecido.
8. Bajar a un usuario inexistente responde **404**.

## Criterios de aceptación

- [x] El DELETE desactiva sin borrar y el historial queda intacto.
- [x] La cuenta desactivada no puede entrar.
- [x] Reactivar limpia la fecha de baja; repetir la baja conserva la primera.
- [x] Un admin no puede desactivarse a sí mismo.

## Vocabulario

[User](ontology.md#user) ·
[Dar de baja vs. revocar](ontology.md#glosario-términos-que-no-se-deben-confundir).

## Tests que la cubren

- `backend/tests/integration/test_users.py`: `test_delete_deactivates_the_user_instead_of_removing_it`,
  `test_deactivating_keeps_memberships_and_bookings`,
  `test_deactivated_user_cannot_log_in`, `test_update_can_deactivate_and_reactivate`,
  `test_deactivating_twice_keeps_the_first_date`,
  `test_user_created_inactive_has_a_deactivation_date`,
  `test_deactivating_an_unknown_user_returns_404`,
  `test_admin_cannot_deactivate_their_own_account`, `test_new_user_has_no_deactivation_date`.

## Specs compañeras (no se repite aquí)

- `406-login.md` (por qué una cuenta desactivada no entra) ·
  `406-crud-usuarios.md` (reactivar desde el panel de administración) ·
  `406-roles-y-permisos.md` (regla de la cuenta propia).

## Fuera de alcance

Borrado físico de cuentas (no existe: se eligió conservar el historial), la baja del propio
usuario desde su perfil y la purga de tokens caducados (#408).
