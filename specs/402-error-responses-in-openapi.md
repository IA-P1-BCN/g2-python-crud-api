# Spec 402: respuestas de error documentadas en Swagger

- **Tarea:** #402
- **Nivel del briefing:** Medio («Documentación Swagger enriquecida: tags, descripciones, ejemplos,
  respuestas de error»)
- **Estado:** escrita antes del código (13 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md`; catálogo de errores en `docs/errores.md`

## Historia de usuario

Como persona que integra otro producto con la API, quiero ver en `/docs` y `/redoc` qué errores
puede devolver cada endpoint y con qué forma, para tratarlos sin leer el código.

## Contexto

La API ya devuelve todos los errores con la misma forma (`detail` y `code`) y están catalogados en
`docs/errores.md`. Pero OpenAPI no los declara: en Swagger cada operación muestra solo su respuesta
correcta y, cuando tiene parámetros, un 422 con el esquema por defecto de FastAPI
(`HTTPValidationError`), que **no** es la forma real de nuestros 422 porque le falta `code`.

## Requisitos

1. Cada operación declara en OpenAPI los errores que puede devolver, entre 400, 401, 403, 404, 409
   y 422.
2. Cada error declarado lleva una descripción en español, el esquema de la respuesta y un ejemplo.
3. El esquema del 422 es el real de la API: `detail` (texto, o lista de campos que fallan) y `code`.
   Ninguna operación referencia `HTTPValidationError`.
4. La descripción, el esquema y el ejemplo de cada código se definen en **un solo sitio**; las
   rutas solo dicen qué códigos les aplican.
5. No cambia ninguna respuesta de la API: solo cambia la documentación.

## Qué código declara cada operación

| Código | Lo declara una operación cuando… |
| --- | --- |
| 400 | Tiene una regla de negocio que puede no cumplirse (reservar sin membresía, cancelar fuera de plazo, contraseña actual incorrecta, plan inactivo, entrenador que no lo es) |
| 401 | Requiere sesión, o es un login |
| 403 | Requiere un rol concreto, comprueba que el dato sea del usuario, o es un login (cuenta dada de baja) |
| 404 | Recibe un id en la ruta, o un id en el cuerpo que tiene que existir |
| 409 | Puede chocar con datos existentes (nombre o email repetido, plazas, solapes, borrado con dependientes) |
| 422 | Recibe cuerpo, parámetros de consulta o parámetros de ruta |

## Criterios de aceptación

- [ ] Toda operación protegida declara 401.
- [ ] Toda operación a la que algún rol con sesión recibe 403 en la matriz de permisos
      (`tests/integration/test_permissions.py`) declara 403.
- [ ] Toda operación con un parámetro en la ruta declara 404.
- [ ] Toda operación con cuerpo o parámetros declara 422, con el esquema propio.
- [ ] Todas las respuestas de error declaradas usan los esquemas de error de la API y tienen ejemplo.
- [ ] `/docs` y `/redoc` siguen cargando, y el test que exige resumen y descripción sigue pasando.
- [ ] Los tests anteriores pasan sin cambios.
- [ ] `docs/errores.md` indica que cada endpoint lista sus errores en Swagger.

## Fuera de alcance

- Un ejemplo distinto por endpoint: hay un ejemplo representativo por código. El mensaje exacto de
  cada caso está en `docs/errores.md`.
- El 429 del límite de intentos de login (#409) y el 500.
- Cambiar mensajes o códigos de error.
