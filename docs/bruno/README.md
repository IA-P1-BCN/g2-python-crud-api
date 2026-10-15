# Colección Bruno

1. Abre la carpeta `docs/bruno` en Bruno.
2. Selecciona el entorno **local** (`environments/local.bru`).
3. Ejecuta `POST /api/v1/auth/login` o `POST /api/v1/auth/token`; el token se guarda automáticamente en `token`.
4. El resto de peticiones usan `{{base_url}}` por defecto (`http://localhost:8000`).
