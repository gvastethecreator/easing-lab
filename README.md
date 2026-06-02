# EASY EASING

**EASY EASING** es un laboratorio interactivo para explorar, editar y exportar funciones de easing para interfaces web. La aplicación combina edición visual de curvas CSS `cubic-bezier()` con creación de curvas avanzadas para GSAP mediante `CustomEase`.

## ✨ Qué incluye

- Editor visual de curvas `cubic-bezier()`.
- Editor multipunto para curvas GSAP complejas.
- Galerías de easings CSS y GSAP con vista previa animada.
- Sincronización de animaciones con `gsap.ticker` fuera del render de React.
- Historial local de cambios con `undo` / `redo`.
- Tema claro/oscuro y color de acento (modo oscuro por defecto).
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

El proyecto incluye `.env.example` con la variable:

- `GEMINI_API_KEY`

Si no la necesitas, puedes ignorar el placeholder; no se requiere para el funcionamiento base de la app.

## 🧪 Scripts disponibles

```bash
bun run dev          # Servidor de desarrollo
bun run build        # Build de producción
bun run preview      # Vista previa del build
bun run typecheck    # tsc --noEmit
bun run lint         # oxlint
bun run lint:fix     # oxlint --fix
bun run format       # oxfmt
bun run format:check # oxfmt --check
bun run test         # vitest
bun run coverage     # vitest run --coverage
bun run check        # vp check (format + lint + typecheck)
```

## 🧰 Tareas de VS Code

El workspace incluye tareas listas en `.vscode/tasks.json`:

- `🚀 Dev`
- `🏗️ Build`
- `🧠 Typecheck`
- `🧹 Lint`
- `✨ Format`
- `🧪 Test`
- `📊 Coverage`
- `👁️ Preview`
- `✅ Check`

## 📁 Estructura principal

- `components/`: UI reusable y editores.
- `views/`: composición de pantallas principales.
- `hooks/`: utilidades de interacción e historial.
- `utils/`: helpers de performance.
- `contexts/`: tema global.
- `docs/`: documentación funcional y técnica.

## 📚 Documentación

- [PRD](docs/PRD.md)
- [Arquitectura](docs/ARQUITECTURA.md)
- [Sistema de Diseño](docs/SISTEMA_DISENO.md)
- [Guía de Componentes](docs/GUIA_COMPONENTES.md)
- [Revisión General](docs/REVISION_GENERAL.md)
- [Tareas realizadas](docs/TAREAS_REALIZADAS.md)
- [Deuda técnica](docs/DEUDA_TECNICA.md)

> Nota: `docs/METRICAS.md` está pendiente de regenerar. Tras `bun run build` se puede volver a generar manualmente a partir de `dist/`.

## 📄 Licencia

[MIT](LICENSE)

