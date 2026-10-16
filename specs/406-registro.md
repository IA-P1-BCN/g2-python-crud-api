# Spec 406: registro

- **Tarea:** #406 (specs retroactivas de las historias ya construidas).
- **Historia de usuario:** Como visitante, quiero crear una cuenta de socio con mi email,
  mi nombre y una contraseña para empezar a usar Athletica.
- **Retroactiva:** esta spec se escribió **después** del código, el 16 de octubre de 2026. El
  backend de registro es de la parte 1; el frontend se rediseñó en la epic de registro #252
  (`RegisterForm` #253, `RegisterPage` #255).

## Requisitos

1. `POST /auth/register` recibe JSON `{ email, full_name, password }` y devuelve **201** con el
   mismo `Token` del login (acceso + refresco + `user`): registrarse inicia sesión.
2. El rol es siempre `member`: el registro **no** permite elegir rol.
3. El `email` es único: si ya existe responde **409** «El email ya está registrado».
4. La contraseña debe ser fuerte (`StrongPassword`); una contraseña débil responde **422**.
5. Validación de campos: **422** si falta `email`, `full_name` o `password`, el email no tiene
   formato válido o el nombre supera los 255 caracteres.
6. La contraseña se guarda como hash Argon2 (`hashed_password`) y **nunca** aparece en la
   respuesta ni en ningún endpoint.
7. La verificación del email es un flujo posterior aparte (#412): el enlace de confirmación
   aparece por ahora en el log del backend.

## Criterios de aceptación

- [x] Registro correcto crea un socio y devuelve token de acceso y de refresco.
- [x] No se puede elegir el rol desde el registro.
- [x] Email repetido responde 409; contraseña débil responde 422.
- [x] La respuesta no expone la contraseña ni su hash.

## Vocabulario

[User](ontology.md#user) · [Role](ontology.md#role).

## Tests que la cubren

- `backend/tests/integration/test_auth.py`: `test_register_creates_a_member_and_returns_a_token`,
  `test_register_never_exposes_the_password`, `test_register_stores_the_password_hashed`,
  `test_register_cannot_choose_the_role`, `test_register_with_an_existing_email_returns_409`,
  `test_register_validates_fields`, `test_register_requires_email_name_and_password`.
- `backend/tests/integration/test_users.py`: `test_register_rejects_a_weak_password`.
- Frontend: `frontend/src/components/ui/organisms/RegisterForm/RegisterForm.test.tsx` y
  `frontend/tests/unit/RegisterPage.test.tsx`.

## Specs compañeras (no se repite aquí)

- #412 `412-email-verification-and-password-recovery.md` (verificación del email y recuperación
  de contraseña) · #403 `403-user-repository.md` (capa de acceso a datos).

## Fuera de alcance

Login (spec propia `406-login.md`), verificación de email y recuperación de contraseña (#412),
login con GitHub (#414, en desarrollo) y el resto de gestión de usuarios (specs propias de
esta serie).
