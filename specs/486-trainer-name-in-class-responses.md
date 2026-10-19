# Spec 486: nombre del entrenador en las respuestas de clases

- **Tarea:** #486 (la usa #487)
- **Estado:** escrita antes del código (17 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (GymClass, User, Role)

## Historia de usuario

Como socio, quiero ver quién da cada clase para elegir mis sesiones.

## Problema

Las pantallas del socio sacan el nombre del entrenador de `GET /users`, que solo pueden usar
entrenadores y admin: el socio recibe 403. Ningún endpoint que el socio pueda usar da ese nombre.

## Decisión (17 de octubre)

Las respuestas de clases incluyen `trainer_name` (decisión de Eva frente a quitar el nombre de las
pantallas del socio). Solo se expone el **nombre completo** del entrenador, que en un gimnasio es
información pública; nunca su email ni otros datos.

## Requisitos

1. `GymClassRead` gana `trainer_name: str`, el `full_name` del entrenador de la clase. Lo devuelven
   `GET /classes`, `GET /classes/{id}`, `POST /classes` y `PUT /classes/{id}`.
2. Si se cambia el entrenador de una clase, la respuesta trae el nombre del nuevo.
3. **Sin consultas de más:** la lista carga los entrenadores junto con las clases (una consulta
   para todos), no una por clase.
4. Sin cambios de permisos: leer clases sigue siendo público.
5. Sin cambios en la base de datos: el nombre sale de la relación que ya existe.

## Criterios de aceptación

| Caso | Resultado |
| --- | --- |
| `GET /classes` | Cada clase trae `trainer_name` correcto |
| `GET /classes/{id}`, sin sesión | Trae `trainer_name` |
| `POST` y `PUT` (cambiando el entrenador) | `trainer_name` del entrenador asignado |
| Lista con clases de varios entrenadores | El número de consultas no crece con el número de clases |
| Esquema OpenAPI | `trainer_name` aparece como obligatorio en `GymClassRead` |

## Fuera de alcance

Las pantallas del frontend (#487) y el nombre del entrenador en otras respuestas (horarios,
reservas).
