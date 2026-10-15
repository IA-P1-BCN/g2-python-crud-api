# #275 · Lista de beneficios del plan (molécula)

Parte de #273 (Mi plan, socio). Muestra "lo que incluye el plan" con un icono por beneficio.

## Decisión

El plan en la API solo tiene `name`, `description`, `price_cents` y `duration_days`: **no hay
beneficios por plan** (el `description` es una frase: "Acceso completo durante 30 días"). Se acordó
usar una **lista fija del gimnasio**, compartida en un módulo, en vez de inventar datos por plan.

## Alcance

- `lib/plan-benefits.ts`: tipo `PlanBenefit` (`icon` + `label`) y `PLAN_BENEFITS` (la lista fija:
  acceso a las clases dirigidas, reserva online y sin permanencia).
- `components/ui/molecules/PlanBenefitsList`: pinta la lista con `Icon` por ítem. Recibe `items`
  (por defecto `PLAN_BENEFITS`), `title` (por defecto "Incluye") y `className`, así que la página
  puede pasar otra lista si hace falta.

## Pruebas

`PlanBenefitsList.test.tsx`: lista los beneficios por defecto con su título y los que se le pasan.
