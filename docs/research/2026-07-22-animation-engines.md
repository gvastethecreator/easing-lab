# Investigación de motores de animación

Fecha: 2026-07-22

## Pregunta

¿Cómo puede Easing Lab ejecutar la misma curva con GSAP, Motion, Anime.js y Three.js sin duplicar los editores ni cambiar su diseño?

## Respuesta

El proyecto conservará una sola señal normalizada de progreso. Cada motor controlará un avance lineal de `0` a `1`, con repetición alternada. Un evaluador cúbico común aplicará la curva elegida. Los editores y la vista previa DOM seguirán consumiendo el mismo valor.

La aplicación cargará cada motor bajo demanda. Three.js tendrá además una vista previa WebGL aislada, con redimensionado por el tamaño CSS, límite de densidad de píxeles y liberación explícita de timer, geometría, material y renderer.

## Versiones revisadas

| Paquete        | Versión consultada | Uso                                                             |
| -------------- | -----------------: | --------------------------------------------------------------- |
| `gsap`         |             3.15.0 | Motor actual y editor CustomEase.                               |
| `motion`       |            12.42.2 | Progreso numérico con `animate` y `onUpdate`.                   |
| `animejs`      |              4.5.0 | Progreso numérico, bucle alternado y controles de reproducción. |
| `three`        |            0.185.1 | Reloj de progreso y vista previa WebGL.                         |
| `@types/three` |            0.185.1 | Declaraciones TypeScript para Three.js.                         |

Las versiones proceden del registro consultado con `bun info` el 2026-07-22.

## Fuentes oficiales

- [Motion: animate](https://motion.dev/docs/animate)
- [Motion: easing](https://motion.dev/docs/easing-functions)
- [Anime.js: animation](https://animejs.com/documentation/animation/)
- [Anime.js: cubic bezier easing](https://animejs.com/documentation/easings/cubic-bezier-easing/)
- [Three.js: WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [Three.js: responsive rendering](https://threejs.org/manual/en/responsive.html)
- [Three.js: cleanup](https://threejs.org/manual/en/cleanup.html)
- [Three.js: Timer](https://threejs.org/docs/pages/Timer.html)

## Decisión

Se usará una interfaz interna con `play`, `pause` y `dispose`, resuelta con un `switch` para los cuatro valores conocidos. El hook de React solo coordinará carga, cambio y errores. No habrá registro dinámico ni árbol de componentes duplicado.

## Riesgos por probar

- Confirmar los tipos y la cancelación de Motion y Anime.js contra las versiones instaladas.
- Probar la caída controlada cuando WebGL no está disponible.
- Medir los chunks dinámicos y verificar que los motores nuevos no entren en la carga inicial.

## Estado actualizado: 2026-07-30

La investigación original conserva su fecha y fuentes. La implementación actual usa `motion` 12.43.0, `animejs` 4.5.0, `three` 0.185.1 y `@types/three` 0.185.1. `bun outdated`, typecheck, tests y build pasan con el árbol fijado en `bun.lock`; los riesgos de navegador permanecen como pruebas de producto, no como bloqueos del toolchain.
