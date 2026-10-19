# Spec 409: límite de intentos en el login

- **Tarea:** #409
- **Nivel del briefing:** Avanzado («Rate limiting en el endpoint de login para mitigar ataques de
  fuerza bruta»)
- **Estado:** escrita antes del código (14 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md`

## Historia de usuario

Como responsable del servicio, quiero limitar los intentos de login, para que probar contraseñas
una tras otra sea lento e inútil.

## Decisiones (tomadas el 14 de octubre)

- **Qué se cuenta:** los intentos de login desde una misma dirección IP, salgan bien o mal.
- **Dónde se cuenta:** en memoria del backend. Se pone a cero al reiniciar y no se comparte entre
  varias copias del servidor; con un único servidor es suficiente. Si se despliega con varias
  copias, habría que moverlo a la base de datos o a Redis.

## Requisitos

1. Desde una misma IP se permiten como máximo **5 intentos de login por minuto**. Los dos números
   son configurables: `LOGIN_RATE_LIMIT_ATTEMPTS` y `LOGIN_RATE_LIMIT_WINDOW_SECONDS`.
2. El límite se aplica a los dos logins: `POST /auth/login` (JSON) y `POST /auth/token` (OAuth2).
   Los dos comparten la misma cuenta: no se puede esquivar el límite cambiando de endpoint.
3. El intento que supera el límite responde **429** con `code: too_many_requests`, un mensaje
   claro y la cabecera `Retry-After` con los segundos que faltan.
4. Mientras se está por encima del límite, la contraseña ni siquiera se comprueba.
5. La ventana es deslizante: un intento deja de contar justo un minuto después de hacerse.
6. Cada IP tiene su propia cuenta.
7. Un 429 queda registrado en el log con la IP.
8. El 429 aparece en `docs/errores.md` y en Swagger.

## Criterios de aceptación

| Caso | Resultado esperado |
| --- | --- |
| 5 intentos en un minuto desde la misma IP | Los 5 se atienden con normalidad (200, 401 o 403 según las credenciales) |
| El sexto intento dentro del mismo minuto | 429, `too_many_requests`, cabecera `Retry-After` |
| El sexto intento con la contraseña correcta | También 429: no se comprueba |
| Intentos repartidos entre `/auth/login` y `/auth/token` | Cuentan juntos |
| Pasado un minuto desde el primer intento | Se puede volver a intentar |
| Otra IP | No le afecta el límite de la primera |
| Registro, refresco y el resto de la API | Sin límite |
| `LOGIN_RATE_LIMIT_ATTEMPTS` y `LOGIN_RATE_LIMIT_WINDOW_SECONDS` | Cambian el límite y la ventana |
| Tests | No esperan un minuto real: el reloj es inyectable |

## Fuera de alcance

- Límite por cuenta (fallos por email) y bloqueo de cuentas.
- Guardar la cuenta en base de datos o Redis.
- Límites en otros endpoints.
