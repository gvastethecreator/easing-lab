# Revisión general

Fecha: **2026-07-30**.

## Resultado

El proyecto conserva su interfaz y tiene cinco laboratorios: Cubic, GSAP, Motion, Anime.js y Three.js. Cada motor cuenta con una tab y cards de curvas. Los cuatro motores de tiempo cumplen el mismo contrato y se cargan bajo demanda. Esta revisión actualiza dependencias, tareas y documentación sin cambiar el flujo visual.

## Hallazgos corregidos

| Área          | Hallazgo                                    | Corrección                                          |
| ------------- | ------------------------------------------- | --------------------------------------------------- |
| Función       | Vistas principales reducidas a shells       | Restauración de editores, galerías y previews       |
| Animación     | Easing aplicado en driver y preview         | Progreso lineal en drivers; easing único en preview |
| Arquitectura  | GSAP acoplado al progreso maestro           | Adaptadores fijos para cuatro motores               |
| UX            | Motores sin vistas propias                  | Tabs dedicadas y menú compacto                      |
| Contenido     | Nuevas tabs sin curvas visibles             | Catálogo compartido de 67 cards                     |
| Three.js      | Sin render 3D ni limpieza                   | Canvas diferida con lifecycle completo              |
| Accesibilidad | Inputs sin nombre y arrastre solo de mouse  | Labels, ARIA, Pointer Events y reduced motion       |
| Tooling       | Scripts sin trazas y tarea de métricas rota | Wrapper de logs, verify y métricas                  |
| Dependencias  | Versiones atrasadas y paquetes redundantes  | Actualización total y limpieza del manifiesto       |
| Repositorio   | Docs ignoradas y favicon ausente            | `.gitignore`, docs y archivos públicos corregidos   |

## Arquitectura y rendimiento

La ref mutable evita renders de React por frame. React, GSAP, vistas y motores se separan en chunks. Three.js es el asset más grande, pero queda fuera de la carga inicial. `bun run metrics` aplica presupuestos explícitos.

## Validación de navegador (evidencia de producto: 2026-07-22)

- Escritorio: las cuatro tabs de motor llegan a estado `ready`; cada una muestra 67 cards seleccionables.
- Three.js: canvas presente y activa.
- Móvil 390 × 844: menú con cinco opciones, 67 cards, canvas y cero overflow horizontal.
- Selección de card: `Ease In Back` actualizó los cuatro puntos del editor.
- Consola: sin errores, warnings ni issues tras el barrido.
- Lighthouse de desarrollo, escritorio y móvil: accesibilidad 100, buenas prácticas 100, SEO 100 y Agentic Browsing 99.

## Puerta de mantenimiento

- `bun outdated`: sin paquetes desactualizados.
- `bun install --frozen-lockfile --ignore-scripts`: 196 instalaciones, sin cambios.
- `bun run test`: 14 archivos y 34 tests en verde.
- `bun run coverage`: 65,29% statements, 52,73% branches, 64,70% functions y 67,66% lines.
- `bun run build`: Vite 8.2.0/Rolldown, 392 módulos transformados.
- `bun run metrics`: JavaScript inicial 313,77 KB; asset diferido mayor 506,94 KB; ambos dentro de presupuesto.
- `bun run verify`: pasa; formato, lint, typecheck, Knip, tests, build y métricas en verde.

## Riesgos aceptados

Consulta [Deuda técnica](DEUDA_TECNICA.md).
