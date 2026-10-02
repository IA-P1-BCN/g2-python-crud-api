# GymFlow

Aplicación de gestión de un gimnasio: socios, membresías, clases y reservas.
Monorepo con una API REST en FastAPI (`backend/`) y una web en React (`frontend/`).

> **Estado:** el backend implementa el núcleo de la Fase 1 (base de datos, CRUDs, reglas de
> reservas, excepciones, Swagger y tests). El frontend ya arranca con las pantallas base.
> JWT/RBAC, caché, WebSockets y despliegue corresponden a fases posteriores.

## Requisitos

Instala esto una sola vez en tu equipo:

| Herramienta | Versión          | Para qué                                 | Comprobar          |
| ----------- | ---------------- | ---------------------------------------- | ------------------ |
| Git         | 2.40 o superior  | Control de versiones                     | `git --version`    |
| Python      | 3.12 o superior  | Backend (la CI usa 3.12)                 | `python --version` |
| Node.js     | 22 LTS           | Frontend (la CI usa 22); incluye `npm`   | `node --version`   |
| Docker      | Desktop reciente | PostgreSQL en local (aún no hace falta)  | `docker --version` |

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

## Ejecutar la API

Con PostgreSQL levantado y el entorno virtual activado:

```bash
cd backend
docker compose up -d db      # PostgreSQL en localhost:5432
cp .env.example .env         # en PowerShell: Copy-Item .env.example .env
python -m app.db.init_db     # crea las tablas
python -m app.db.seed        # datos de ejemplo (opcional)
uvicorn app.main:app --reload
```

- API: <http://localhost:8000>
- Documentación interactiva (Swagger UI): <http://localhost:8000/docs>
- ReDoc: <http://localhost:8000/redoc>

Con Docker (API + PostgreSQL):

```bash
cd backend
docker compose up --build
```

### Usuarios demo (`python -m app.db.seed`)

| Rol | Email | Contraseña |
| --- | --- | --- |
| admin | `admin@gymflow.dev` | `gymflow123` |
| trainer | `trainer@gymflow.dev` | `gymflow123` |
| member | `member@gymflow.dev` | `gymflow123` |

### Endpoints principales

| Método y ruta | Descripción |
| --- | --- |
| `GET /health` | Estado del servicio |
| `GET/POST /api/v1/users` | Listar / crear usuarios |
| `GET/PUT/DELETE /api/v1/users/{id}` | Consultar / editar / borrar usuario |
| `GET /api/v1/users/{id}/memberships` | Membresías de un usuario |
| `GET /api/v1/users/{id}/bookings` | Reservas de un usuario |
| `GET/POST /api/v1/membership-plans` (+ `/{id}`) | Planes de membresía |
| `GET/POST /api/v1/memberships` (+ `/{id}`) | Membresías |
| `GET/POST /api/v1/rooms` (+ `/{id}`) | Aulas |
| `GET/POST /api/v1/classes` (+ `/{id}`) | Clases |
| `GET /api/v1/classes/{id}/schedules` | Horarios de una clase |
| `GET/POST /api/v1/class-schedules` (+ `/{id}`) | Horarios |
| `GET /api/v1/class-schedules/{id}/bookings` | Reservas de un horario |
| `GET/POST /api/v1/bookings` (+ `/{id}`) | Reservas (`DELETE` cancela) |
| `GET/POST /api/v1/payments` (+ `/{id}`) | Pagos |
| `GET /api/v1/export/members.csv` | Exportar socios a CSV |
| `GET /api/v1/export/bookings.csv` | Exportar reservas a CSV |

Los listados están paginados con `?page=1&size=10` y devuelven
`{ items, total, page, size, pages }`. Los errores tienen el formato
`{ detail, code }` con códigos HTTP coherentes (400, 404, 409, 422).

### Reglas de negocio de las reservas

- Solo se puede reservar con una **membresía activa** en la fecha de la reserva.
- Si la clase está **llena** (aforo alcanzado) devuelve `409`.
- Un socio no puede tener **dos reservas solapadas** en el mismo horario (`409`).
- Cancelar una reserva la marca como `cancelled` y libera la plaza.

### Tests

```bash
cd backend
ruff check .     # lint
pytest           # unitarios + integración (26 tests)
```

## Estructura del repositorio

```
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
│   ├── pyproject.toml         # dependencias y configuración de ruff y pytest
│   ├── Dockerfile
│   └── .env.example
└── frontend/                  # React + Vite + TypeScript
```

Capas del backend: el **router** recibe y responde, el **service** decide y el **model**
persiste. Las reglas de negocio van siempre en `services/`.

## Cómo trabajamos

- **Idioma:** código, nombres y comentarios en inglés; documentación en español.
- **Ramas:** salen de `dev` y vuelven a `dev` por pull request. Nombre:
  `tipo/HU-XX-descripcion-corta`, por ejemplo `feature/HU-16-reservar-sesion`,
  `fix/HU-16-capacidad`, `docs/readme`, `test/bookings`.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/es/):
  `feat(bookings): ...`, `fix: ...`, `test(auth): ...`, `docs: ...`, `refactor: ...`,
  `chore: ...`.
- **Pull requests:** pequeños (una historia o menos), con `Closes #N` en la descripción,
  una aprobación y la CI en verde.
- **Antes de abrir un PR:** `git pull origin dev`, `ruff check --fix .` y `pytest` en
  `backend/`; `npm run lint` y `npm run test` en `frontend/`.
- **Secretos:** `.env` nunca se sube. Si añades una variable, añádela también a
  `.env.example` con un valor ficticio.
