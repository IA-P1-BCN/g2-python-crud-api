# Spec 406: perfil propio y cambio de contraseña

- **Tarea:** #406 (specs retroactivas de las historias ya construidas).
- **Historia de usuario:** Como usuario, quiero actualizar mi email y mi nombre y cambiar mi
  contraseña para mantener mi cuenta al día y segura.
- **Retroactiva:** esta spec se escribió **después** del código, el 16 de octubre de 2026; el
  comportamiento lleva en `dev` desde la parte 1 y la página de perfil se rediseñó en #278
  (PR #442).

## Requisitos

1. `PUT /users/{user_id}/profile` recibe `ProfileUpdate` (`email?`, `full_name?`) y devuelve
   **200** con el `UserRead` actualizado. Acceso: el propio usuario o un `admin`.
2. Cambiar el email a uno ya registrado responde **409** (el email sigue siendo único).
3. `PUT /users/{user_id}/password` recibe `PasswordChange` (`current_password`,
   `new_password`) y responde **204** sin cuerpo. Acceso: el propio usuario o un `admin`.
4. La `current_password` debe coincidir con la guardada; si no, responde **400**.
5. La `new_password` debe cumplir la regla de contraseña fuerte (**422** si no la cumple) y se
   guarda con hash Argon2; ninguna respuesta la expone.
6. La página de perfil del frontend usa estos endpoints para editar nombre, email y contraseña.

## Criterios de aceptación

- [x] Un socio actualiza su propio perfil pero no el de otro.
- [x] Un admin puede editar el perfil de cualquiera (incluido el suyo).
- [x] El cambio de contraseña exige la contraseña actual y una nueva fuerte.
- [x] Email duplicado se rechaza con 409.

## Vocabulario

[User](ontology.md#user) ·
[hashed_password](ontology.md#glosario-términos-que-no-se-deben-confundir).

## Tests que la cubren

- `backend/tests/integration/test_users.py`: `test_member_can_update_own_profile`,
  `test_member_cannot_update_another_member_profile`,
  `test_admin_can_still_edit_their_own_profile`, `test_member_can_change_own_password`,
  `test_member_cannot_change_password_with_wrong_current_password`.
- Frontend: `frontend/tests/unit/ProfilePage.test.tsx`.

## Specs compañeras (no se repite aquí)

- #412 `412-email-verification-and-password-recovery.md` (el email sin verificar y la
  contraseña olvidada se resuelven por enlace, no aquí) · `406-roles-y-permisos.md`
  (regla de propiedad).

## Fuera de alcance

Recuperación de contraseña olvidada (#412), verificación del nuevo email tras el cambio (no
implementada) y la gestión de usuarios por parte del admin (`406-crud-usuarios.md`).
