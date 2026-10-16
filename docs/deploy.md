# Despliegue en Render

Cómo publicar Athletica en Render: la API, su base de datos PostgreSQL y la web. Todo se define en
`render.yaml`, en la raíz del repositorio (un *Blueprint* de Render). Las decisiones están en
`specs/113-deploy-to-render.md`.

| Pieza | Nombre en Render | Qué es |
| --- | --- | --- |
| Base de datos | `athletica-db` | PostgreSQL gestionado, plan gratuito |
| API | `athletica-api` | La imagen de `backend/Dockerfile` |
| Web | `athletica-web` | Web estática construida desde `frontend/` |

Las tres van en la región de Frankfurt, la más cercana.

## Antes de empezar

- Una cuenta de Render con acceso al repositorio de GitHub de la organización.
- La rama que se despliega es **`main`**. Lo que no esté en `main` no se publica.

## Primer despliegue

1. En Render: **New → Blueprint** y elegir el repositorio `IA-P1-BCN/g2-python-crud-api`, rama `main`.
2. Render lee `render.yaml` y pide los valores marcados como secretos. Como aún no se conocen las
   URLs, la primera vez se ponen estas, que son las que Render suele dar a esos nombres:

   | Variable | Servicio | Valor |
   | --- | --- | --- |
   | `CORS_ORIGINS` | `athletica-api` | `https://athletica-web.onrender.com` |
   | `FRONTEND_URL` | `athletica-api` | `https://athletica-web.onrender.com` |
   | `VITE_API_URL` | `athletica-web` | `https://athletica-api.onrender.com/api/v1` |
| `GITHUB_CLIENT_ID` | `athletica-api` | El *Client ID* de la OAuth App de producción (ver abajo) |
| `GITHUB_CLIENT_SECRET` | `athletica-api` | Su *Client secret* |
| `GITHUB_REDIRECT_URI` | `athletica-api` | `https://athletica-api.onrender.com/api/v1/auth/github/callback` |

3. **Apply.** Render crea la base de datos, construye la imagen y la web. Tarda unos minutos.
4. Comprobar las URLs reales en el panel de cada servicio. Si Render ha añadido un sufijo al nombre
   (por ejemplo `athletica-api-x1y2.onrender.com`), corregir las tres variables en
   **Environment** de cada servicio y guardar. La web hay que **volver a construirla** (Manual
   Deploy → *Clear build cache & deploy*), porque `VITE_API_URL` se mete en el código al construir.

## Qué hace la API al arrancar

1. Aplica las migraciones pendientes (`alembic upgrade head`).
2. Carga los datos de demo (`SEED_DEMO_DATA=true`). Solo actúa si la base de datos está vacía, así
   que reiniciar o volver a desplegar no duplica nada.
3. Arranca uvicorn con `--proxy-headers`, para que el límite de intentos de login cuente la IP de
   cada persona y no la del proxy de Render.

## Variables de entorno

| Variable | Valor | De dónde sale |
| --- | --- | --- |
| `DATABASE_URL` | URL interna de `athletica-db` | Render, sola. La API le añade el driver `+psycopg` |
| `SECRET_KEY` | Aleatoria | Render la genera. Si cambia, todas las sesiones caducan |
| `CORS_ORIGINS` | URL de la web | A mano (paso 2) |
| `FRONTEND_URL` | URL de la web | A mano (paso 2). Es donde apuntan los enlaces de los correos |
| `LOG_FILE` | Vacío | `render.yaml`. Los logs se ven en la pestaña **Logs** |
| `SEED_DEMO_DATA` | `true` | `render.yaml` |
| `VITE_API_URL` | URL de la API con `/api/v1` | A mano (paso 2), en la web |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI` | Login con GitHub | A mano (paso 2). Si `GITHUB_CLIENT_ID` está vacío, el login con GitHub queda desactivado |

El resto (`ACCESS_TOKEN_EXPIRE_MINUTES`, `LOGIN_RATE_LIMIT_ATTEMPTS`...) usa los valores por
defecto de `backend/app/core/config.py`; se pueden añadir en **Environment** si hace falta.

Ningún secreto se escribe en el repositorio.

## Login con GitHub en producción

GitHub solo acepta una URL de vuelta por aplicación, así que la de producción es una **OAuth App
distinta** de la de local. En GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**:

- *Homepage URL:* la URL de la web.
- *Authorization callback URL:* la URL de la API + `/api/v1/auth/github/callback`.

Copiar el *Client ID*, generar un *Client secret* y ponerlos en `athletica-api`. El secreto solo se
ve una vez; no se guarda en ningún archivo.

## Prueba de humo (#114)

Con las URLs reales:

| Comprobación | Resultado esperado |
| --- | --- |
| `https://athletica-api.onrender.com/health` | `{"status":"ok"}` |
| `https://athletica-api.onrender.com/docs` | Swagger. **Authorize** con `admin@athletica.dev` / `Athletica123!` |
| `GET /api/v1/users` en Swagger con esa sesión | 200 con la lista de usuarios |
| Abrir la web e iniciar sesión con `member@athletica.dev` | Entra al panel del socio |
| Recargar la página estando en una ruta interna | La página carga, no da 404 |
| Iniciar sesión con contraseña mala 6 veces | La sexta responde 429 |

Si la web no puede iniciar sesión, mirar en la consola del navegador: un error de CORS significa que
`CORS_ORIGINS` no coincide exactamente con la URL de la web (sin `/` al final).

## Cada despliegue siguiente

Render vuelve a desplegar solo cuando entra un cambio en `main`. Las migraciones nuevas se aplican
al arrancar.

## Límites del plan gratuito

- La API **se duerme tras 15 minutos sin uso**; la primera petición después tarda en torno a un
  minuto. **Antes de la presentación**, abrir `/health` unos minutos antes.
- La base de datos gratuita **se borra a los 30 días**. Para la presentación basta.
- Los datos de demo usan contraseñas públicas: la URL es solo para la demo, no para datos reales.
  No dejar activada la verificación en dos pasos en los usuarios de demo.
