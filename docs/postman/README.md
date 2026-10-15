# Colección Postman

1. Importa `docs/openapi.json` o el archivo `docs/postman/Athletica.postman_collection.json`.
2. Importa `docs/postman/Athletica.postman_environment.json` y elige el entorno **Athletica Local**.
3. Ejecuta `POST /api/v1/auth/login` o `POST /api/v1/auth/token`; el token se guarda automáticamente en `{{token}}`.
4. El resto de peticiones usa `{{base_url}}` por defecto (`http://localhost:8000`).
