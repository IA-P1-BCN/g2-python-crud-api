# Spec 403: capa de repositorios para usuarios

- **Tarea:** #403
- **Nivel del briefing:** Medio («Arquitectura por capas: routers, services, repositories, schemas»)
- **Estado:** escrita antes del código (13 de octubre de 2026)
- **Vocabulario:** `specs/ontology.md` (User)

## Historia de usuario

Como persona que mantiene el servicio de usuarios, quiero que el acceso a datos esté aislado en un
repositorio, para que los servicios contengan solo reglas de negocio y se puedan leer sin SQL.

## Contexto

Hoy hay cuatro piezas: rutas, servicios, modelos y esquemas. Las consultas a la base de datos se
construyen dentro de los servicios. El briefing pide una capa más, la de repositorios.

## Decisión de alcance

El 13 de octubre se decidió migrar **solo los usuarios**, que es el recurso sobre el que trata la
parte 2. El resto de recursos (planes, membresías, pagos, salas, clases, horarios y reservas)
conserva sus consultas en los servicios; migrarlos sería un refactor grande sin valor para la
entrega del 19 de octubre.

## Requisitos

1. Existe el paquete `app/repositories/` con un repositorio de usuarios.
2. Todas las lecturas y escrituras de la tabla `users` que hacen los servicios pasan por él:
   buscar por id, buscar por email, listar con filtros y paginación, contar con filtros, listar sin
   paginar (exportación), crear y guardar cambios.
3. El repositorio no contiene reglas de negocio: no decide si un email está repetido, no cifra
   contraseñas, no lanza errores de dominio (`NotFoundError`, `ConflictError`...). Devuelve datos o
   `None`.
4. Los servicios no construyen consultas SQL sobre `users`: no importan `select` para ese fin.
5. El contrato de la API no cambia en nada: mismas rutas, mismas respuestas, mismos códigos.
6. Las firmas públicas de `user_service` que usan otros módulos se mantienen.

## Qué es de cada capa

| Capa | Hace | No hace |
| --- | --- | --- |
| Router | Recibe la petición, comprueba permisos y responde | Reglas de negocio, consultas |
| Servicio | Decide: email único, cifrar la contraseña, alta y baja, errores de dominio | Construir SQL sobre `users` |
| Repositorio | Lee y escribe usuarios en la base de datos | Decidir o lanzar errores de dominio |
| Modelo | Define la tabla | Lógica |

## Criterios de aceptación

- [ ] Todos los tests existentes pasan **sin modificarlos**: el refactor no cambia comportamiento.
- [ ] `user_service`, `auth_service` y la exportación de socios no ejecutan consultas sobre `User`
      por su cuenta.
- [ ] Un test de arquitectura falla si un servicio de usuarios vuelve a construir una consulta
      sobre `User`.
- [ ] El repositorio tiene tests propios: buscar por id y por email (existe y no existe), filtros,
      paginación, recuento y guardado.
- [ ] El listado de socios del panel de administración sigue haciendo el mismo número de consultas.
- [ ] `AGENTS.md` describe las cuatro capas.

## Fuera de alcance

- Repositorios para el resto de recursos.
- Cambiar de ORM o de base de datos.
- Las cifras del panel de administración que cuentan usuarios junto con otras tablas
  (`dashboard_service`): siguen usando `user_service.count_users`, que ya delega en el repositorio.
