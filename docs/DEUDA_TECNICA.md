# Deuda técnica

## Resuelto en esta iteración

- Tests de integración para `CurveEditor`, `MultiPointCurveEditor` y `useDraggable`.
- Pruebas de regresión para `UniversalGraphCard` y `AnimationPreview`.
- Refactor de `utils/gsapUtils.ts` para centralizar el fallback de easings inválidos.
- Extracción de configuración compartida de animación y división adicional de la orquestación de `App.tsx`.
- Consolidación de `EasingCard` y `GSAPCard` sobre `UniversalGraphCard` como abstracción visual principal.
- Añadidas métricas ligeras de bundle/arranque mediante `bun run metrics` y `window.__EASING_LAB_STARTUP_METRICS__`.
- Mejora de la guía de componentes con ejemplos y referencias a snapshots automatizados.

## Seguimiento recomendado

- Revisar futuras versiones de `vite-plus` en Windows para comprobar si corrigen de forma nativa el problema de resolución de `tsgolint.cmd` con Bun.
- Mantener los presupuestos de `docs/METRICAS.md` bajo revisión cada vez que crezcan galerías, catálogos o previews.

## Observaciones

- La cobertura actual ya cubre la interacción gráfica principal y deja un baseline útil para futuras regresiones visuales.
- La integración de `vite-plus` en Windows con Bun quedó estabilizada desde el proyecto, pero conviene revisar futuras versiones del paquete por si corrigen el problema de `tsgolint.cmd` de forma nativa.
