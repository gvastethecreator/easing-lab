# Documento de Requisitos del Producto (PRD)

**Proyecto:** EASY EASING  
**Versión:** 1.0  
**Estado:** Producción

## 1. Visión del Producto

EASY EASING nace de la necesidad de cerrar la brecha entre las matemáticas de la animación y la percepción visual. Los desarrolladores a menudo luchan por elegir la función de aceleración correcta basándose solo en nombres abstractos (ej. `easeInOutQuart`). Esta herramienta proporciona una interfaz visual e interactiva para "sentir" la animación antes de implementarla.

## 2. Público Objetivo

- **Desarrolladores Frontend:** Que necesitan ajustar micro-interacciones y transiciones CSS/GSAP.
- **Diseñadores UI/UX:** Que requieren comunicar especificaciones de movimiento precisas a los desarrolladores.
- **Motion Designers:** Que buscan prototipar curvas complejas rápidamente.

## 3. Objetivos Clave

1.  **Educación Visual:** Permitir a los usuarios entender cómo la curva afecta la velocidad y el tiempo.
2.  **Eficiencia:** Reducir el tiempo de prueba y error al implementar animaciones.
3.  **Flexibilidad:** Soportar tanto el estándar web (CSS) como el estándar de la industria de animación (GSAP).

## 4. Historias de Usuario Principales

| ID   | Como...       | Quiero...                                               | Para...                                                    |
| ---- | ------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| US-1 | Desarrollador | Ver una galería de easings estándar                     | Elegir rápidamente una base para mi animación.             |
| US-2 | Diseñador     | Editar una curva Bézier arrastrando puntos              | Ajustar la sensación de "peso" de un elemento.             |
| US-3 | Animador      | Crear una curva con rebotes personalizados (multipunto) | Lograr efectos que CSS estándar no permite.                |
| US-4 | Usuario       | Cambiar la velocidad y escala de la previsualización    | Ver cómo se comporta la animación en diferentes contextos. |
| US-5 | Usuario       | Copiar el código resultante con un clic                 | Pegarlo directamente en mi IDE.                            |

## 5. Alcance Funcional (Features)

### 5.1 Vista Cubic Bezier (CSS)

- **Gráfico Interactivo:** SVG con grid y tiradores (handles) arrastrables.
- **Historial:** Funcionalidad de Deshacer/Rehacer (Undo/Redo) para la edición.
- **Inputs Numéricos:** Edición precisa de coordenadas (X, Y) con funcionalidad de "scrubbing" (arrastrar para cambiar valor).
- **Presets:** Acceso rápido a curvas lineales y estándar.

### 5.2 Vista GSAP (Custom Ease)

- **Editor Multipunto:** Capacidad de añadir, eliminar y modificar infinitos puntos en la curva.
- **Suavizado Automático:** Algoritmo para convertir puntos angulares en curvas suaves.
- **Integración CustomEase:** Uso del plugin de GSAP para generar strings de path SVG compatibles.

### 5.3 Sistema Global

- **Sincronización de Tiempo:** Un "timeline maestro" controla todas las previsualizaciones simultáneamente.
- **Temas:** Cambio dinámico de paleta de colores y modo oscuro/claro persistente.
- **Feedback:** Indicadores visuales de copia y tooltips informativos.

## 6. Métricas de Éxito

- Facilidad de uso del editor (medida cualitativa).
- Rendimiento constante a 60fps durante la manipulación de gráficos.
- Accesibilidad (navegación por teclado en los editores).
