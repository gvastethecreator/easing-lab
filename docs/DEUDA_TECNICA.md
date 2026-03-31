# Deuda técnica

## Estado tras la puesta a punto (2026-03-31)

### Actualización de seguimiento (2026-03-31, fase 2)

- Cobertura global subida de ~60% a **67.07%** con nuevas pruebas de interacción.
- Lazy-loading aplicado en `App.tsx` para separar `CubicBezierView` y `GSAPView` por chunk.
- Métricas ampliadas con `JS inicial (entry + modulepreload)` para distinguir coste de arranque vs. coste total.

### Cerrado en esta iteración

- Warnings de lint por mutabilidad (`sort`) y assertions inseguras de tipos en hooks/componentes/tests.
- Inconsistencias de tipado de drag/touch en `useDraggable`.
- Diferencias de formato en tests/componentes detectadas por `vp check`.
- Falta de preservación del directorio `logs/` en el repositorio (`logs/.gitkeep`).

### Deuda técnica activa (priorizada)

1. **Cobertura global aún mejorable (~67%)**
   - Riesgo: regresiones en ramas complejas de editores/cards que siguen parcialmente sin cubrir.
   - Acción recomendada:
     - Añadir pruebas adicionales de ramas en `MultiPointCurveEditor` y `UniversalGraphCard` (fallbacks visuales, toggles y casos borde de interacción).

2. **Presupuesto de JS excedido en métricas de bundle**
   - Estado actual: `JS inicial > 220 KB` y `JS total > 250 KB` (marcado como `REVISAR` en `docs/METRICAS.md`).
   - Acción recomendada:
     - Iterar sobre split de dependencias pesadas (`gsap`/catálogos) y reducir preload no crítico.
     - Medir impacto en gzip/Brotli además del tamaño raw.

3. **Flujo de cobertura con Vite+ en mixed versions (si se usa `vp test --coverage`)**
   - Mitigación actual: `coverage` usa `vitest run --coverage` para salida limpia y estable.
   - Acción recomendada:
     - Revisar en futuras versiones de `vite-plus` una ruta oficial para cobertura sin warning de versiones mixtas.

## Resuelto en esta iteración

- Tests de integración para `CurveEditor`, `MultiPointCurveEditor` y `useDraggable`.
- Pruebas de regresión para `UniversalGraphCard` y `AnimationPreview`.
- Refactor de `utils/gsapUtils.ts` para centralizar el fallback de easings inválidos.
- Extracción de configuración compartida de animación y división adicional de la orquestación de `App.tsx`.
- Consolidación de `EasingCard` y `GSAPCard` sobre `UniversalGraphCard` como abstracción visual principal.
- Añadidas métricas ligeras de bundle/arranque mediante `bun run metrics` y `window.__EASING_LAB_STARTUP_METRICS__`.
- Mejora de la guía de componentes con ejemplos y referencias a snapshots automatizados.
- Nuevos tests de interacción para `ScrubbableInput` y `DraggableHandle`.
- División por lazy-loading de vistas principales (`CubicBezierView`, `GSAPView`).
- Extensión de `scripts/collect-metrics.mjs` con presupuesto de `JS inicial` y reporte actualizado.

## Seguimiento recomendado

- Revisar futuras versiones de `vite-plus` en Windows para comprobar si corrigen de forma nativa el problema de resolución de `tsgolint.cmd` con Bun.
- Mantener los presupuestos de `docs/METRICAS.md` bajo revisión cada vez que crezcan galerías, catálogos o previews.

## Observaciones

- La cobertura actual ya cubre la interacción gráfica principal y deja un baseline útil para futuras regresiones visuales.
- La integración de `vite-plus` en Windows con Bun quedó estabilizada desde el proyecto, pero conviene revisar futuras versiones del paquete por si corrigen el problema de `tsgolint.cmd` de forma nativa.
