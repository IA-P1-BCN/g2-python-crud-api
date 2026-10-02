# GymFlow

Aplicación de gestión de un gimnasio: socios, membresías, clases y reservas.
Monorepo con una API REST en FastAPI (`backend/`) y una web en React (`frontend/`).

> **Estado:** el backend tiene la estructura de carpetas y las dependencias, todavía sin
> código. El frontend ya arranca. Este README se irá completando (usuarios demo, Docker,
> enlaces a Swagger y al diagrama ER).

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
