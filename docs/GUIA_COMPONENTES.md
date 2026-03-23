# Guía de Componentes

## 1. Arquitectura de Editores (Composition Pattern)

Para reducir la duplicación de código y mantener una consistencia visual, se ha implementado un patrón de composición para los editores de curvas.

### `EditorLayout`
Componente estructural que define el esqueleto de cualquier editor dentro de la aplicación.
*   **Props:** Acepta slots (`canvas`, `controls`, `toolbarActions`, `preview`) para inyectar contenido específico.
*   **Responsabilidad:** Maneja el layout, estilos de contenedores, la barra de herramientas y la sección de copia de código.

### `CurveEditor` (Implementación)
Utiliza `EditorLayout` para renderizar el editor Bézier estándar.
*   Gestiona el estado de dos puntos de control (`p1`, `p2`).
*   Inyecta inputs específicos para coordenadas X/Y de los puntos de control.

### `MultiPointCurveEditor` (Implementación)
Utiliza `EditorLayout` para renderizar el editor GSAP avanzado.
*   Gestiona un array dinámico de puntos.
*   Inyecta controles adicionales para añadir/eliminar puntos y suavizar curvas.

## 2. Iconografía Centralizada (`Icons.tsx`)
Todos los iconos SVG se han extraído a componentes funcionales individuales en `components/Icons.tsx`. Esto facilita la reutilización y asegura que los estilos (stroke, fill) sean consistentes en toda la app.

## 3. UniversalGraphCard
Tarjeta de presentación polimórfica para cualquier easing.
*   **Optimizaciones:** Utiliza `gsap.context` para limpiar animaciones y evitar fugas de memoria.
*   **Grid:** Utiliza el componente memoizado `GraphGrid` para reducir el coste de renderizado de múltiples tarjetas SVG complejas.

## 4. DraggableHandle
Componente de bajo nivel para interacción SVG.
*   **Accesibilidad:** Soporte completo para navegación por teclado (Flechas para mover, Shift+Flechas para mover más rápido).
*   **Matemáticas:** Convierte coordenadas de pantalla a espacio de usuario SVG (User Space) automáticamente, manejando el redimensionamiento de la ventana.

## 5. Header (con Follower)
Barra de navegación con efectos visuales.
*   **Performance:** El efecto de "follower" (el círculo que sigue al mouse) se ejecuta fuera del ciclo de renderizado de React, utilizando `gsap.ticker` y referencias directas al DOM para mantener 60fps constantes sin re-renders.