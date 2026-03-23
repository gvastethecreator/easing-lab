# Deuda técnica

## Alta prioridad

- Añadir tests de integración para los editores visuales (`CurveEditor`, `MultiPointCurveEditor`) y para interacciones de drag.
- Añadir pruebas visuales o de regresión para las tarjetas y previsualizaciones animadas.
- Revisar `utils/gsapUtils.ts` para eliminar `console.warn` y centralizar manejo de errores de easing inválido.

## Prioridad media

- Dividir `App.tsx` si el estado compartido sigue creciendo, para reducir acoplamiento entre vistas.
- Evaluar extracción de constantes de animación compartidas a una capa de configuración más explícita.
- Añadir métricas o benchmarks simples para vigilar peso del bundle y tiempo de arranque.
- Revisar si conviene unificar `EasingCard`, `GSAPCard` y `UniversalGraphCard` sobre una sola abstracción visual.

## Prioridad baja

- Mejorar la documentación funcional de componentes secundarios con ejemplos de uso.
- Revisar textos y microcopy de la UI para un lenguaje más consistente.
- Añadir snapshots o ejemplos automatizados para las guías de `docs/`.

## Observaciones

- La cobertura actual es un buen baseline para utilidades y hooks, pero todavía no cubre la interacción gráfica principal.
- La integración de `vite-plus` en Windows con Bun quedó estabilizada desde el proyecto, pero conviene revisar futuras versiones del paquete por si corrigen el problema de `tsgolint.cmd` de forma nativa.
