# Tareas realizadas

## Puesta a punto del 2026-07-22

### Setup y control del trabajo

- Añadidos `AGENTS.md`, documentación de agentes y tracker local bajo `.scratch/easing-lab/`.
- Registrado un plan por fases, decisiones y diez ciclos de calidad.
- Creada la rama `codex/easing-lab-readiness` desde un árbol limpio.

### Producto y motores

- Restauradas las vistas completas Cubic y GSAP.
- Añadidos Motion 12, Anime.js 4 y Three.js como motores reales junto a GSAP.
- Creado un contrato común de drivers con carga diferida, play, pausa y limpieza.
- Eliminado el doble easing: el driver entrega progreso lineal y la preview aplica la curva.
- Añadida una tab propia para Cubic, GSAP, Motion, Anime.js y Three.js.
- Añadidas cards de curvas a cada tab; Motion, Anime.js y Three.js comparten el catálogo de 67 presets.
- Añadida preview WebGL para Three.js con ciclo de vida y liberación de recursos.
- Añadido panel por motor con detalles, enlace oficial y código listo para copiar.

### Calidad y accesibilidad

- Migrado el arrastre numérico a Pointer Events para ratón, táctil y lápiz.
- Añadidos nombres, ids, límites y tipos correctos en controles de formulario.
- Añadidos estados ARIA a tabs, menú, botones y feedback de copia.
- Añadido cierre por Escape en el menú compacto y control de overflow móvil.
- Añadido soporte global para `prefers-reduced-motion`.
- Ajustados tokens de contraste sin cambiar la estructura visual.
- Añadidos `robots.txt`, `llms.txt` y favicon propio.
- Centralizada la conversión de rutas GSAP en `utils/gsapUtils.ts`.
- Retirados los wrappers de cards sin consumidores y exports internos sin uso.

### Stack y dependencias

- Actualizados Bun, Vite+, Vite 8, React 19, TypeScript 7, Tailwind 4 y Vitest.
- Añadidos `three`, `motion`, `animejs` y tipos de Three.js.
- Retirados paquetes sin uso y dependencias directas redundantes de OXC.
- Actualizado y validado `bun.lock`.

### Tareas, logs y métricas

- Todos los scripts de build, lint, formato, tests, cobertura y tipos escriben en `logs/`.
- Añadido `verify` con resumen en `logs/verify.json`.
- Añadido `metrics` con presupuestos de carga y salida en `docs/METRICAS.md`.
- Actualizado `.vscode/tasks.json` con tareas cortas y emojis.
- Corregido `.gitignore` para logs, builds, cobertura, perfiles, cachés y archivos sensibles.

### Pruebas añadidas

- Ciclo de vida de los cuatro drivers.
- Conversión y fallback de rutas GSAP.
- Pointer Events en `ScrubbableInput`.
- Presencia y selección de cards en el catálogo compartido.
- Snapshots actualizados para los cambios accesibles de previews y cards.

## Evidencia

La puerta final pasó con 14 archivos y 34 tests. `bun run coverage` pasó con 65,15% statements; el build procesó 392 módulos; el preview de producción respondió HTTP 200. Lighthouse obtuvo 100 en accesibilidad, buenas prácticas y SEO en escritorio y móvil.

La evidencia final se registra en [Revisión general](REVISION_GENERAL.md), [Métricas](METRICAS.md), los logs locales y `.scratch/reports/ui-readiness-easing-lab/index.html`.
