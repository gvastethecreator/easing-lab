# EASY EASING

**EASY EASING** es un laboratorio interactivo para explorar, editar y exportar funciones de easing para interfaces web. La aplicación combina edición visual de curvas CSS `cubic-bezier()` con creación de curvas avanzadas para GSAP mediante `CustomEase`.

## ✨ Qué incluye

- Editor visual de curvas `cubic-bezier()`.
- Editor multipunto para curvas GSAP complejas.
- Galerías de easings CSS y GSAP con vista previa animada.
- Sincronización de animaciones con `gsap.ticker` fuera del render de React.
- Historial local de cambios con `undo` / `redo`.
- Tema claro/oscuro y color de acento.
- Scripts con generación automática de logs en `logs/`.
- Validación con `typecheck`, `lint`, `test`, `coverage`, `build` y `check`.

## 🧱 Stack actual

- **Runtime y gestor:** Bun
- **UI:** React 19 + TypeScript
- **Animación:** GSAP (`MotionPathPlugin`, `CustomEase`)
- **Build tooling:** Vite 8 + Vite+
- **Bundler:** Rolldown
- **Lint / format:** OXC (`oxlint`, `oxfmt`)
- **Testing:** Vitest + Testing Library + `happy-dom`
- **Estilos:** Tailwind CSS 4 con entrada local en `index.css`

## 🚀 Puesta en marcha

### Requisitos

- Bun `>= 1.3.11`
- Node `>= 20.19.0`

### Instalar dependencias

```bash
bun install
```

### Variables de entorno

El proyecto incluye `.env.example` y `.env` con la variable:

- `GEMINI_API_KEY`

Si no la necesitas para tu flujo actual, puedes dejar el placeholder sin uso.

## 🧪 Scripts disponibles

Todos los scripts escriben salida en la carpeta `logs/`.

```bash
bun run dev
bun run build
bun run preview
bun run typecheck
bun run lint
bun run format
bun run test
bun run coverage
bun run metrics
bun run check
```

`bun run metrics` analiza `dist/`, genera `logs/metrics.json` y actualiza `docs/METRICAS.md`. Para medir bundle real, ejecútalo después de `bun run build`.

## 🧰 Tareas de VS Code

El workspace incluye tareas listas en `.vscode/tasks.json`:

- `⚡ dev`
- `🏗️ build`
- `🧠 typecheck`
- `🔍 lint`
- `🧼 format`
- `🧪 test`
- `📊 coverage`
- `📏 metrics`
- `✅ check`
- `👀 preview`

## 📁 Estructura principal

- `components/`: UI reusable y editores.
- `views/`: composición de pantallas principales.
- `hooks/`: utilidades de interacción e historial.
- `utils/`: helpers de comparación y transformación GSAP.
- `contexts/`: tema global.
- `docs/`: documentación funcional y técnica.
- `scripts/`: utilidades de automatización, incluyendo logging.

## 📚 Documentación

- [PRD](docs/PRD.md)
- [Arquitectura](docs/ARQUITECTURA.md)
- [Sistema de Diseño](docs/SISTEMA_DISENO.md)
- [Guía de Componentes](docs/GUIA_COMPONENTES.md)
- [Métricas](docs/METRICAS.md)
- [Tareas realizadas](docs/TAREAS_REALIZADAS.md)
- [Deuda técnica](docs/DEUDA_TECNICA.md)

## ✅ Estado verificado

Validado en esta sesión:

- `bun run typecheck`
- `bun run lint`
- `bun run test`
- `bun run coverage`
- `bun run build`
- `bun run check`

En resumen: menos magia implícita, más tooling moderno, y bastantes menos gremlins.
