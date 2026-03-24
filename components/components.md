# Components

This directory contains reusable React components that are used across different views of the application.

## Canonical visual cards

- **`UniversalGraphCard.tsx`** is the canonical visual abstraction for easing cards.
- **`EasingCard.tsx`** and **`GSAPCard.tsx`** are now thin compatibility wrappers that delegate their rendering to `UniversalGraphCard`.
- Snapshot and regression coverage currently lives in `components/UniversalGraphCard.test.tsx` and `components/AnimationPreview.test.tsx`.

## Component List

- **`AnimationPreview.tsx`**: Displays various types of animations (move, scale, rotate) using a provided GSAP ease and duration. It now uses GSAP for rendering, allowing for complex custom curves.
- **`ColorToggle.tsx`**: A button to cycle through different accent colors for the application's theme.
- **`CurveEditor.tsx`**: An interactive editor for creating and modifying standard cubic-bezier curves with draggable handles and input fields.
- **`EasingCard.tsx`**: Compatibility wrapper for cubic-bezier cards, backed by `UniversalGraphCard`.
- **`EasingGallery.tsx`**: A responsive grid layout that displays a collection of `EasingCard` components.
- **`FilterControls.tsx`**: A generic component that renders a set of filter buttons, used for filtering easing functions by category and type.
- **`Footer.tsx`**: The application footer, providing context and credits.
- **`GSAPCard.tsx`**: Compatibility wrapper for GSAP cards, backed by `UniversalGraphCard`.
- **`GSAPGallery.tsx`**: A responsive grid layout for displaying `GSAPCard` components.
- **`Header.tsx`**: The main application header, containing view navigation and theme controls.
- **`MultiPointCurveEditor.tsx`**: An advanced interactive editor for creating complex, multi-point easing curves for use with GSAP's `CustomEase` plugin.
- **`ThemeToggle.tsx`**: A button to switch between light and dark modes.

## Minimal usage examples

### `UniversalGraphCard`

```tsx
<UniversalGraphCard
  id="ease-in-out"
  title="Ease In Out"
  subtitle="cubic-bezier(0.42, 0, 0.58, 1)"
  description="Balanced curve for entrances and exits."
  pathData="M 0 224 C 94 224, 130 0, 224 0"
  animationEase="cubic-bezier(0.42, 0, 0.58, 1)"
  copyValue="cubic-bezier(0.42, 0, 0.58, 1)"
  onSelect={() => {}}
/>
```

### `CurveEditor`

```tsx
<CurveEditor
  p1={{ x: 0.25, y: 0.25 }}
  setP1={setP1}
  p2={{ x: 0.75, y: 0.75 }}
  setP2={setP2}
  duration={1.5}
  setDuration={setDuration}
  range={1}
  setRange={setRange}
  progressRef={progressRef}
/>
```
