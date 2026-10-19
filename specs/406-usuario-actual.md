# Spec 406: usuario actual

- **Tarea:** #406 (specs retroactivas de las historias ya construidas).
- **Historia de usuario:** Como usuario con sesión iniciada, quiero que la aplicación sepa quién
  soy para mostrarme solo mis datos y proteger lo que es mío.
- **Retroactiva:** esta spec se escribió **después** del código, el 16 de octubre de 2026; el
  comportamiento lleva en `dev` desde la parte 1.

## Requisitos

1. `GET /auth/me` y `GET /users/me` devuelven **200** con el `UserRead` del usuario del token
   Bearer; están disponibles para **cualquier rol**.
2. `GET /users/me` está declarado antes de `/{user_id}` para que «me» no se interprete como un
   id.
3. Sin token, con token caducado, manipulado o con la cabecera mal formada responde **401**.
4. `UserRead` expone `id`, `email`, `full_name`, `role`, `is_active` y fechas — **nunca** la
   contraseña ni su hash.
5. El token identifica por el claim `sub` (id del usuario) y su `jti` debe estar sin revocar.

## Criterios de aceptación

- [x] El token devuelto por el login identifica al usuario en `/me`.
- [x] Cualquier rol puede consultar su propio usuario.
- [x] Token ausente, caducado, manipulado o mal formado responde 401.
- [x] La respuesta no incluye nunca credenciales.

## Vocabulario

[User](ontology.md#user) · [Token](ontology.md#token).

## Tests que la cubren

- `backend/tests/integration/test_auth.py`: `test_me_returns_the_user_of_the_token`,
  `test_me_works_with_the_token_returned_by_login`, `test_me_without_token_returns_401`,
  `test_me_with_expired_token_returns_401`, `test_me_with_tampered_token_returns_401`,
  `test_me_with_malformed_authorization_returns_401`.
- Frontend: la página de perfil (#278, PR #442) consume el usuario actual
  (`frontend/tests/unit/ProfilePage.test.tsx`).

## Specs compañeras (no se repite aquí)

- #408 `408-refresh-tokens-and-logout.md` (emisión y revocación de los tokens) ·
  #403 `403-user-repository.md`.

## Fuera de alcance

Editar el perfil o cambiar la contraseña (spec propia `406-perfil-y-cambio-contrasena.md`),
la auditoría de quién modificó al usuario (#410) y el panel de reservas del socio
(`GET /me/dashboard`).
