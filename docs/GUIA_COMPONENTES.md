# Guía de Componentes

## 1. Arquitectura de Editores (Composition Pattern)

Para reducir la duplicación de código y mantener una consistencia visual, se ha implementado un patrón de composición para los editores de curvas.

### `EditorLayout`

Componente estructural que define el esqueleto de cualquier editor dentro de la aplicación.

- **Props:** Acepta slots (`canvas`, `controls`, `toolbarActions`, `preview`) para inyectar contenido específico.
- **Responsabilidad:** Maneja el layout, estilos de contenedores, la barra de herramientas y la sección de copia de código.

### `CurveEditor` (Implementación)

Utiliza `EditorLayout` para renderizar el editor Bézier estándar.

- Gestiona el estado de dos puntos de control (`p1`, `p2`).
- Inyecta inputs específicos para coordenadas X/Y de los puntos de control.
- Tiene cobertura de integración para presets y navegación por teclado en `components/CurveEditor.test.tsx`.

**Ejemplo mínimo:**

```tsx
<CurveEditor
  p1={p1}
  setP1={setP1}
  p2={p2}
  setP2={setP2}
  duration={duration}
  setDuration={setDuration}
  range={range}
  setRange={setRange}
  progressRef={progressRef}
/>
```

### `MultiPointCurveEditor` (Implementación)

Utiliza `EditorLayout` para renderizar el editor GSAP avanzado.

- Gestiona un array dinámico de puntos.
- Inyecta controles adicionales para añadir/eliminar puntos y suavizar curvas.
- Incluye tests de integración para alta/baja de puntos y selección rápida en `components/MultiPointCurveEditor.test.tsx`.

**Ejemplo mínimo:**

```tsx
<MultiPointCurveEditor
  points={points}
  setPoints={setPoints}
  customEaseId="custom-gsap-ease"
  duration={duration}
  setDuration={setDuration}
  range={range}
  setRange={setRange}
  progressRef={progressRef}
/>
```

## 2. Iconografía Centralizada (`Icons.tsx`)

Todos los iconos SVG se han extraído a componentes funcionales individuales en `components/Icons.tsx`. Esto facilita la reutilización y asegura que los estilos (stroke, fill) sean consistentes en toda la app.

## 3. UniversalGraphCard

Tarjeta de presentación polimórfica para cualquier easing.

- **Optimizaciones:** Utiliza `gsap.context` para limpiar animaciones y evitar fugas de memoria.
- **Grid:** Utiliza el componente memoizado `GraphGrid` para reducir el coste de renderizado de múltiples tarjetas SVG complejas.
- **Abstracción canónica:** `EasingCard` y `GSAPCard` sobreviven como wrappers de compatibilidad sobre esta pieza.
- **Regresión visual:** El baseline está cubierto por snapshot e interacción en `components/UniversalGraphCard.test.tsx`.

**Ejemplo mínimo:**

```tsx
<UniversalGraphCard
  id="power2-out"
  title="Power2 Out"
  subtitle="power2.out"
  description="Salida rápida y suave."
  pathData={pathData}
  animationEase="power2.out"
  copyValue="power2.out"
  onSelect={() => setEase("power2.out")}
/>
```

## 4. DraggableHandle

Componente de bajo nivel para interacción SVG.

- **Accesibilidad:** Soporte completo para navegación por teclado (Flechas para mover, Shift+Flechas para mover más rápido).
- **Matemáticas:** Convierte coordenadas de pantalla a espacio de usuario SVG (User Space) automáticamente, manejando el redimensionamiento de la ventana.
- **Cobertura de drag:** El hook subyacente tiene prueba dedicada en `hooks/useDraggable.test.tsx`.

## 5. Header (con Follower)

Barra de navegación con efectos visuales.

- **Performance:** El efecto de "follower" (el círculo que sigue al mouse) se ejecuta fuera del ciclo de renderizado de React, utilizando `gsap.ticker` y referencias directas al DOM para mantener 60fps constantes sin re-renders.

## 6. Microcopy y consistencia

- La acción de copia se unificó alrededor de la etiqueta **"Copy easing value"** y del feedback visual **"Copied!"**.
- Las tarjetas activas comparten ahora la misma jerarquía visual, botón de copia y tooltip para reducir diferencias entre galerías.
- Los ejemplos automatizados de referencia viven en los tests de snapshot de `AnimationPreview` y `UniversalGraphCard`.
