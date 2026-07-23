# Requisitos del producto

Versión: **1.1**

Estado: **implementado y en validación**

## Propósito

Easy Easing permite elegir, editar y comparar curvas antes de llevarlas a código. Sirve a desarrollo frontend, diseño de producto y motion design.

## Flujos principales

1. Abrir la tab del motor: Cubic, GSAP, Motion, Anime.js o Three.js.
2. Elegir una card o editar la curva.
3. Revisar la curva en varias previews.
4. Ajustar duración y escala.
5. Copiar el valor o código del motor.

## Requisitos

| ID   | Requisito                                                  | Estado |
| ---- | ---------------------------------------------------------- | ------ |
| R-01 | Editor Bézier con arrastre, precisión numérica e historial | Hecho  |
| R-02 | Editor multipunto GSAP CustomEase                          | Hecho  |
| R-03 | Tab propia para GSAP, Motion, Anime.js y Three.js          | Hecho  |
| R-04 | Cards con curvas en cada tab                               | Hecho  |
| R-05 | Driver real y play/pausa para cada motor                   | Hecho  |
| R-06 | Preview WebGL en Three.js                                  | Hecho  |
| R-07 | Código copiable adaptado al motor                          | Hecho  |
| R-08 | Temas, acentos y navegación responsive                     | Hecho  |
| R-09 | Teclado, nombres accesibles y reduced motion               | Hecho  |
| R-10 | Carga diferida de motores y control de bundle              | Hecho  |

## Criterios de calidad

- Un cambio de motor conserva la curva y los controles.
- El easing se aplica una sola vez.
- Cada driver libera sus recursos al cambiar de tab.
- No hay overflow horizontal a 390 px.
- Tests, lint, formato, tipos, cobertura y build generan logs.
- La consola queda limpia en el barrido de las cinco tabs.

## Fuera de alcance

- Cuentas, nube o persistencia remota.
- Exportación a vídeo.
- Edición de escenas Three.js.
- Rediseño visual.
