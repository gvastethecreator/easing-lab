# Deuda técnica

Estado: **2026-07-22**.

## P2 — Persistencia de vista

La pestaña y la curva actual viven en memoria. Recargar abre Cubic con GSAP. Un hash o query permitiría compartir una vista y restaurar el trabajo.

## P2 — Peso diferido de Three.js

El chunk de Three.js pesa cerca de 509 KB crudos y 127 KB gzip. Se carga solo al abrir su tab y cumple el presupuesto actual de 600 KB. Conviene vigilarlo si la escena suma loaders, controles o postprocesado.

## P2 — Cobertura de composición

Los 34 tests cubren drivers, editores, cards, vistas de motor, historial y arrastre. La cobertura final es 65,15% de statements y 52,47% de branches. Faltan tests de integración de `App`, fallback de import y ciclo completo de la canvas. La prueba de navegador cubre hoy ese trayecto.

## P3 — Acentos alternativos

El color inicial cumple el contraste auditado. Los nueve acentos opcionales conservan tonos más oscuros para texto blanco, pero falta una auditoría automatizada de cada combinación en tema claro y oscuro.

## P3 — Fuentes externas

Inter y Roboto Mono se cargan desde Google Fonts. Esto simplifica el proyecto, pero añade una petición externa y puede afectar privacidad, trabajo offline o primera carga. Un futuro cambio puede autoalojarlas sin alterar tipografía.

## P3 — Diferencia interna de Vite+

El paquete directo es Vite 8.1.5. Vite+ 0.2.5 informa Vite 8.1.4 al construir porque fija su runtime interno. No causa fallos conocidos; se debe volver a medir en futuras versiones de Vite+.

## Criterio de seguimiento

No queda deuda P0 o P1 conocida. Cada nueva dependencia o motor debe incluir: driver, limpieza, tab, cards, test, carga diferida, docs y revisión del bundle.
