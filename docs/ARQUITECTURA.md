# Arquitectura Técnica

## 1. Stack Tecnológico

- **Frontend Framework:** React 19. Utiliza las últimas características de concurrencia y gestión de estado.
- **Lenguaje:** TypeScript. Tipado estricto para `props`, `state` y estructuras de datos de animación.
- **Motor de Animación:** GSAP (GreenSock Animation Platform) v3.12.
  - `gsap.core`: Para tweens y timelines.
  - `MotionPathPlugin`: Para visualizar las curvas SVG y mover los marcadores a lo largo de ellas.
  - `CustomEase`: Para interpretar y ejecutar curvas no estándar.
- **Estilos:** Tailwind CSS v3.4. Enfoque "utility-first" con variables CSS nativas para el theming dinámico.

## 2. Estructura de Directorios

El proyecto sigue una arquitectura plana basada en funcionalidades:

```
src/
├── components/       # Componentes UI reutilizables (atómicos y moleculares)
├── views/            # Componentes de página (organismos complejos)
├── hooks/            # Lógica de negocio extraída (Custom Hooks)
├── utils/            # Funciones puras y helpers matemáticos
├── types.ts          # Definiciones de tipos globales (Interfaces, Enums)
├── constants.ts      # Datos estáticos (Presets de curvas)
├── App.tsx           # Punto de entrada lógico y orquestador de estado global
└── main.tsx          # Punto de entrada de React DOM
```

## 3. Gestión de Estado y Flujo de Datos

La aplicación utiliza un patrón de **"Fuente de Verdad Centralizada con Referencias Mutables para Animación"**.

### 3.1 Estado de la Curva

El estado de las curvas (`p1`, `p2` para Bezier; `points` para GSAP) reside en `App.tsx` y se pasa hacia abajo a los editores y visualizadores. Esto asegura que si cambias una curva en el editor, la galería y la previsualización reaccionan instantáneamente.

### 3.2 Sincronización de Animación (`progressRef`)

Para evitar re-renderizados costosos en cada frame de animación (60fps), la aplicación **NO** guarda el progreso de la animación (0% a 100%) en un estado de React (`useState`).

En su lugar, utiliza un patrón de referencia mutable:

1.  **Origen:** `App.tsx` crea un `masterTween` de GSAP que anima un objeto `progressRef.current = { progress: 0 }` de 0 a 1.
2.  **Propagación:** Este `progressRef` se pasa a los componentes hijos (`AnimationPreview`, `Header`, etc.).
3.  **Consumo:** Los componentes hijos usan `gsap.ticker` (el bucle de renderizado de GSAP) para leer `progressRef.current.progress` y actualizar sus propios elementos visuales (DOM o Canvas) independientemente del ciclo de renderizado de React.

**Beneficio:** Rendimiento extremo. La UI de React solo se renderiza cuando cambia la _lógica_ o la _estructura_, no durante la _reproducción_ de la animación.

### 3.3 Historial (Undo/Redo)

Se implementa a través del hook `useHistory`. Este hook encapsula la lógica de mantener un array de estados pasados y futuros.

- Es agnóstico al tipo de dato (funciona para coordenadas Bezier o arrays de puntos GSAP).
- Se integra en los editores (`CurveEditor`, `MultiPointCurveEditor`) para proporcionar una experiencia de edición robusta.

## 4. Componentes Clave

### `UniversalGraphCard`

Componente polimórfico capaz de renderizar cualquier tipo de curva.

- Genera dinámicamente el `path` SVG.
- Usa `MotionPathPlugin` para mover un punto a lo largo de ese path visualmente.
- Implementa View Transitions API para animaciones suaves entre estados de filtrado.

### `DraggableHandle`

Componente SVG interactivo.

- Abstrae la complejidad de convertir coordenadas del ratón/touch (píxeles) a coordenadas SVG normalizadas (0-1).
- Gestiona estados de foco y accesibilidad por teclado.

## 5. Sistema de Theming

El theming se basa en variables CSS nativas (`var(--accent-primary)`) controladas por Tailwind.

- **Cambio de Tema:** `App.tsx` actualiza las variables CSS en el elemento `:root` o `html`.
- **Transiciones:** Se aplica una transición global (`transition-colors`) a todos los elementos afectados para que el cambio de tema sea fluido y orgánico.
