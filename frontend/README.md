# Gym · Frontend

React + Vite + TypeScript. Consume la API FastAPI del repositorio.

## Stack

- **React Router** para el enrutado por rol.
- **TanStack Query** para caché y estado del servidor.
- **axios** como cliente HTTP centralizado.
- **Vitest + Testing Library** para tests unitarios.
- **Playwright** para tests end-to-end.
- **openapi-typescript** para generar los tipos desde el OpenAPI de FastAPI.

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev          # http://localhost:5173 (proxy /api -> localhost:8000)
```

## Scripts

| Script              | Descripción                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Servidor de desarrollo Vite     |
| `npm run build`     | Typecheck + build de producción |
| `npm run lint`      | ESLint                          |
| `npm run format`    | Prettier                        |
| `npm run test`      | Tests unitarios (Vitest)        |
| `npm run test:e2e`  | Tests E2E (Playwright)          |
| `npm run api:types` | Regenera tipos desde OpenAPI    |

## Estructura

```
src/
├── api/            # ÚNICO sitio que llama a la API (axios + interceptores)
├── auth/           # AuthContext, ProtectedRoute, tokenStorage, roles
├── components/ui/  # Button, Table, Pagination, Alert reutilizables
├── layouts/        # AppLayout (cabecera + navegación por rol)
├── pages/
│   ├── member/     # Pantallas del socio
│   ├── trainer/    # Pantallas del entrenador (HU-29)
│   └── admin/      # Pantallas del admin, planes (HU-28)
├── types/          # schema.d.ts generado desde OpenAPI
└── lib/            # queryClient
tests/
├── unit/           # Vitest
└── e2e/            # Playwright
```

## Cómo encajan front y back

**Generación de tipos.** El backend FastAPI publica su esquema en `/openapi.json`.
`npm run api:types` ejecuta `openapi-typescript` contra esa URL y escribe
`src/types/schema.d.ts`. Ese fichero **no se edita a mano**: si el backend cambia
un campo, el tipo cambia y el front deja de compilar, así que el contrato roto se
detecta en CI antes de desplegar.

**CORS.** En desarrollo, Vite hace proxy de `/api` hacia `http://localhost:8000`,
así que el navegador nunca cruza orígenes. En producción el front (Vercel/Netlify)
llama directamente a la URL del backend (Render/Railway): allí FastAPI debe permitir
el origen del front en `CORSMiddleware`.

**Dónde se guarda el token.** `AuthContext` guarda el usuario y el token de sesión
en `localStorage` (`src/auth/tokenStorage.ts`). El cliente axios añade la cabecera
`Authorization: Bearer <token>` en cada petición. Al recargar, la sesión se recupera
del almacenamiento.

**Token caducado.** Si el backend responde `401`, el interceptor de respuesta del
cliente borra la sesión y avisa a `AuthContext`, que cierra sesión y redirige al
login. Es un único punto (`src/api/client.ts`), no se repite en cada página.

**Errores de la API.** `toApiError` normaliza la respuesta: el `message` se muestra
con `<Alert variant="error">` en la pantalla correspondiente. TanStack Query expone
`isError`/`error` por consulta y mutación.

**Seguridad real.** Ocultar rutas con `ProtectedRoute` es solo UX: cualquiera puede
editar el estado en el navegador. La autorización de verdad se valida en el backend
en cada endpoint, comprobando el token y el rol. El front nunca es la frontera de
seguridad.

## Docker

```bash
docker build -t gym-frontend --build-arg VITE_API_URL=https://gym-api.onrender.com .
docker run -p 8080:80 gym-frontend
```

Nginx sirve la SPA con fallback a `index.html` y cachea los assets con hash.
