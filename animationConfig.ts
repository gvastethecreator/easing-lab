import type { PathPoint, Point } from "./types";

export const DEFAULT_DURATION = 1.5;
export const DEFAULT_RANGE = 1;
export const CUSTOM_GSAP_EASE_ID = "custom-gsap-ease";

export const CURVE_EDITOR_VIEWBOX_SIZE = 250;
export const GRAPH_CARD_VIEWBOX_SIZE = 224;

export const PREVIEW_TARGET_TRANSLATE_PERCENT = 350;
export const PREVIEW_TIMELINE_DURATION = 1;
export const PREVIEW_TRAIL_COUNT = 6;
export const PREVIEW_ANIMATION_TYPES = ["Move", "Scale", "Rotate", "Stagger"] as const;

const DEFAULT_BEZIER_P1_BASE: Point = { x: 0.645, y: 0.045 };
const DEFAULT_BEZIER_P2_BASE: Point = { x: 0.355, y: 1 };
const DEFAULT_GSAP_POINTS_BASE: PathPoint[] = [
  { x: 0, y: 0, handle2: { x: 0.34, y: 0 } },
  { x: 1, y: 1, handle1: { x: 0.66, y: 1 } },
];

export const createDefaultBezierP1 = (): Point => ({ ...DEFAULT_BEZIER_P1_BASE });

export const createDefaultBezierP2 = (): Point => ({ ...DEFAULT_BEZIER_P2_BASE });

export const createDefaultGsapPoints = (): PathPoint[] =>
  DEFAULT_GSAP_POINTS_BASE.map((point) => ({
    ...point,
    ...(point.handle1 ? { handle1: { ...point.handle1 } } : {}),
    ...(point.handle2 ? { handle2: { ...point.handle2 } } : {}),
  }));
