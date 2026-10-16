# Spec 416: revisión automática de PRs con un modelo gratuito

- **Tarea:** #416
- **Nivel del briefing:** Experto
- **Estado:** escrita antes del código (16 de octubre de 2026)

## Historia de usuario

Como equipo, queremos que una IA revise cada PR, para que los fallos evidentes se vean antes de la
revisión humana.

## Decisiones (16 de octubre)

- **Modelo: Google Gemini, plan gratuito**, por su endpoint compatible con el formato de OpenAI.
  La clave se crea en Google AI Studio y se guarda como **secreto del repositorio**
  `AI_REVIEW_API_KEY`; nunca aparece en el código.
- Modelo por defecto `gemini-flash-latest` (alias que sigue al Flash vigente), cambiable con la
  variable de repositorio `AI_REVIEW_MODEL` sin tocar el código.
- **Cambio del 16 de octubre:** la primera elección fue GitHub Models, pero GitHub lo retiró el 30
  de julio de 2026 y el endpoint responde «OK» a cualquier petición. Se cambió a Gemini.

## Requisitos

1. Workflow `.github/workflows/ai-review.yml` en cada PR abierto, reabierto o actualizado.
2. Un script con la librería estándar de Python (`.github/scripts/ai_review.py`, sin dependencias
   nuevas):
   - Lee el diff del PR y quita los archivos generados que no aportan a la revisión
     (`package-lock.json`, `frontend/src/types/schema.d.ts`).
   - Recorta el diff a un tamaño que cabe en el límite gratuito y lo dice en el comentario si lo
     recorta.
   - Pide la revisión con las reglas del proyecto: capas (router, servicio, repositorio, modelo),
     DRY y SOLID, seguridad (contraseñas, JWT, secretos, permisos), tests y alcance.
3. **Un solo comentario por PR:** lleva una marca oculta; si ya existe se edita en vez de añadir uno
   nuevo en cada push.
4. **Solo comenta:** no aprueba, no pide cambios ni bloquea. El comentario dice que la revisión
   humana sigue siendo obligatoria.
5. **Un fallo no rompe la CI:** si el modelo no responde, se pasa del límite gratuito o falta el
   secreto, el paso escribe un aviso en el log y termina bien. El check del workflow queda verde.
6. Los PRs que vienen de un *fork* no tienen permiso de escritura: se salta la revisión.
7. Documentado en `docs/ai-log.md`.

## Criterios de aceptación

| Caso | Resultado |
| --- | --- |
| Se abre un PR | Aparece un comentario «AI review» con la revisión |
| Se sube otro commit al PR | Se actualiza el mismo comentario |
| El modelo falla o falta el secreto | Aviso en el log; workflow en verde; sin comentario |
| Diff enorme | Se revisa la primera parte y el comentario avisa del recorte |
| Clave en el código | Ninguna: secreto `AI_REVIEW_API_KEY` y `GITHUB_TOKEN` |
| Estado del PR | La IA nunca aprueba ni bloquea |

## Fuera de alcance

Comentarios en líneas concretas del diff, revisión de PRs de *forks* y modelos de pago.
