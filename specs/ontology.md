# Ontología del dominio

Vocabulario común del proyecto (parte 2: servicio de usuarios). Sirve de base a las specs: cada spec
enlaza aquí en su línea **Vocabulario** y no inventa conceptos.

Los nombres de entidades, atributos y tablas son **los mismos que en el código y en la base de
datos**. Si algo cambia en el código, se actualiza también aquí.

## Entidades de usuarios y acceso

### User

Persona con cuenta en el sistema (socios, entrenadores y administradores). Tabla `users`.

**Atributos**

| Nombre (código / BD) | Tipo | Notas |
| --- | --- | --- |
| `id` | int | Clave primaria. |
| `email` | str(255) | Único e indexado; es el identificador de login. |
| `hashed_password` | str(255) | Hash Argon2; nunca la contraseña en claro. |
| `full_name` | str(255) | Nombre visible. |
| `role` | `UserRole` (enum `user_role`) | `admin` / `trainer` / `member`. Por defecto `member`. |
| `is_active` | bool | `false` = cuenta dada de baja. |
| `created_at` | datetime (tz) | Fecha de alta. |
| `deactivated_at` | datetime (tz) | Fecha de baja; `null` si la cuenta está activa. |

**Relaciones**

- Un `User` tiene muchas `Membership`, `Booking` (como socio) y `Payment` (cascade delete-orphan).
- Es referenciado por `GymClass.trainer_id` y por `RevokedToken.user_id`.

**Reglas**

- El `email` es **único**: crear una cuenta o cambiar a un email ya usado devuelve **409**
  («El email ya está registrado»).
- Un usuario con `is_active = false` **no puede entrar**: el login responde **403**
  («La cuenta está desactivada») y sus tokens dejan de valer.
- Darse de baja **no borra** la cuenta: pone `is_active = false` y `deactivated_at`. La **primera**
  fecha de baja se conserva; al reactivar, `deactivated_at` vuelve a `null`.
- En el registro, el rol **no lo elige** quien llama: siempre se crea un `member`.

### Role

Rol de un usuario; define qué puede hacer (RBAC). En el código es el enum `UserRole`; en la base de
datos, el tipo `user_role`.

**Valores:** `admin` (administrador), `trainer` (entrenador), `member` (socio).

**Reglas**

- El acceso se decide en el **backend**, en cada endpoint (`require_admin`, `require_staff`,
  `require_member_or_admin`) y con comprobaciones de propiedad del dato.
- Ocultar rutas en el frontend es solo experiencia de usuario; la autorización real está en el
  backend.

### Token

Credencial firmada (**JWT**, HS256) que abre una sesión. **No es una tabla**: se genera en
`core/security.py`.

**Tipos**

- **Access token** (`type = "access"`): abre los endpoints. Vida corta
  (`ACCESS_TOKEN_EXPIRE_MINUTES`, 60 por defecto). Claims: `sub`, `type`, `jti`, `iat`, `exp`, `role`.
- **Refresh token** (`type = "refresh"`): solo sirve para pedir un access token nuevo. Vida larga
  (`REFRESH_TOKEN_EXPIRE_DAYS`, 7 por defecto). Claims: `sub`, `type`, `jti`, `iat`, `exp`.

**Claims**

| Claim | Significado |
| --- | --- |
| `sub` | `id` del usuario (como texto). |
| `type` | `access` o `refresh`. |
| `jti` | Identificador único del token (permite revocarlo). |
| `iat` / `exp` | Emitido en / caduca en. |
| `role` | Rol del usuario (solo en el access token). |

**Reglas**

- Un access token no sirve como refresh, ni al revés (`decode_token` comprueba el `type`).
- Un token caducado o con su `jti` revocado **no vale**.
- Se envía en la cabecera `Authorization: Bearer <access_token>`.

### RevokedToken

Token que ya no abre sesión (logout). Tabla `revoked_tokens`. **Añadida en la parte 2 (#408).**

**Atributos**

| Nombre | Tipo | Notas |
| --- | --- | --- |
| `id` | int | Clave primaria. |
| `jti` | str(64) | Único e indexado; identifica el token sin guardarlo. |
| `user_id` | int | Clave foránea a `users.id`. |
| `expires_at` | datetime (tz) | Caducidad del token; permite purgar filas antiguas. |
| `revoked_at` | datetime (tz) | Cuándo se revocó. |

**Reglas**

- Solo se guarda el `jti`, **nunca el token completo**.
- Revocar dos veces el mismo `jti` conserva la primera fila.
- El logout revoca el access token de la sesión y, si se envía, su refresh token (debe ser del
  mismo usuario).
- En cada petición protegida se comprueba que el `jti` no esté revocado.

### Repository (no es una entidad)

La capa `app/repositories/` **no es una entidad de dominio**: es dónde vive el acceso a datos (SQL),
separado de las reglas de negocio (`services/`). Detalle en la spec #403.

## Glosario (términos que no se deben confundir)

| Término | Qué es |
| --- | --- |
| **Autenticación** | Quién eres: comprobar credenciales o token. |
| **Autorización** | Qué puedes hacer: rol y propiedad del dato. |
| **Access token** | Token que abre los endpoints; vida corta. |
| **Refresh token** | Token que solo sirve para obtener access tokens; vida larga. |
| **Revocar** | Anular un token concreto por su `jti` (logout). **No** es dar de baja a un usuario. |
| **Dar de baja / desactivar** | Poner `is_active = false` en un `User`. **No** es revocar un token. |
| **Rol** | `admin` / `trainer` / `member`. |
| **Socio** | Usuario con rol `member`. En el panel del entrenador a veces aparece como «miembro»: es lo mismo. |
| **Activo (`is_active`)** | Estado de la cuenta de usuario. No confundir con el `status` de una `Membership` (`active` / `expired` / `cancelled`). |
| **hashed_password** | Hash de la contraseña; nunca la contraseña. |

## Otras entidades del dominio (fuera de esta parte)

El proyecto tiene más entidades (`MembershipPlan`, `Membership`, `Room`, `GymClass`, `ClassSchedule`,
`Booking`, `Payment`). Se describen en el diagrama ER (`docs/er-diagram.pdf`). Esta ontología cubre,
por ahora, las de **usuarios y acceso**; se ampliará cuando sus specs lo necesiten.
