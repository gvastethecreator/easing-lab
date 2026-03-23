# Sistema de Diseño

## 1. Filosofía
EASY EASING adopta una estética **"Cyber-Industrial Limpia"**. Combina la precisión técnica de las herramientas de ingeniería (grids, coordenadas, líneas finas) con una interfaz moderna y accesible. El diseño prioriza el contenido (las curvas) sobre la decoración.

## 2. Paleta de Colores

El sistema utiliza variables CSS semánticas para permitir un cambio de tema (Claro/Oscuro) instantáneo y fácil mantenimiento.

### Superficies (Surfaces)
| Token | Descripción | Uso |
|-------|-------------|-----|
| `--surface-base` | Fondo principal de la app. | `body`, fondos generales. |
| `--surface-1` | Primer nivel de elevación. | Tarjetas, paneles laterales. |
| `--surface-2` | Segundo nivel, elementos interactivos. | Inputs, botones secundarios. |
| `--surface-hover` | Estado hover. | Feedback visual al pasar el mouse. |

### Texto y Bordes
| Token | Descripción |
|-------|-------------|
| `--text-primary` | Contenido principal, títulos. Alto contraste. |
| `--text-secondary` | Etiquetas, descripciones, metadatos. |
| `--border-strong` | Límites estructurales importantes. |
| `--border-subtle` | Divisiones suaves, grids, decoraciones. |

### Acentos Dinámicos
El color de acento es configurable por el usuario y afecta a toda la aplicación globalmente.
*   `--accent-primary`: Color principal (botones activos, líneas de gráficos).
*   `--accent-primary-hover`: Estado hover del color principal.
*   `--accent-primary-bg`: Versión transparente (alpha) para fondos sutiles de selección.

## 3. Tipografía

Se utiliza una combinación de fuentes para reforzar la identidad técnica:

*   **Principal (Sans):** `Inter`. Usada para UI general, títulos y texto de lectura. Excelente legibilidad en tamaños pequeños.
*   **Técnica (Mono):** `Roboto Mono`. Usada para valores numéricos, código, coordenadas y etiquetas de ejes. Asegura alineación vertical en tablas de datos.

## 4. Iconografía
Iconos SVG "in-line" (dentro del código) con estilo `stroke` (línea) y grosor de 2px, consistentes con la estética técnica y lineal de los gráficos.

## 5. Movimiento y Animación

Las animaciones de la interfaz (no las curvas que crea el usuario, sino la UI en sí) siguen estos principios:

*   **Micro-interacciones:** Rápidas (0.2s) y responsivas (ej. hover en tarjetas).
*   **Transiciones de Estado:** Suaves y fluidas. El cambio de color de acento utiliza una transición global de `1.5s` con un easing `cubic-bezier(0.645, 0.045, 0.355, 1)` para dar una sensación de "metamorfosis" elegante.
*   **Feedback:** Uso de escala y opacidad para indicar interactividad (ej. al copiar código).

## 6. Grid y Espaciado
*   Sistema de grid responsivo basado en columnas (Tailwind `grid-cols-*`).
*   Espaciado consistente basado en la escala de 4px de Tailwind (gap-4, p-6, etc.).
*   Los gráficos SVG mantienen una relación de aspecto cuadrada (1:1) para preservar la integridad matemática de las curvas normalizadas (0-1).
