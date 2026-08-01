# Guía de componentes

## Editores

`CurveEditor` edita dos puntos Bézier y recibe el motor activo. `MultiPointCurveEditor` edita paths GSAP. Ambos usan `EditorLayout`, `ScrubbableInput`, `DraggableHandle`, historial y `AnimationPreview`.

Los editores reciben estado desde su vista. No deben crear drivers ni importar motores.

## Cards y catálogos

`UniversalGraphCard` es la card base. `EasingPresetBrowser` compone filtros y `EasingGallery`; lo usan Cubic, Motion, Anime.js y Three.js. `GSAPGallery` adapta su catálogo al mismo componente.

Al sumar un preset:

1. Añadir el dato a `constants.ts` o `gsapConstants.ts`.
2. Mantener id único, nombre, tipo, categoría y curva.
3. Comprobar la card, copia y selección.
4. Ejecutar los tests y revisar móvil.

## Motores

`useMasterProgressAnimation` crea un `ProgressDriver`. Para sumar un motor se deben actualizar tipos, configuración de tabs, driver, vista, código de ejemplo, dependencias, tests y docs.

`AnimationPreview` aplica la curva al progreso lineal. `ThreePreview` solo aparece para Three.js y libera todos los recursos al desmontar.

## Navegación

`Header` usa `VIEW_TABS` como fuente única. Escritorio presenta tabs; móvil presenta un menú `menuitemradio`. El botón global controla play y pausa.

## Controles

- Todo botón debe declarar `type="button"`.
- Inputs deben tener `id`, `name`, límites y nombre accesible.
- Los cambios por frame van a refs y estilos, fuera de estado React.
- Todo efecto con terceros debe devolver limpieza.
- Las nuevas animaciones deben respetar reduced motion.

## Pruebas

Los snapshots cubren la estructura de preview y card. Los tests de interacción cubren editores, arrastre, historial, drivers y catálogo. La verificación de tabs, responsive y WebGL se hace también en navegador real.
