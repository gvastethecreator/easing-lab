# Dependencias

Revisión: **2026-07-30**. `bun.lock` fija el árbol instalado y `bun outdated` no informa paquetes desactualizados.

## Producción

| Paquete              | Versión | Motivo                                   |
| -------------------- | ------: | ---------------------------------------- |
| `react`, `react-dom` |  19.2.8 | UI y montaje de la SPA                   |
| `gsap`               |  3.15.0 | `CustomEase`, paths, cards y driver GSAP |
| `motion`             | 12.43.0 | Driver Motion                            |
| `animejs`            |   4.5.0 | Driver Anime.js                          |
| `three`              | 0.185.1 | Driver temporal y preview WebGL          |

## Desarrollo

| Grupo    | Paquetes                                                                        | Uso                                    |
| -------- | ------------------------------------------------------------------------------- | -------------------------------------- |
| Build    | `vite-plus`, `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`                | Tareas, bundling y CSS                 |
| Lenguaje | `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/three` | Tipos estáticos                        |
| Estilos  | `tailwindcss`                                                                   | Tokens y utilidades                    |
| Tests    | `vitest`, `@vitest/coverage-v8`, Testing Library, `happy-dom`                   | Unitarios, integración y cobertura     |
| Salud    | `knip`                                                                          | Código, exports y dependencias sin uso |

OXC llega por Vite+; no se mantienen copias directas de `oxlint` u `oxfmt`. `@testing-library/dom` es un peer requerido por Testing Library React. Se retiró `@testing-library/user-event` porque no tenía uso. Las versiones con `^` se resuelven y quedan fijadas en `bun.lock`.

Knip ignora `animejs`, `motion` y `three` en su control de dependencias porque los tres entran mediante `import()` dinámico. Sus archivos y exports sí pasan el resto del análisis; el build y las pruebas de drivers demuestran esos imports.

## Política de actualización

1. Ejecutar `bun outdated` o `bun run deps`.
2. Revisar notas de versión y compatibilidad de majors.
3. Aplicar `bun update --latest`.
4. Ejecutar `bun install --frozen-lockfile --ignore-scripts`.
5. Ejecutar `bun run verify` y revisar `bun run metrics`.
6. Abrir cada motor en navegador cuando cambie una dependencia de runtime.

En 2026-07-30, Vite+ 0.2.6, Vite 8.2.0 y sus paquetes internos quedaron resueltos en el mismo lockfile; no queda una discrepancia conocida de toolchain.
