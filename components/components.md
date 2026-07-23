# Componentes

Consulta la guía principal en [`docs/GUIA_COMPONENTES.md`](../docs/GUIA_COMPONENTES.md).

## Mapa rápido

- `EditorLayout`: estructura compartida de editores.
- `CurveEditor`: curva Bézier para Cubic, Motion, Anime.js y Three.js.
- `MultiPointCurveEditor`: path multipunto para GSAP.
- `AnimationPreview`: aplica el easing al progreso del motor activo.
- `ThreePreview`: canvas WebGL diferida y con limpieza explícita.
- `EasingPresetBrowser`: filtros y catálogo compartido de cards.
- `UniversalGraphCard`: card base para los dos catálogos.
- `Header`: tabs, menú compacto, reproducción, tema y acento.

Todos los componentes reciben datos por props. Los motores solo se crean en `animation/progressDrivers.ts` a través de `useMasterProgressAnimation`.
