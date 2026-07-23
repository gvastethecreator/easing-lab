# Domain docs

This is a single-context React application for exploring, editing, previewing, and exporting CSS and GSAP easing curves.

## Read before exploring

- Read `docs/PRD.md` for product goals and supported user flows.
- Read `docs/ARQUITECTURA.md` for module boundaries and state flow.
- Read `docs/SISTEMA_DISENO.md` before changing styles or tokens.
- Read any ADR under `docs/adr/` when that directory exists and the change touches its topic.

## Domain vocabulary

- **Cubic Bezier**: the CSS `cubic-bezier()` editor and its two control points.
- **GSAP Custom Ease**: the multipoint curve editor and its generated easing path.
- **Master progress**: the shared mutable animation progress used by previews.
- **Graph card**: the reusable visual card used by both easing galleries.
- **Design tokens**: semantic CSS variables for surfaces, text, borders, accents, and spacing.

Use these terms in issue titles, tests, and technical notes. Keep the existing visual language and interaction model unless the task explicitly changes them.
