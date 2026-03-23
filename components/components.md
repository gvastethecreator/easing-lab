# Components

This directory contains reusable React components that are used across different views of the application.

## Component List

- **`AnimationPreview.tsx`**: Displays various types of animations (move, scale, rotate) using a provided GSAP ease and duration. It now uses GSAP for rendering, allowing for complex custom curves.
- **`ColorToggle.tsx`**: A button to cycle through different accent colors for the application's theme.
- **`CurveEditor.tsx`**: An interactive editor for creating and modifying standard cubic-bezier curves with draggable handles and input fields.
- **`EasingCard.tsx`**: A card component that visually represents a single cubic-bezier easing function with a small, interactive animation and a copy-to-clipboard feature.
- **`EasingGallery.tsx`**: A responsive grid layout that displays a collection of `EasingCard` components.
- **`FilterControls.tsx`**: A generic component that renders a set of filter buttons, used for filtering easing functions by category and type.
- **`Footer.tsx`**: The application footer, providing context and credits.
- **`GSAPCard.tsx`**: A card component that demonstrates a GSAP easing function with an animation on hover. It also allows copying the ease string and shows a descriptive tooltip.
- **`GSAPGallery.tsx`**: A responsive grid layout for displaying `GSAPCard` components.
- **`Header.tsx`**: The main application header, containing view navigation and theme controls.
- **`MultiPointCurveEditor.tsx`**: An advanced interactive editor for creating complex, multi-point easing curves for use with GSAP's `CustomEase` plugin.
- **`ThemeToggle.tsx`**: A button to switch between light and dark modes.