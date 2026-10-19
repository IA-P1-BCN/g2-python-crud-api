# Spec 503: enlace a «Usuarios» en el menú del admin

- **Tarea:** #503
- **Estado:** escrita antes del código (19 de octubre de 2026)

## Historia de usuario

Como admin, quiero llegar a la gestión de usuarios desde el menú, para poder crear entrenadores y
otros admins sin escribir la URL a mano.

## El fallo

La página `/admin/users` («Usuarios y roles», con **Nuevo usuario** y selector de rol) existe y
funciona, pero `NAV_BY_ROLE.admin` en `frontend/src/lib/navigation.ts` no la incluye. La página
«Socios» solo crea socios, así que desde la web no hay forma de crear un entrenador.

## Requisitos

1. El menú del admin gana «Usuarios» → `/admin/users`, justo después de «Socios», con el icono
   `user` (distinto del `users` de Socios).
2. Como el menú sale de una única fuente (`NAV_BY_ROLE`), aparece a la vez en el menú superior
   (escritorio) y en el inferior (móvil).
3. `tests/unit/navigation.test.ts` refleja el menú nuevo.

## Criterios de aceptación

| Caso | Resultado |
| --- | --- |
| Admin en escritorio o móvil | Ve «Usuarios» después de «Socios» y lleva a `/admin/users` |
| Socio y entrenador | Su menú no cambia |
| Checks | `lint`, `format:check`, `test` y `build` en verde |

## Fuera de alcance

El menú inferior del móvil ya no cabía bien con 8 entradas del admin y con 9 cabe peor; rediseñarlo
(menú «Más», scroll horizontal) es otra tarea.
