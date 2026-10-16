# Catálogo de errores de la API

Todos los errores de la API tienen la misma forma, sea cual sea el endpoint. Este documento dice
qué código HTTP corresponde a cada situación y qué mensajes devuelve hoy el backend.

Código fuente: `backend/app/core/exceptions.py` (tipos de error y formato) y `backend/app/services/`
(dónde se lanza cada uno).

Cada endpoint lista además sus errores posibles en la documentación interactiva (`/docs` y `/redoc`),
con el esquema y un ejemplo por código. Esa declaración sale de `backend/app/api/responses.py`.

## Forma de la respuesta

```json
{
  "detail": "No quedan plazas para esa clase",
  "code": "conflict"
}
```

- `detail`: el mensaje para la persona, en español. El frontend puede mostrarlo tal cual.
- `code`: una palabra fija para el programa. No cambia aunque se reescriba el mensaje.

La única excepción es el **422 de validación del cuerpo o de los parámetros**: ahí `detail` es una
lista, con un elemento por campo que falla.

```json
{
  "detail": [
    {
      "type": "weak_password",
      "loc": ["body", "password"],
      "msg": "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
    }
  ],
  "code": "validation_error"
}
```

`loc` dice dónde está el campo (`body`, `query` o `path`, y su nombre) y `msg` qué le pasa.

## Qué código se usa para qué

| HTTP | `code` | Cuándo | Qué debe hacer el frontend |
| --- | --- | --- | --- |
| 400 | `business_rule` | Los datos están bien escritos, pero una regla del gimnasio lo impide | Mostrar `detail` |
| 401 | `unauthorized` | No hay sesión, o el token ha caducado o no vale | Cerrar la sesión y llevar al login |
| 403 | `forbidden` | Hay sesión, pero ese rol o ese usuario no puede hacerlo | Mostrar la página de acceso denegado o `detail` |
| 404 | `not_found` | Lo que se pide no existe | Mostrar `detail` |
| 405 | `method_not_allowed` | La ruta existe, pero no con ese método | Es un error de programación del cliente |
| 409 | `conflict` | La petición choca con lo que ya hay guardado | Mostrar `detail` |
| 422 | `validation_error` | Datos mal formados o incoherentes | Mostrar `detail`, o el `msg` de cada campo si es una lista |
| 429 | `too_many_requests` | Demasiados intentos de login desde la misma IP | Mostrar `detail` y esperar los segundos de la cabecera `Retry-After` |
| 500 | `internal_error` | Fallo no previsto del servidor | Mensaje genérico; el detalle queda en los logs del backend |

Regla para distinguir los tres que más se confunden:

- **422**: el dato está mal por sí mismo (falta, tiene mal formato, no cumple la regla de contraseña).
- **400**: el dato está bien, pero el estado del gimnasio no lo permite (el socio no tiene membresía).
- **409**: el dato está bien, pero choca con otro registro (email repetido, clase llena, sala ocupada).

## Errores por módulo

### Sesión y permisos

| Situación | HTTP | `code` | `detail` |
| --- | --- | --- | --- |
| Petición sin token | 401 | `unauthorized` | Falta el token de acceso |
| Token caducado | 401 | `unauthorized` | El token ha caducado |
| Token manipulado o mal formado | 401 | `unauthorized` | Token inválido |
| Token de una cuenta dada de baja | 401 | `unauthorized` | La cuenta está desactivada |
| Token revocado con el logout | 401 | `unauthorized` | El token ha sido revocado |
| Token de refresco usado para entrar en un endpoint, o token de acceso usado para refrescar | 401 | `unauthorized` | Token inválido |
| Logout enviando el token de refresco de otro usuario | 401 | `unauthorized` | Token inválido |
| Login con email o contraseña incorrectos | 401 | `unauthorized` | Email o contraseña incorrectos |
| Login con una cuenta dada de baja | 403 | `forbidden` | La cuenta está desactivada |
| Login de una cuenta con verificación en dos pasos, sin `totp_code` | 401 | `totp_required` | Falta el código de verificación en dos pasos |
| Login de una cuenta con verificación en dos pasos, con un código incorrecto | 401 | `totp_invalid` | El código de verificación en dos pasos no es correcto |
| Login de Swagger (`/auth/token`) de una cuenta con verificación en dos pasos | 401 | `totp_required` | Esta cuenta tiene verificación en dos pasos: inicia sesión con /auth/login enviando el código en totp_code |
| Más de 5 intentos de login en un minuto desde la misma IP | 429 | `too_many_requests` | Demasiados intentos de inicio de sesión. Vuelve a intentarlo en {n} segundos |
| El rol no puede usar esa ruta | 403 | `forbidden` | No tienes permiso para realizar esta acción |
| El dato es de otro usuario, o la clase es de otro entrenador | 403 | `forbidden` | No tienes permiso para acceder a este recurso |

El login responde lo mismo si el email no existe que si la contraseña es incorrecta, para no revelar
qué emails están registrados.

### Usuarios

| Situación | HTTP | `code` | `detail` |
| --- | --- | --- | --- |
| Usuario inexistente | 404 | `not_found` | Usuario {id} no encontrado |
| Email ya usado por otro usuario | 409 | `conflict` | El email ya está registrado |
| Un admin intenta darse de baja a sí mismo | 409 | `conflict` | No puedes dar de baja tu propia cuenta |
| Cambio de contraseña con la actual incorrecta | 400 | `business_rule` | La contraseña actual no es correcta |
| Contraseña nueva débil | 422 | `validation_error` | Lista; `type: weak_password` |
| Rol que no existe | 422 | `validation_error` | Lista |
| Activar o desactivar la verificación en dos pasos con un código incorrecto | 400 | `business_rule` | El código no es correcto |
| Activar la verificación en dos pasos sin haberla preparado | 400 | `business_rule` | Primero prepara la verificación en dos pasos |
| Desactivar la verificación en dos pasos cuando no está activa | 400 | `business_rule` | La verificación en dos pasos no está activada |
| Preparar o activar la verificación en dos pasos cuando ya está activa | 409 | `conflict` | La verificación en dos pasos ya está activada |
| Enlace de verificación de email o de recuperación de contraseña caducado, manipulado, de otro tipo o ya usado | 400 | `business_rule` | El enlace no es válido o ha caducado |
| Recuperación con una contraseña nueva débil | 422 | `validation_error` | Lista; `type: weak_password` |

La contraseña actual incorrecta es un 400 y no un 401 a propósito: el usuario sí tiene sesión, y un
401 haría que el frontend lo expulsara.

### Planes y membresías

| Situación | HTTP | `code` | `detail` |
| --- | --- | --- | --- |
| Plan inexistente | 404 | `not_found` | Plan {id} no encontrado |
| Nombre de plan repetido | 409 | `conflict` | Ya existe un plan con ese nombre |
| Borrar un plan con membresías | 409 | `conflict` | No se puede borrar un plan con membresías asignadas; desactívalo en su lugar |
| Membresía inexistente | 404 | `not_found` | Membresía {id} no encontrada |
| Asignar un plan inactivo | 400 | `business_rule` | No se puede asignar un plan inactivo |
| Borrar una membresía con pagos | 409 | `conflict` | No se puede borrar una membresía con pagos; cancélala en su lugar |

### Pagos

| Situación | HTTP | `code` | `detail` |
| --- | --- | --- | --- |
| Pago inexistente | 404 | `not_found` | Pago {id} no encontrado |
| La membresía es de otro usuario | 422 | `validation_error` | La membresía no pertenece a ese usuario |
| Importe cero o negativo, estado desconocido o campo a `null` | 422 | `validation_error` | Lista |

### Salas

| Situación | HTTP | `code` | `detail` |
| --- | --- | --- | --- |
| Sala inexistente | 404 | `not_found` | Aula {id} no encontrada |
| Nombre de sala repetido | 409 | `conflict` | Ya existe un aula con ese nombre |
| Borrar una sala con clases u horarios | 409 | `conflict` | No se puede borrar un aula con clases u horarios asignados |

### Clases y horarios

| Situación | HTTP | `code` | `detail` |
| --- | --- | --- | --- |
| Clase inexistente | 404 | `not_found` | Clase {id} no encontrada |
| El `trainer_id` no es de un entrenador | 400 | `business_rule` | trainer_id debe corresponder a un entrenador |
| Borrar una clase con horarios | 409 | `conflict` | No se puede borrar una clase con horarios; borra antes sus horarios |
| Horario inexistente | 404 | `not_found` | Horario {id} no encontrado |
| La sala ya tiene otra clase a esa hora | 409 | `conflict` | El aula ya está ocupada en ese horario |
| El entrenador ya tiene otra clase a esa hora, al crear o editar un horario o al cambiar el entrenador de una clase | 409 | `conflict` | El entrenador ya tiene otra clase en ese horario |
| La hora de inicio no es anterior a la de fin | 422 | `validation_error` | Al crear, lista; al editar, "start_time debe ser anterior a end_time" |
| Horario sin sala | 422 | `validation_error` | Lista |
| Borrar un horario con reservas | 409 | `conflict` | No se puede borrar un horario con reservas |

### Reservas

| Situación | HTTP | `code` | `detail` |
| --- | --- | --- | --- |
| Reserva inexistente | 404 | `not_found` | Reserva {id} no encontrada |
| La fecha no cae en el día de la semana del horario | 422 | `validation_error` | La fecha de la reserva debe caer en el día de la semana del horario |
| La fecha ya pasó, o es hoy y la sesión ya ha empezado | 422 | `validation_error` | Esa sesión ya ha empezado o ya ha pasado |
| La clase está desactivada | 400 | `business_rule` | La clase no está activa |
| El socio no tiene membresía activa ese día | 400 | `business_rule` | El socio no tiene una membresía activa en esa fecha |
| No quedan plazas | 409 | `conflict` | No quedan plazas para esa clase |
| El socio tiene otra reserva que se solapa | 409 | `conflict` | El socio ya tiene una reserva en ese horario |
| Cancelar una reserva ya cancelada | 409 | `conflict` | La reserva ya estaba cancelada |
| Un socio cancela cuando faltan menos de 2 horas para la sesión, o ya pasó | 400 | `business_rule` | Las reservas se pueden cancelar hasta 2 horas antes de la clase |

Un administrador puede cancelar una reserva en cualquier momento; el plazo solo limita al socio.

### Comunes a todas las rutas

| Situación | HTTP | `code` | `detail` |
| --- | --- | --- | --- |
| Ruta que no existe | 404 | `not_found` | Recurso no encontrado |
| Método no admitido en esa ruta | 405 | `method_not_allowed` | Método no permitido |
| Id que no es un número, o paginación fuera de rango (`page` < 1, `size` < 1 o > 100) | 422 | `validation_error` | Lista |
| Fallo no previsto | 500 | `internal_error` | Internal server error |

## Cómo añadir un error nuevo

1. Elegir el tipo con la regla de arriba. Los tipos están en `backend/app/core/exceptions.py`:
   `NotFoundError`, `ConflictError`, `BusinessRuleError`, `InvalidDataError`,
   `AuthenticationError` y `PermissionDeniedError`.
2. Lanzarlo desde el **servicio**, nunca desde el router, con el mensaje en español.
3. Añadir un test que compruebe el código HTTP y el `code` de la respuesta.
4. Añadir la fila a este documento.

Las validaciones que solo dependen del propio dato (formato, rangos, campos obligatorios) no se
lanzan a mano: se declaran en el esquema de `backend/app/schemas/` y FastAPI responde el 422.
