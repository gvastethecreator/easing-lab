# Finish ledger

Estado: **listo en local**.

- Cinco tabs: Cubic, GSAP, Motion, Anime.js y Three.js.
- 67 cards visibles en cada motor base; GSAP conserva sus cards CustomEase.
- Three.js muestra canvas y libera recursos.
- `bun run verify` pasa; 14 archivos y 34 tests.
- Lighthouse desktop y móvil: accesibilidad 100, buenas prácticas 100, SEO 100.
- Móvil 390 × 844: cero overflow horizontal.
- Consola: cero errores, warnings o issues.
- Traza local: LCP 312 ms y CLS 0,05.

Prueba visual: `proof/after-desktop.png`. La prueba móvil se inspeccionó con emulación de dispositivo en Chrome; se descartó la captura CLI porque no aplicaba viewport móvil real.
