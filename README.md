# Easy Easing

Laboratorio visual para explorar, editar, comparar y copiar curvas de easing. Incluye una pestaña propia para CSS Cubic Bezier, GSAP, Motion, Anime.js y Three.js. Cada motor muestra cards de curvas y una vista previa que usa el mismo progreso normalizado.

## Funciones

- Editor `cubic-bezier()` con arrastre, entradas numéricas, presets, undo y redo.
- Editor multipunto para `GSAP CustomEase`.
- Catálogo de 67 curvas en CSS, Motion, Anime.js y Three.js.
- Galería propia de curvas multipunto en GSAP.
- Previews de mover, escalar, rotar y stagger; Three.js añade un canvas WebGL.
- Play/pausa global, tema claro/oscuro y selección de acento.
- Navegación de escritorio por tabs y menú compacto en pantallas pequeñas.
- Respeto por `prefers-reduced-motion` y controles con nombres accesibles.

## Stack

- Bun 1.3.14 como runtime y gestor de paquetes.
- React 19.2.8 y TypeScript 7.0.2.
- Vite+ 0.2.5, Vite 8.1.5 y Rolldown.
- Tailwind CSS 4.3.3 con tokens semánticos en `index.css`.
- OXC, a través de Vite+, para lint y formato.
- Vitest 4.1.10, Testing Library y happy-dom.
- GSAP 3.15, Motion 12.42, Anime.js 4.5 y Three.js 0.185.

## Inicio rápido

Requiere Bun `>=1.3.14` y Node `>=20.19.0`.

```bash
bun install --frozen-lockfile
bun run dev
```

Abre `http://localhost:3000`. El proyecto no necesita secretos ni variables de entorno.

## Tareas

| Comando                | Uso                           | Log                               |
| ---------------------- | ----------------------------- | --------------------------------- |
| `bun run dev`          | Servidor local                | `logs/dev.log`                    |
| `bun run build`        | Build de producción           | `logs/build.log`                  |
| `bun run preview`      | Sirve `dist/`                 | `logs/preview.log`                |
| `bun run format`       | Corrige formato OXC           | `logs/format.log`                 |
| `bun run format:check` | Comprueba formato             | `logs/format-check.log`           |
| `bun run lint`         | Ejecuta Oxlint                | `logs/lint.log`                   |
| `bun run typecheck`    | Comprueba TypeScript          | `logs/typecheck.log`              |
| `bun run test`         | Suite Vitest                  | `logs/test.log`                   |
| `bun run coverage`     | Cobertura V8                  | `logs/coverage.log`               |
| `bun run deps`         | Dependencias desfasadas       | `logs/deps.log`                   |
| `bun run unused`       | Código y dependencias sin uso | `logs/unused.log`                 |
| `bun run metrics`      | Presupuestos del bundle       | `logs/metrics.log`                |
| `bun run verify`       | Puerta completa               | `logs/verify.json` y logs previos |

VS Code expone las mismas acciones en `.vscode/tasks.json`, con nombres cortos y emojis.

## Arquitectura breve

`animation/progressDrivers.ts` adapta cada motor al contrato `play`, `pause` y `dispose`. Los drivers publican progreso lineal de `0` a `1`; `AnimationPreview` aplica una sola vez la curva elegida. React gestiona estado y vistas, pero el progreso por frame vive en una ref para evitar renders continuos.

Las vistas se cargan de forma diferida. Three.js y los demás motores se importan al abrir su pestaña. `EasingPresetBrowser` comparte filtros y cards entre Cubic, Motion, Anime.js y Three.js.

## Documentación

- [Arquitectura](docs/ARQUITECTURA.md)
- [Dependencias](docs/DEPENDENCIAS.md)
- [Sistema de diseño](docs/SISTEMA_DISENO.md)
- [Guía de componentes](docs/GUIA_COMPONENTES.md)
- [Revisión general](docs/REVISION_GENERAL.md)
- [Tareas realizadas](docs/TAREAS_REALIZADAS.md)
- [Deuda técnica](docs/DEUDA_TECNICA.md)
- [Métricas](docs/METRICAS.md)

## Licencia

[MIT](LICENSE)
