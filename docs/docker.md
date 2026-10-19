# Docker en el backend

Cómo construir, arrancar, mirar y parar el backend con Docker. Todos los comandos se ejecutan desde
la carpeta `backend/`, con Docker Desktop abierto.

Archivos: `backend/docker-compose.yml` (qué se levanta), `backend/Dockerfile` (cómo se construye la
imagen de la API) y `backend/.dockerignore` (qué se queda fuera de la imagen).

## Qué se levanta

`docker-compose.yml` define dos servicios:

| Servicio | Qué es | Puerto en tu ordenador |
| --- | --- | --- |
| `db` | PostgreSQL 16, con el usuario, la contraseña y la base de datos `athletica` | 5432 |
| `api` | La API de Athletica, construida con el `Dockerfile` | 8000 |

La API espera a que la base de datos esté lista, aplica las migraciones de Alembic y después empieza
a atender. Los datos de PostgreSQL se guardan en el volumen `athletica_pgdata`, así que no se pierden
al parar los contenedores.

## Dos formas de trabajar

### A. Solo la base de datos en Docker (para desarrollar)

Es la habitual: PostgreSQL corre en Docker y la API en tu terminal, con recarga automática al
guardar un archivo.

```bash
docker compose up -d db
source .venv/Scripts/activate
alembic upgrade head
python -m app.db.seed
uvicorn app.main:app --reload
```

`alembic upgrade head` crea o actualiza las tablas y `python -m app.db.seed` crea los usuarios de
demo si la base de datos está vacía. Tu `backend/.env` tiene que apuntar al puerto de la tabla de
arriba (ver "Si el puerto 5432 está ocupado").

### B. Todo en Docker (para probar como en producción)

```bash
docker compose up -d --build
docker compose exec api python -m app.db.seed
```

La API queda en <http://localhost:8000> y la documentación en <http://localhost:8000/docs>. Las
migraciones las aplica el contenedor al arrancar; solo hay que lanzar a mano los datos de demo, y
solo la primera vez.

En esta forma la API no lee tu `.env`: usa los valores escritos en `docker-compose.yml`.

La misma imagen es la que se despliega en Render (`docs/deploy.md`). Allí lleva además
`SEED_DEMO_DATA=true`, que carga los datos de demo al arrancar, y `PORT`, el puerto que da la
plataforma. En local ninguna de las dos está puesta y no cambia nada.

## Comandos del día a día

| Para | Comando |
| --- | --- |
| Construir la imagen de la API | `docker compose build api` |
| Arrancar todo en segundo plano | `docker compose up -d` |
| Arrancar reconstruyendo, tras cambiar código o dependencias | `docker compose up -d --build` |
| Ver qué está arrancado y si está sano | `docker compose ps` |
| Ver los logs de la API en directo | `docker compose logs -f api` |
| Ver los logs de la base de datos | `docker compose logs -f db` |
| Parar sin borrar nada | `docker compose stop` |
| Volver a arrancar lo parado | `docker compose start` |
| Parar y quitar los contenedores (los datos se conservan) | `docker compose down` |
| Parar y **borrar también los datos** | `docker compose down -v` |

`docker compose ps` muestra `healthy` cuando el servicio responde: la base de datos se comprueba con
`pg_isready` y la API con una llamada a `/health`.

Después de `docker compose down -v` la base de datos vuelve a estar vacía: hay que aplicar las
migraciones y lanzar otra vez los datos de demo.

## Mirar dentro de la base de datos

```bash
docker compose exec db psql -U athletica -d athletica
```

Dentro de `psql`:

| Orden | Qué hace |
| --- | --- |
| `\dt` | Lista las tablas |
| `\d users` | Muestra las columnas de una tabla |
| `SELECT email, role, is_active FROM users;` | Consulta los usuarios |
| `\q` | Salir |

## Si el puerto 5432 está ocupado

Pasa cuando ya tienes un PostgreSQL instalado en el ordenador. El contenedor no arranca y el error
menciona el puerto (`port is already allocated` o `address already in use`).

Solución, sin subir el cambio al repositorio: en `docker-compose.yml`, cambia el primer número del
puerto de `db`, que es el de tu ordenador, y deja el segundo como está.

```yaml
ports:
  - '5433:5432'
```

Y en tu `backend/.env`, usa ese mismo puerto:

```
DATABASE_URL=postgresql+psycopg://athletica:athletica@localhost:5433/athletica
```

## Problemas frecuentes

| Síntoma | Causa probable | Qué hacer |
| --- | --- | --- |
| `failed to connect to the docker API` | Docker Desktop está cerrado | Abrirlo y esperar a que termine de arrancar |
| La API local falla en el login con un error de conexión | El contenedor `db` está parado | `docker compose up -d db` |
| El login dice "Email o contraseña incorrectos" con los usuarios de demo | La base de datos no tiene los datos de demo, o se crearon antes del cambio de nombre a Athletica | `python -m app.db.seed`; si ya había datos antiguos, `docker compose down -v` y empezar de nuevo |
| Faltan tablas o columnas | Hay migraciones sin aplicar | `alembic upgrade head` (forma A) o reiniciar la API (forma B) |
| El puerto 8000 está ocupado | Hay otro `uvicorn` abierto | Cerrarlo antes de arrancar otro |

## Antes de desplegar

`docker-compose.yml` está pensado para el ordenador de cada persona. Tiene la contraseña de la base
de datos y `SECRET_KEY: change-me` a la vista; para un despliegue real esos valores tienen que venir
de secretos del proveedor, no de este archivo.

El frontend tiene su propia imagen (`frontend/Dockerfile`, servida con Nginx), que todavía no forma
parte de este `docker-compose.yml`.
