# ADR-0001: drivers de progreso para motores de animación

Fecha: 2026-07-22

Estado: aceptado

## Contexto

La aplicación debe ejecutar GSAP, Motion, Anime.js y Three.js, con una tab y cards por motor. El editor y las previews deben conservar la misma curva al cambiar de motor.

## Decisión

Usar un contrato fijo `ProgressDriver` con `play`, `pause` y `dispose`. Cada adaptador entrega progreso lineal de 0 a 1 en ciclos alternos. La preview aplica la curva elegida.

Los imports son dinámicos y el hook descarta resultados tardíos. Three.js usa `Timer`; la canvas usa `setAnimationLoop` y limpieza explícita.

## Consecuencias

- React y las vistas no conocen APIs de ciclo de vida de terceros.
- Una curva produce el mismo resultado visual entre motores.
- El bundle inicial evita Motion, Anime.js y Three.js.
- Añadir un quinto motor exige modificar el switch, tipos, tabs y pruebas. Esta lista es corta y fija, por lo que un registro dinámico no aporta valor actual.
