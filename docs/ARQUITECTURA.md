# Arquitectura Técnica

## 1. Stack Tecnológico

- **Frontend Framework:** React 19.
- **Lenguaje:** TypeScript. Tipado estricto para `props`, `state` y estructuras de datos de animación.
- **Motor de Animación:** GSAP v3.14.
  - `gsap.core`: Para tweens y timelines.
  - `MotionPathPlugin`: Para visualizar las curvas SVG y mover los marcadores a lo largo de ellas.
  - `CustomEase`: Para interpretar y ejecutar curvas no estándar.
- **Estilos:** Tailwind CSS 4 con integración local vía Vite.
- **Tooling:** Vite 8 + Vite+, Rolldown, OXC y Vitest.

## 2. Estructura de Directorios

El proyecto sigue una arquitectura plana basada en funcionalidades y mantiene los archivos principales en la raíz del workspace:

```text
components/           # Componentes UI reutilizables y editores
views/                # Composición de vistas principales
hooks/                # Lógica de interacción y sincronización
utils/                # Helpers puros y utilidades de performance/GSAP
docs/                 # Documentación funcional y técnica
scripts/              # Automatización y métricas
App.tsx               # Orquestación de vistas y estado compartido
index.tsx             # Entrada de React DOM
animationConfig.ts    # Constantes y defaults de animación
constants.ts          # Catálogos de easings y presets
types.ts              # Tipos globales
```

## 3. Gestión de Estado y Flujo de Datos

La aplicación utiliza un patrón de **"Fuente de Verdad Centralizada con Referencias Mutables para Animación"**.

### 3.1 Estado de la curva

El estado de las curvas (`p1`, `p2` para Bezier; `points` para GSAP) reside en `App.tsx` y se pasa hacia abajo a los editores y visualizadores. Esto asegura que si cambias una curva en el editor, la galería y la previsualización reaccionan instantáneamente.

### 3.2 Sincronización de Animación (`progressRef`)

Para evitar re-renderizados costosos en cada frame de animación (60fps), la aplicación **NO** guarda el progreso de la animación (0% a 100%) en un estado de React (`useState`).

En su lugar, utiliza un patrón de referencia mutable:

1. **Origen:** `App.tsx` crea un `masterTween` de GSAP que anima un objeto `progressRef.current = { progress: 0 }` de 0 a 1.
2. **Propagación:** Este `progressRef` se pasa a los componentes hijos (`AnimationPreview`, `Header`, etc.).
3. **Consumo:** Los componentes hijos usan `gsap.ticker` (el bucle de renderizado de GSAP) para leer `progressRef.current.progress` y actualizar sus propios elementos visuales (DOM o Canvas) independientemente del ciclo de renderizado de React.

**Beneficio:** Rendimiento extremo. La UI de React solo se renderiza cuando cambia la _lógica_ o la _estructura_, no durante la _reproducción_ de la animación.

La orquestación principal se ha dividido además en hooks dedicados:

- `useMasterProgressAnimation`: crea y sincroniza el tween maestro del progreso compartido.
- `useRegisterCustomEase`: registra y actualiza el easing multipunto editado por el usuario.

### 3.3 Historial (Undo/Redo)

Se implementa a través del hook `useHistory`. Este hook encapsula la lógica de mantener un array de estados pasados y futuros.

- Es agnóstico al tipo de dato (funciona para coordenadas Bezier o arrays de puntos GSAP).
- Se integra en los editores (`CurveEditor`, `MultiPointCurveEditor`) para proporcionar una experiencia de edición robusta.

## 4. Componentes Clave

### `UniversalGraphCard`

Componente polimórfico capaz de renderizar cualquier tipo de curva.

- Genera dinámicamente el `path` SVG.
- Usa `MotionPathPlugin` para mover un punto a lo largo de ese path visualmente.
- Es la abstracción visual canónica; `EasingCard` y `GSAPCard` actúan como wrappers de compatibilidad.

### `DraggableHandle`

Componente SVG interactivo.

- Abstrae la complejidad de convertir coordenadas del ratón/touch (píxeles) a coordenadas SVG normalizadas (0-1).
- Gestiona estados de foco y accesibilidad por teclado.

### `AnimationPreview`

Previsualizador compartido de animaciones.

- Usa `gsap.ticker` para mover los elementos sin re-render por frame.
- Tiene cobertura de regresión en `components/AnimationPreview.test.tsx`.

## 5. Métricas y observabilidad ligera

- `bun run metrics` analiza el contenido de `dist/`, genera `logs/metrics.json` y actualiza `docs/METRICAS.md`.
- `index.tsx` publica métricas ligeras de arranque en `window.__EASING_LAB_STARTUP_METRICS__` para inspección manual durante desarrollo.

## 6. Sistema de theming

El theming se basa en variables CSS nativas (`var(--accent-primary)`) controladas por Tailwind.

- **Cambio de tema:** `ThemeContext` actualiza las variables CSS en el documento.
- **Transiciones:** Se aplica una transición global (`transition-colors`) a los elementos afectados para que el cambio de tema sea fluido.
