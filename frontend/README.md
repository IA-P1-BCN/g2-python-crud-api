# Athletica · Frontend

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
├── components/ui/  # Componentes: atoms/, molecules/, organisms/ (atomic design)
├── layouts/        # AppLayout (cabecera + navegación por rol)
├── pages/
│   ├── member/     # Pantallas del socio
│   ├── trainer/    # Pantallas del entrenador (HU-29)
│   └── admin/      # Pantallas del admin, planes (HU-28)
├── types/          # schema.d.ts generado desde OpenAPI
├── lib/            # queryClient, cn
└── styles/         # theme.css (design tokens de Figma)
tests/
├── unit/           # Vitest
└── e2e/            # Playwright
```

## Convenciones de componentes

**Carpetas.** Los componentes viven en `src/components/ui/` siguiendo atomic design, con una
carpeta por componente: `src/components/ui/<nivel>/<Nombre>/{Nombre.tsx, Nombre.test.tsx, index.ts}`.

- `atoms/`: piezas independientes (Button, Badge, Icon).
- `molecules/`: composiciones simples (Alert, Pagination, CapacitySummary, DayChip, EnrolledMemberRow, SessionCard).
- `organisms/`: bloques completos (Table, EnrolledMembersPanel, SessionList, WeekSelector).

El `index.ts` solo re-exporta el componente y sus tipos; los consumidores importan
con el alias: `import { Button } from '@/components/ui/atoms/Button'`.

**Naming.** Componentes en PascalCase con named export (nunca export default),
props como `NombreProps` y variantes como union types (`ButtonVariant`, `AlertVariant`,
`BadgeTone`). Un componente = un fichero = un test colocado al lado.

**Tokens.** Colores, espaciado, radios y tipografías salen SOLO de los tokens
(`src/styles/theme.css`, documentados en `docs/design-tokens.md` en la raíz):

- Sin hex ni valores arbitrarios: `bg-surface`, `text-text-muted`, `rounded-card`,
  `p-4` — nunca `bg-[#26282b]` ni `p-[10px]`.
- Espaciado en múltiplos de 4 px (paso de Tailwind: `p-1`=4, `p-4`=16, `p-8`=32…).
- Solo hay modo oscuro. Si falta un valor, se añade a `theme.css` y se documenta.

**Iconos.** Siempre con el átomo `Icon` (lucide-react), nunca SVGs sueltos:

```tsx
<Icon name="dumbbell" size={20} />
```

Tamaños: 16, 20 y 24 px (`size-4`, `size-5`, `size-6`). Un nombre nuevo se registra
en `src/components/ui/atoms/Icon/Icon.tsx` (tipo `IconName`).

**Cómo añadir un componente:**

1. Crear la carpeta en el nivel que corresponda: `src/components/ui/<nivel>/<Nombre>/`.
2. Escribir `Nombre.tsx` con props tipadas y named export.
3. Re-exportar desde `index.ts` (`export { Nombre } from './Nombre'` y sus tipos).
4. Añadir `Nombre.test.tsx` con Testing Library.
5. Importar donde haga falta: `import { Nombre } from '@/components/ui/<nivel>/<Nombre>'`.
6. Pasar `npm run lint`, `npm run format`, `npm run test` y `npm run build`.

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
