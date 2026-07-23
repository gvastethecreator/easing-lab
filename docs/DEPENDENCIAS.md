# Dependencias

Revisión: **2026-07-22**. `bun.lock` fija el árbol instalado.

## Producción

| Paquete              | Versión | Motivo                                   |
| -------------------- | ------: | ---------------------------------------- |
| `react`, `react-dom` |  19.2.8 | UI y montaje de la SPA                   |
| `gsap`               |  3.15.x | `CustomEase`, paths, cards y driver GSAP |
| `motion`             | 12.42.2 | Driver Motion                            |
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

OXC llega por Vite+; no se mantienen copias directas de `oxlint` u `oxfmt`. `@testing-library/dom` es un peer requerido por Testing Library React. Se retiró `@testing-library/user-event` porque no tenía uso.

Knip ignora `animejs`, `motion` y `three` en su control de dependencias porque los tres entran mediante `import()` dinámico. Sus archivos y exports sí pasan el resto del análisis; el build y las pruebas de drivers demuestran esos imports.

## Política de actualización

1. Ejecutar `bun outdated` o `bun run deps`.
2. Revisar notas de versión y compatibilidad de majors.
3. Aplicar `bun update --latest` en una rama.
4. Ejecutar `bun install --frozen-lockfile` y `bun run verify`.
5. Revisar el bundle con `bun run metrics` y cada motor en navegador.

Vite+ 0.2.5 ejecuta en esta versión un Vite 8.1.4 interno, mientras el manifiesto instala Vite 8.1.5. Ambos pertenecen a Vite 8; se conserva la versión directa más nueva para el API del proyecto.
