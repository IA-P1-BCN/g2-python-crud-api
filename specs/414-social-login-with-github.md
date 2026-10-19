# Spec 414: login con GitHub (OAuth2)

- **Tarea:** #414
- **Nivel del briefing:** Experto
- **Estado:** escrita antes del código (16 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (User, Token, Role)

## Historia de usuario

Como usuario, quiero entrar con mi cuenta de GitHub para no necesitar otra contraseña.

## Decisiones (16 de octubre)

- **Proveedor: GitHub** (OAuth App de GitHub, flujo *authorization code*).
- **Entrega de la sesión:** al volver de GitHub, la API **redirige a la web**, a
  `FRONTEND_URL/auth/callback`, con los tokens en el **fragmento** (`#access_token=...`), que el
  navegador no envía a ningún servidor ni guarda en los logs.
- **Solo backend, sin botón en la web** (decisión de Eva, 16 de octubre): a los socios de un
  gimnasio no les encaja «Entrar con GitHub». La integración OAuth2 queda hecha y se demuestra
  abriendo `/auth/github/login` en el navegador. Para socios reales se cambiaría el proveedor a
  Google con el mismo flujo.
- **Sin dependencias nuevas:** las llamadas a GitHub usan `httpx`, que ya instala
  `fastapi[standard]`.
- **Sin columnas nuevas:** la cuenta se identifica por el **email verificado** que GitHub
  confirma, igual que el login normal se identifica por el email.

## Requisitos

1. **Configuración** en variables de entorno, con valores falsos en `.env.example`:
   `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` y `GITHUB_REDIRECT_URI` (la URL del callback, que
   debe coincidir con la registrada en GitHub). En Render se piden en el panel (`sync: false`).
2. `GET /auth/github/login` redirige a GitHub para autorizar (permisos `read:user` y
   `user:email`). Si el login con GitHub no está configurado, responde 400 en JSON.
3. **Protección CSRF:** `login` genera un `state` aleatorio, lo envía a GitHub y lo guarda en una
   cookie `HttpOnly`, `SameSite=Lax`, de 10 minutos y limitada a la ruta del callback. El callback
   solo sigue si el `state` que vuelve coincide con el de la cookie; después la borra.
4. `GET /auth/github/callback` cambia el `code` por un token de GitHub, lee el **email primario y
   verificado** y el nombre, y:
   - si no hay usuario con ese email, crea uno con **rol de socio**, con el email ya verificado y
     una contraseña aleatoria que nadie conoce (puede crear una propia con «He olvidado mi
     contraseña»);
   - si ya existe, **lo enlaza**: entra en esa cuenta, sin duplicarla, y marca el email como
     verificado;
   - abre la sesión igual que el login normal (token de acceso y de refresco).
5. **Errores del callback:** el usuario está en el navegador, así que no se responde JSON: se
   redirige a `FRONTEND_URL/auth/callback#error=<mensaje>`. Casos:
   - `state` ausente, distinto o caducado, o el usuario cancela en GitHub;
   - GitHub rechaza el `code` o no responde;
   - la cuenta de GitHub no tiene un email verificado;
   - la cuenta está desactivada;
   - la cuenta tiene la verificación en dos pasos activa (#415): GitHub no puede saltarse el
     segundo paso, así que se pide entrar con email, contraseña y código.
6. El token de GitHub solo se usa durante el callback; no se guarda.

## Criterios de aceptación

| Caso | Resultado |
| --- | --- |
| `login` configurado | 307 a `github.com/login/oauth/authorize` con `client_id`, `redirect_uri`, `scope` y `state`; cookie con el mismo `state` |
| `login` sin configurar | 400 |
| Callback con email nuevo | 307 a la web con tokens; usuario nuevo, socio y con email verificado |
| Callback con email existente | 307 a la web con tokens de ese usuario; no se crea otro |
| Callback sin cookie o con `state` distinto | 307 a la web con `#error=`; no se llama a GitHub |
| GitHub devuelve `error` (el usuario cancela) | 307 con `#error=` |
| Sin email verificado / cuenta desactivada / 2FA activa | 307 con `#error=` y el motivo |
| Tests | No llaman a GitHub: las respuestas se simulan |

## Fuera de alcance

Google, enlazar o desenlazar proveedores desde el perfil, guardar el id de GitHub, y el botón y la
página `/auth/callback` del frontend.
