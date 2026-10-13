# Athletica

Aplicación de gestión de un gimnasio: socios, membresías, clases y reservas.
Monorepo con una API REST en FastAPI (`backend/`) y una web en React (`frontend/`).

> **Estado:** el backend tiene la estructura de carpetas y las dependencias.
> El frontend ya arranca. Este README se irá completando (usuarios demo, Docker
> y enlaces a Swagger).

## Documentación

- **Diagrama ER:** [docs/er-diagram.pdf](docs/er-diagram.pdf) — diseño relacional
  (8 tablas: `users`, `membership_plans`, `memberships`, `payments`, `rooms`,
  `classes`, `class_schedules` y `bookings`).

## Capturas y diagramas

### Aplicación

Añade las capturas en `docs/screenshots/` para que los enlaces queden activos:

![Home pública](docs/screenshots/home.png)
![Panel del socio](docs/screenshots/member-dashboard.png)
![Panel del administrador](docs/screenshots/admin-dashboard.png)
![Sesiones del entrenador](docs/screenshots/trainer-sessions.png)

### Base de datos relacional

El diagrama ER versionado está en [docs/er-diagram.pdf](docs/er-diagram.pdf).
Si prefieres una imagen para la portada de GitHub, exporta el diagrama a
`docs/screenshots/er-diagram.png` y referéncialo aquí:

![Diagrama ER](docs/screenshots/er-diagram.png)

## Requisitos

Instala esto una sola vez en tu equipo:

| Herramienta | Versión | Para qué | Comprobar |
| ----------- | ------- | -------- | --------- |
| Git | 2.40 o superior | Control de versiones | `git --version` |
| Python | 3.12 o superior | Backend (la CI usa 3.12) | `python --version` |
| Node.js | 22 LTS | Frontend (la CI usa 22); incluye `npm` | `node --version` |
| Docker | Desktop reciente | PostgreSQL en local | `docker --version` |

## Instalación

```bash
git clone https://github.com/IA-P1-BCN/g2-python-crud-api.git
cd g2-python-crud-api
```

### Backend

Desde la carpeta `backend/`:

**Windows (PowerShell)**

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -e ".[dev]"
Copy-Item .env.example .env
```

Si PowerShell no deja activar el entorno, ejecuta una vez
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` y vuelve a intentarlo.

**macOS / Linux / Git Bash**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # en Git Bash: source .venv/Scripts/activate
python -m pip install --upgrade pip
pip install -e ".[dev]"
cp .env.example .env
```

`pip install -e ".[dev]"` lee `backend/pyproject.toml` e instala:

- **Aplicación:** `fastapi[standard]`, `sqlalchemy`, `alembic`, `psycopg[binary]`,
  `pydantic-settings`, `pyjwt`, `pwdlib[argon2]`
- **Desarrollo:** `pytest`, `pytest-cov`, `ruff`, `pre-commit`

Para añadir una dependencia nueva, escríbela en `pyproject.toml` y vuelve a ejecutar
`pip install -e ".[dev]"`. No uses `pip install paquete` suelto: el resto del equipo no
lo tendría.

Comprobar que todo está bien (con el entorno activado):

```bash
ruff check .        # debe decir "All checks passed!"
pytest              # "no tests ran" hasta que haya tests
```

Cada vez que abras una terminal nueva tienes que volver a activar el entorno virtual.

### Frontend

Desde la carpeta `frontend/`:

```bash
cd frontend
npm install
cp .env.example .env             # en PowerShell: Copy-Item .env.example .env
npm run dev                      # http://localhost:5173
```

Comprobar:

```bash
npm run lint
npm run test
```

Más detalle (scripts, estructura, tests E2E) en [frontend/README.md](frontend/README.md).

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción |
| -------- | ----------- |
| `DATABASE_URL` | Conexión PostgreSQL con psycopg 3 |
| `AUTO_CREATE_TABLES` | Crear tablas automáticamente (solo throwaway; dejar `false` con Alembic) |
| `SECRET_KEY` | Clave JWT |
| `ALGORITHM` | Algoritmo JWT (`HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token |
| `CORS_ORIGINS` | Orígenes permitidos (CSV) |
| `LOG_LEVEL` | Nivel de log |
| `LOG_FILE` | Fichero de log rotativo (vacío = solo consola) |

### Frontend (`frontend/.env`)

| Variable | Descripción |
| -------- | ----------- |
| `VITE_API_URL` | Base URL de la API (`/api/v1` en dev) |

## Estructura del repositorio

```text
.
├── .github/workflows/ci.yml   # CI: job de backend (ruff + pytest) y job de frontend
├── backend/
│   ├── app/
│   │   ├── main.py            # crea la app FastAPI
│   │   ├── core/              # config, security (JWT y hash), logging, exceptions
│   │   ├── db/                # base, session, seed
│   │   ├── models/            # tablas SQLAlchemy, un archivo por tabla
│   │   ├── schemas/           # schemas Pydantic, un archivo por recurso
│   │   ├── services/          # reglas de negocio
│   │   └── api/
│   │       ├── deps.py        # dependencias comunes: sesión, usuario actual, roles
│   │       └── v1/            # routers, un archivo por recurso
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── unit/              # tests de services
│   │   └── integration/       # tests de endpoints
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── .env.example
└── frontend/                  # React + Vite + TypeScript
```

Capas del backend: el **router** recibe y responde, el **service** decide y el **model**
persiste. Las reglas de negocio van siempre en `services/`.

## Cómo trabajamos

- **Idioma:** código, nombres y comentarios en inglés; documentación en español.
- **Ramas:** salen de `dev` y vuelven a `dev` por pull request. Nombre:
  `tipo/HU-XX-descripcion-corta`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/es/):
  `feat(bookings): ...`, `fix: ...`, `test(auth): ...`, `docs: ...`, `refactor: ...`,
  `chore: ...`.
- **Pull requests:** pequeños (una historia o menos), con `Closes #N` en la descripción,
  una aprobación y la CI en verde.
- **Secretos:** `.env` nunca se sube. Si añades una variable, añádela también a
  `.env.example` con un valor ficticio.

## Documentación

- **Diagrama ER:** [docs/er-diagram.pdf](docs/er-diagram.pdf)
- **Design tokens:** [docs/design-tokens.md](docs/design-tokens.md)
- **README del frontend:** [frontend/README.md](frontend/README.md)
