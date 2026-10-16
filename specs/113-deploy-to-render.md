# Spec 113: desplegar la API, la base de datos y la web en Render

- **Tarea:** #113 (parte de #110; cubre también la elección de #111 y la base de datos de #112)
- **Estado:** escrita antes del código (16 de octubre de 2026)

## Historia de usuario

Como cliente, quiero la aplicación publicada en una URL HTTPS para poder usarla y enseñarla el día de
la presentación (20 de octubre).

## Decisiones

- **Proveedor: Render** (#111). Tiene plan gratuito para las tres piezas (servicio Docker,
  PostgreSQL gestionado y web estática), HTTPS automático y se configura entero con un archivo
  `render.yaml` en el repositorio (Blueprint), así que el despliegue queda versionado y revisable.
  Railway solo da crédito de prueba; AWS y GCP piden más configuración de la que cabe en el plazo.
- **API:** la imagen de `backend/Dockerfile`, la misma que en local.
- **Base de datos:** PostgreSQL gestionado de Render (#112). Las migraciones se aplican al arrancar el
  contenedor, como ya hace la imagen.
- **Web:** web estática de Render construida desde `frontend/`, sin cambiar código del frontend:
  la URL de la API se pasa en `VITE_API_URL` al construir, y las rutas de React Router se reescriben a
  `index.html` en el `render.yaml`.

## Requisitos

1. `render.yaml` en la raíz define la base de datos, el servicio de la API y la web estática.
2. **Secretos en la plataforma, nunca en el repositorio:** `SECRET_KEY` la genera Render;
   `DATABASE_URL` sale de la base de datos; `CORS_ORIGINS`, `FRONTEND_URL` y `VITE_API_URL` se
   rellenan en el panel al crear el Blueprint (`sync: false`).
3. **`DATABASE_URL` de Render:** Render la da como `postgresql://...` (o `postgres://...`), y
   SQLAlchemy con psycopg 3 necesita `postgresql+psycopg://...`. La configuración la convierte sola;
   una URL que ya trae el driver, u otra base de datos, no se toca.
4. **IP real del cliente:** detrás del proxy de Render todas las peticiones llegan desde la misma IP.
   Uvicorn arranca con `--proxy-headers` para leer `X-Forwarded-For`; si no, el límite de intentos de
   login (#409) bloquearía a todos los usuarios a la vez.
5. **Puerto:** la imagen escucha en `$PORT` si la plataforma lo da, y en 8000 si no.
6. **Datos de demo:** con `SEED_DEMO_DATA=true` el contenedor ejecuta `python -m app.db.seed` tras las
   migraciones. El seed no hace nada si ya hay usuarios, así que reiniciar no duplica datos. En local
   la variable no está y nada cambia.
7. **Logs:** `LOG_FILE` vacío en Render (el usuario del contenedor no puede escribir en `/app`); los
   logs van a la salida estándar y se ven en el panel.
8. **Health check:** Render comprueba `GET /health`.
9. `docs/deploy.md` explica los pasos en el panel, las variables y la prueba de humo (#114).

## Criterios de aceptación

| Caso | Resultado |
| --- | --- |
| `DATABASE_URL=postgresql://u:p@h/db` o `postgres://u:p@h/db` | Se usa `postgresql+psycopg://u:p@h/db` |
| `DATABASE_URL` con driver o de otro motor (`sqlite://...`) | Igual |
| Contenedor en local sin `SEED_DEMO_DATA` ni `PORT` | Arranca como antes, en el 8000 y sin seed |
| Blueprint en Render | Crea base de datos, API y web; la API responde `/health` y `/docs` por HTTPS |
| Login desde la web desplegada | Funciona (CORS correcto y `VITE_API_URL` apuntando a la API) |
| Recargar una ruta interna de la web (`/login`) | Carga la página, no un 404 |
| Tests | `ruff check .` y `pytest` en verde |

## Fuera de alcance

Dominio propio, Cloudflare delante de Render, Vercel, CI/CD de despliegue más allá del autodespliegue
de Render, copias de seguridad, y planes de pago. El plan gratuito duerme la API tras 15 minutos sin
uso (el primer acceso tarda en despertar) y borra la base de datos gratuita a los 30 días.
