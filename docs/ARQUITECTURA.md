# Arquitectura

## Límites

Easy Easing es una SPA React de un solo paquete. No tiene backend, persistencia remota ni secretos. `App.tsx` mantiene la curva, duración, escala, motor, vista y reproducción.

## Flujo de animación

```text
Tab del motor
  -> useMasterProgressAnimation
  -> ProgressDriver (GSAP | Motion | Anime.js | Three.js)
  -> progressRef 0..1
  -> AnimationPreview
  -> easing elegido
  -> DOM o canvas Three.js
```

`animation/progressDrivers.ts` contiene el límite con terceros. Cada adaptador implementa `play()`, `pause()` y `dispose()`. El valor que entrega siempre es lineal. La vista previa aplica la curva una vez, lo que evita el doble easing.

El hook cancela cargas tardías al cambiar de pestaña y limpia el driver anterior. Si un import falla, `App.tsx` muestra un aviso y vuelve a GSAP.

## Vistas

- `CubicBezierView`: editor Bézier y catálogo compartido.
- `GSAPView`: editor multipunto y galería `CustomEase`.
- `EngineView`: composición común para Motion, Anime.js y Three.js. Cambian detalles, código y driver.
- `Header`: tabs en escritorio y menú accesible en pantallas pequeñas.

Cada motor tiene una tab propia. Motion, Anime.js y Three.js usan `EasingPresetBrowser`; GSAP mantiene sus cards multipunto.

## Render y carga

- El progreso vive en `progressRef`; React no renderiza cada frame.
- Las vistas y Three.js se cargan con `React.lazy`.
- Rolldown separa React y GSAP. Los otros motores forman chunks diferidos.
- `ThreePreview` usa `WebGLRenderer.setAnimationLoop`, `ResizeObserver`, `IntersectionObserver` y limpieza de geometrías, materiales y renderer.

## Carpetas

| Ruta          | Responsabilidad                                 |
| ------------- | ----------------------------------------------- |
| `animation/`  | Drivers de progreso y sus tests                 |
| `components/` | Editores, previews, cards y controles           |
| `views/`      | Composición de cada laboratorio                 |
| `hooks/`      | Ciclo de animación, historial y arrastre        |
| `contexts/`   | Tema y acentos                                  |
| `utils/`      | Conversión de rutas GSAP y métricas de arranque |
| `scripts/`    | Logs, métricas y puerta de calidad              |
| `docs/`       | Contratos y estado técnico                      |

## Decisiones

La decisión del driver fijo y del progreso lineal está registrada en [ADR-0001](adr/0001-animation-drivers.md). El diseño visual existente se conserva; los cambios de estilo se limitan a tokens, contraste, estados y adaptación responsive.
