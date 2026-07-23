# Sistema de diseño

La puesta a punto conserva el diseño existente. Los cambios se limitan a traspasar estilos a tokens, mejorar contraste, completar estados y mantener el mismo patrón responsive.

## Tokens

Los tokens viven en `index.css` y Tailwind 4 los expone mediante `@theme inline`.

| Grupo      | Tokens                                                              |
| ---------- | ------------------------------------------------------------------- |
| Superficie | `--surface-base`, `--surface-1`, `--surface-2`, `--surface-hover`   |
| Texto      | `--text-primary`, `--text-secondary`, `--text-placeholder`          |
| Borde      | `--border-strong`, `--border-subtle`                                |
| Acento     | `--accent-primary`, `--accent-primary-hover`, `--accent-primary-bg` |
| Movimiento | `--global-duration`, `--global-easing`, `--motion-duration-*`       |

`ThemeContext` gestiona tema y diez acentos. El tema oscuro es el valor inicial salvo una preferencia `light` guardada.

## Tipografía y espacio

- Inter para interfaz y lectura.
- Roboto Mono para valores, código y tiempos.
- Escala de espacio de Tailwind basada en 4 px.
- Gráficos cuadrados para conservar las coordenadas normalizadas.

## Estados

- Foco visible con el acento activo.
- `aria-pressed` y `aria-checked` reflejan selección.
- Estados de carga, listo y error para cada driver.
- Feedback de copia con salida de error.
- `prefers-reduced-motion` reduce animaciones y transiciones; el progreso inicia pausado.

## Responsive

Las tabs se muestran desde `xl`. Debajo de ese ancho, un menú conserva acceso directo a los cinco laboratorios. Las cards usan dos columnas en móvil y crecen hasta seis; los editores pasan de columna a panel fijo desde `lg`.
