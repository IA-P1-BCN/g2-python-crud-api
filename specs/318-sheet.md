# #318 · Sheet (molécula)

Parte de #317 (Página de planes de admin). Primera superficie de diálogo del proyecto: bottom sheet
en móvil y diálogo centrado en desktop, con foco atrapado y cierre con Escape. Hoy no existe ningún
diálogo en `frontend/src` (verificado: sin `role="dialog"`, portales ni overlays); esta molécula pone
la base para que #317 abra el formulario de edición de planes.

## Alcance

- `components/ui/molecules/Sheet/{Sheet.tsx, Sheet.test.tsx, index.ts}`: overlay con el token
  `--color-scrim` + panel con ranura de contenido.
  - **Móvil** (por defecto, mobile-first): panel pegado abajo (`inset-x-0 bottom-0`), esquinas
    superiores con `rounded-t-card` (el token de radio ya documenta "cards, panels, **sheets**").
  - **Desktop (`md:`)**: panel centrado, `rounded-card`.
- Botón de cerrar arriba a la derecha con `IconButton` (`icon="x"`, `label` accesible en español).
- No está en el DOM cuando `isOpen` es falso.

## Decisiones

- **Controlado**: props `isOpen`, `onClose`, `title?`, `children`, `className?` — la página decide
  cuándo abrirlo (mismo patrón que `Alert` con su `onClose`).
- **Portal a `document.body`** con `createPortal`: el panel no debe heredar stacking contexts de la
  página. Es el primer uso de portales en el repo.
- **Capa `z-50`**: hoy solo existe `z-10` en el código; el Sheet es la primera capa superpuesta real
  y debe quedar sobre el resto.
- **Focus trap manual**, sin dependencias nuevas: Tab y Shift+Tab ciclan dentro del panel; al abrir,
  el foco entra al panel; al cerrar, vuelve al elemento que lo abrió.
- **Escape llama a `onClose`**.
- **`aria-modal="true"`, `role="dialog"` y `aria-labelledby`** (si hay `title`).
- **Sin animaciones**: el enunciado no las pide; si se quieren, se tratan en otra issue.

## Pendiente de confirmar

1. ¿Hay diseño en Figma para el Sheet? La issue no enlaza ninguno (los detalles visivos se ajustan
   a lo que haya; si no hay diseño, se parte del enunciado).
2. ¿El clic en el backdrop cierra? (Propuesto: sí, llamando a `onClose`.)
3. ¿Bloquear el scroll del `body` mientras está abierto? (Propuesto: sí.)
4. Ancho del diálogo en desktop (propuesto: `max-w-md` con margen, hasta confirmar diseño).

## Pruebas

`Sheet.test.tsx`: no está en el DOM cerrado; pinta `title` y contenido abierto; Escape llama a
`onClose`; el clic en el backdrop llama a `onClose`; el `IconButton` de cerrar llama a `onClose`;
Tab no sale del panel (focus trap) y el foco vuelve al disparador al cerrar; `role="dialog"`,
`aria-modal` y `aria-labelledby`.
