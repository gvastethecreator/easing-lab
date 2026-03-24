# Tareas realizadas

## Tooling y plataforma

- Migración del proyecto a **Bun** como package manager.
- Actualización del stack a **React 19**, **TypeScript 5.9**, **GSAP 3.14**, **Vite 8** y **Vite+**.
- Integración de **Rolldown** en la configuración de build.
- Incorporación de **OXC** (`oxlint` y `oxfmt`) para lint y formato.
- Incorporación de **Vitest**, `@vitest/coverage-v8`, Testing Library y `happy-dom`.
- Generación de `bun.lock` para dejar el árbol de dependencias reproducible.

## Configuración del proyecto

- Revisión y limpieza de `package.json`.
- Reescritura de `vite.config.ts` para compatibilidad con el stack actual.
- Ajuste de `tsconfig.json` para el flujo actual de Vite/Vitest.
- Sustitución de estilos cargados por CDN por entrada local en `index.css`.
- Creación de `.env.example` y `.env` con placeholder de `GEMINI_API_KEY`.
- Mejora de `.gitignore` para excluir artefactos del proyecto.

## Scripts y automatización

- Creación de `scripts/run-with-log.mjs` para que `dev`, `build`, `lint`, `test`, `coverage`, `check` y demás dejen trazas en `logs/`.
- Compatibilización del flujo de `vp lint` con **Windows + Bun** resolviendo la ruta de `tsgolint.exe`.
- Creación de tareas de VS Code con nombres cortos y emojis en `.vscode/tasks.json`.

## Calidad de código y estabilidad

- Corrección de tipos en refs SVG y componentes drag-and-drop.
- Corrección de incompatibilidades de `motionPath` con referencias potencialmente nulas.
- Eliminación de una augmentación innecesaria/conflictiva de `Document.startViewTransition`.
- Simplificación del control de `play/pause` para evitar expresiones con efectos laterales.
- Limpieza de imports no usados y de pequeños avisos de lint.
- Reemplazo de comparaciones costosas basadas en `JSON.stringify` por comparaciones estructurales reutilizables.

## UX / UI sin cambios drásticos

- Conservación del diseño general del laboratorio.
- Consolidación del sistema de estilos sobre la base actual de Tailwind local.
- Mantenimiento de accesibilidad básica en controles interactivos y focos visibles.

## Testing

- Añadidos tests para:
  - `hooks/useHistory.ts`
  - `hooks/useDraggable.ts`
  - `utils/equality.ts`
  - `utils/gsapUtils.ts`
- Añadidos tests de integración para:
  - `components/CurveEditor.tsx`
  - `components/MultiPointCurveEditor.tsx`
- Añadidos snapshots / regresión para:
  - `components/AnimationPreview.tsx`
  - `components/UniversalGraphCard.tsx`
- Configuración de cobertura con salida en `coverage/`.
- Ajuste de Vitest para excluir `node_modules` y evitar ejecución de tests internos de dependencias.

## Arquitectura y mantenibilidad

- Extracción de constantes compartidas de animación a `animationConfig.ts`.
- Extracción de la orquestación principal a `useMasterProgressAnimation.ts` y `useRegisterCustomEase.ts`.
- Simplificación de `EasingCard.tsx` y `GSAPCard.tsx` como wrappers sobre `UniversalGraphCard.tsx` para consolidar la abstracción visual.

## Métricas y documentación

- Añadido `utils/performance.ts` para exponer métricas ligeras de arranque en cliente.
- Añadido `scripts/collect-metrics.mjs` y el script `bun run metrics` para vigilar bundle y transferencias estimadas.
- Actualización automática de `docs/METRICAS.md` a partir de `dist/`.
- Mejora de `docs/GUIA_COMPONENTES.md`, `docs/ARQUITECTURA.md` y `components/components.md` con ejemplos mínimos, referencias a tests de snapshot y documentación de la abstracción canónica de tarjetas.

## Verificaciones ejecutadas

Se validó correctamente en esta sesión:

- `bun run typecheck`
- `bun run lint`
- `bun run test`
- `bun run coverage`
- `bun run build`
- `bun run check`
