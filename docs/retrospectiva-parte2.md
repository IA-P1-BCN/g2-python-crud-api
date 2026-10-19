# Retrospectiva de la parte 2

> **Cómo colaborar** (borra este bloque cuando esté completa):
>
> 1. Escribe tus respuestas bajo cada pregunta, firmando con tu nombre entrecomillado («Elena»,
>    «Nayeli»…).
> 2. Aporta ejemplos concretos siempre que puedas: PR, issue, commit, fecha o nombre de archivo.
> 3. No borres lo que escriban las demás; complementa.
> 4. Límite de entrega: **19 de octubre de 2026, 23:59**.

## 1. Contexto de la parte 2

La parte 2 abarcó el rediseño completo con el nuevo design system (tokens + atomic design) y la
ampliación del producto: login y registro, panel de admin, páginas del entrenador, planes de
admin y las piezas de autenticación (2FA con TOTP, verificación de email y recuperación de
contraseña). Datos verificables del cierre de sprint:

- PRs fusionados en `dev` entre otros: #438 (memberships, rooms, bookings), #442 (perfil),
  #445 (classes y schedules), #452 y #453 (entrenador), #456 (panel de admin), #471 (2FA TOTP)
  y #474 (planes de admin, epic #317).
- `specs/` recoge más de 20 especificaciones; `docs/ai-log.md` más de 20 entradas del flujo
  spec → agente → PR.
- La suite de frontend cerró el sprint con 389 tests en verde (99 archivos) y CI activo
  (`.github/workflows/ci.yml`: ruff + pytest en backend y lint/test/build en frontend).

## 2. Qué fue bien

### Hechos verificables (aportación del agente)

- **El flujo spec → código → checks → PR funcionó en serio**: cada issue de las epics de
  login (#247), registro (#252) y planes (#317 con #318/#319/#320) tuvo su spec aprobada antes
  de escribir código, y los checks automáticos (lint, formato, tests, build) destaparon errores
  reales antes del merge.
- **Atomic design + tokens**: la migración de páginas antiguas (perfil #278, panel #299,
  planes #317) avanzó sin romper la suite, con componentes reutilizables (`Sheet`,
  `PlanCard`, `FormField`, `PlansAdminList`…).
- **Cobertura de tests**: componentes nuevos con sus tests (el organismo de planes entró con
  7-9 tests por componente) y casos de negocio cubiertos (validaciones, permisos, confirmaciones).
- **CI en cada PR**: ruff + pytest en backend y lint/test/build en frontend (#106).
- **Trabajo en paralelo sin pisarse**: epics y ramas por issue; Elena avanzó login/registro y
  el panel mientras se hacían las pantallas de trainer y planes.

### ¿Y tú? Añade tu opinión

- «Nayeli»: trabajamos bien cada una por su cuenta con sus agentes y el md que nos ayudaba a que sigamos el mismo camino sin desvariarnos mucho, siguiendo el flujo de SDD.
- «Elena»:
  - **Spec antes que código**: escribí la spec de cada tarea antes de tocar nada (`specs/249`,
    `251`, `253`, `255`, `275`, `299`, `308`, `378`, `461`) y eso evitó rehacer trabajo cuando el
    alcance cambiaba.
  - **Parar y preguntar ante la ambigüedad**: en #299 (alcance y enfoque de los gráficos), #308
    (datos de entrenadores sin backend), #275 (origen de los beneficios) y #251 (un `AuthHeroCard`
    inexistente). Preguntar ahorró implementar cosas que no se querían.
  - **Reutilizar en vez de duplicar (DRY)**: `LoginForm` (#249 → #458) y `RegisterForm`
    (#253 → #465), el copy del hero compartido (`lib/auth-copy.ts`, #255 → #468), `weekdayOf` a
    `lib/dates` (#295), `formatPercent`, `ChartCard`/`DateRangeFilter` (#299) y `PlanBenefitsList`
    (#275).
  - **Rediseñar sin romper**: migré login, registro, el panel de admin y las páginas del entrenador
    manteniendo sus tests existentes (#456 conservó los de `AdminDashboardPage`; #458/#465 no
    tocaron los de login/registro).
  - **Kit y tokens de forma consistente**: Tailwind v4 + `components/ui`, sin hex ni valores
    arbitrarios, y estados de carga/vacío/error en cada pantalla nueva.
  - **Calidad**: el frontend cerró con ~400 tests unitarios + 10 E2E; los checks destaparon fallos
    reales antes del merge (React Query v5 no admite `undefined` como dato en #461; un test de
    gráfico con varios `listitem`).
  - **E2E estable**: detecté que el *flake* de `member.spec` podía tumbar PRs y lo arreglé en
    `loginAs` con `waitForURL` (#468), verificado con dos pasadas seguidas.
  - **Tablero al día al final**: cerré como entregados los subtemas que ya estaban en `dev`
    (#296/#297 y #300–#306/#311).
- _«[Otro miembro]»_:

## 3. Qué fue mal

### Hechos verificables (aportación del agente)

- **El tablero se desincronizó del código**: issues que ya estaban en `dev` siguieron abiertas
  días (#300–#306, #311, #296, #297, #130); se cerraron tarde y a mano.
- **Trabajo duplicado**: el PR #464 se cerró porque Elena ya había cubierto ese trabajo en
  #458/#462 — se empezó sin verificar que el issue estuviera tomado.
- **PRs fusionados sin revisión visible**: el briefing pide historial de revisiones humanas y
  hasta ahora muchos merges no tienen aprobación registrada en GitHub (#420 sigue sin hacerse).
- **Entregables obligatorios acumulados**: la comparativa de modelos (#406 specs retroactivas,
  #407 comparativa, esta retrospectiva) quedaron sin empezar hasta los últimos días del sprint.
- **Casi un error de entrega con lo local**: un `docker-compose.yml` editado en local (puerto
  5433) estuvo a punto de entrarse en un commit; se resolvió con `skip-worktree`, que no es un
  proceso del equipo.

### ¿Y tú? Añade tu opinión

- «Nayeli»: al no verificarse que algunas tareas ya estaban asignadas, yo comenzaba esas issues con sus subissues pero hacia trabajo duplicado y tuve que revisar todo el rato si las tareas que me tocaban ya estaban hechas, en eso perdí algo de tiempo.
- «Elena»:
  - **`ai-log` y ramas desincronizadas**: varias ramas iban por detrás de `dev` y, al añadir mi
    entrada al final de `docs/ai-log.md`, chocaba con la de otra persona (tuve que hacer merge y
    reordenar entradas en #478). Propuesta: actualizar la rama antes de abrir el PR y acordar un
    punto de inserción estable.
  - **Trabajo duplicado por no comprobar el estado real**: #251 pedía rediseñar una página que ya
    estaba rediseñada (#233/#249) y #248 estaba cerrado como «completed» sin código. Revisar
    issue + PRs + código con `gh` antes de reclamar una tarea.
  - **El tablero no se cierra solo**: los PRs de feature cerraban el padre (#295, #299) y los
    subtemas quedaban abiertos.
  - **Entorno local frágil tras los merges**: `pyotp` (2FA) sin instalar y migraciones sin aplicar
    → el backend no arrancaba y el registro se quedaba «cargando». Documentar/automatizar
    `pull → instalar deps → alembic upgrade head`.
  - **El *flake* se detectó tarde**: costó verlo y el e2e va en CI. Ejecutar el e2e dos veces en
    local antes del PR y usar esperas deterministas.
  - **Dos sistemas de estilos**: quedan clases CSS antiguas (`.member-item`, `.table`,
    `.pagination`, `MembersList`) junto al rediseño Tailwind.
  - **PRs de feature muy grandes**: #456 entregó muchos subtemas de golpe y cuesta revisarlo.
  - **Tests acoplados al DOM**: para no romper `AdminDashboardPage.test` cambié `StatCard`
    (etiqueta a encabezado + `hint`); funciona, pero es señal de acoplamiento.
- _«[Otro miembro]»_:

## 4. Qué cambiaríamos

### Propuestas del agente (a debatir)

- Activar en GitHub la exigencia de al menos una aprobación antes de fusionar a `dev`
  (complementa la #420).
- Al cerrar un PR: cerrar sus issues en la misma sesión y revisar el tablero con `gh` antes de
  reclamar un issue nuevo.
- Repartir los entregables de documento (specs retroactivas, comparativa, retrospectiva) al
  principio del sprint, no al final.

### ¿Y tú?

- «Nayeli»: No tengo nada mas que añadir.
- «Elena»:
  - Actualizar la rama con `dev` antes de abrir el PR y fijar un punto único/estable para las
    entradas del `ai-log`.
  - Referenciar/cerrar los subtemas en el PR de la feature (o justo al hacer merge).
  - Revisar el estado real (issue, PRs, código) con `gh` antes de reclamar una tarea y corregir la
    descripción del issue cuando cambie el estado.
  - Documentar/automatizar el arranque local (`uv pip install -e ".[dev]"` + `alembic upgrade
    head`) y comprobar `/health` + un login antes de las demos.
  - Terminar la migración al design system y borrar el CSS heredado.
  - Partir los PRs de feature por subtema cuando sea posible.
- _«[Otro miembro]»_:

## 5. Trabajo con agentes de IA

### 5.1 Qué funcionó

- **Spec antes que código**: el agente implementó bastante de corrido cuando la spec estaba
  aprobada; hubo dudas y paradas cuando el alcance era ambiguo (y parar fue lo correcto).
- **Ciclo corto con verificación**: spec → código → checks automáticos → commits del humano.
  Ejemplos de fallos reales destapados por los checks antes del merge: `Intl` es-ES inserta un
  NBSP en los precios y testing-library v10 no lo normaliza en el matcher; la validación nativa
  del navegador tapaba los mensajes propios de un formulario (`noValidate`); TanStack v5 usó
  `isPending`, no `isLoading`, en mutaciones.

### 5.2 Dónde se equivocaron

- Asumieron APIs de componentes sin leerlas (nombres de roles accesibles, formas de los
  datos) y los tests fallaron; dos o tres correcciones por componente fue lo normal.
- Comportamientos plausibles pero inventados (un conteo de esqueletos, un payload sin
  `is_active`) que solo destapó ejecutar la suite.

### 5.3 Aprendizajes como tech leads

- Revisar el diff y ejecutar los checks antes de empujar: los checks son la red de seguridad
  del agente.
- Re-verificar el estado real (issues, PRs, ramas) con `gh` antes de reclamar trabajo — el
  equipo va rápido y se pisan.
- Preguntar ante la ambigüedad en lugar de elegir: las cuatro preguntas previas a la #319
  (descripción, patrón, alcance, «Cancelar») evitaron rehacer el organismo.

### ¿Y tú?

- «Nayeli»: Me funcionó pedirles revisión constante de las issue para no duplicar trabajo, el testing constante para cada feature, y los docs ayudaron mucho a que el agente se centrase en los objetivos, requerimientos y tareas.
- «Elena»:
- _«[Otro miembro]»_:

## 6. Acciones de mejora

| Acción | Responsable propuesto | Cuándo | Estado |
| --- | --- | --- | --- |
| Exigir aprobación antes de fusionar a `dev` (#420) | Equipo | Antes del siguiente PR | Pendiente |
| Cerrar los issues de cada PR al fusionar | Quien abre el PR | Desde ya | Pendiente |
| Verificar issues tomados antes de empezar (`gh issue view`) | Quien reclama | Desde ya | Pendiente |
| Empezar entregables de documento el primer día del sprint | Tech leads | Parte 3 | Pendiente |
| Escribir specs retroactivas de lo ya construido (#406) | Nayeli | Antes de la entrega | Pendiente |

_Más acciones propuestas por: «Nayeli»… «Elena»…_

---

**Firmas**: Nayeli (16/10-12:28) · Elena (fecha) · _«[Otro miembro]» (fecha)_
