export enum EasingCategory {
  ALL = "All",
  CUBIC = "Cubic Easing",
  SINE = "Sine",
  ELASTIC = "Elastic",
  BOUNCE = "Bounce",
  SPRING = "Spring",
}

export enum EasingType {
  ALL = "All",
  IN = "In",
  OUT = "Out",
  IN_OUT = "In-Out",
  OTHER = "Other",
}

export interface EasingFunction {
  id: string;
  name: string;
  category: EasingCategory;
  type: EasingType;
  path: string;
  bezier: [number, number, number, number];
  description?: string;
}

// New types for GSAP Gallery
export enum GSAPEasingCategory {
  ALL = "All",
  CUSTOM = "Custom",
  POWER = "Power",
  ELASTIC = "Elastic",
  BOUNCE = "Bounce",
  SPECIAL = "Special",
}

export interface GSAPEasingFunction {
  id: string;
  name: string;
  category: GSAPEasingCategory;
  ease: string;
  description: string;
}

export type AnimationEngine = "gsap" | "motion" | "animejs" | "three";

export type View = "cubic" | AnimationEngine;

/**
 * Represents a coordinate in a 2D space.
 * Used for Bezier control points and SVG coordinates.
 */
export interface Point {
  x: number;
  y: number;
}

export interface PathPoint extends Point {
  // Control point for the curve *ending* at this anchor
  handle1?: Point;
  // Control point for the curve *starting* from this anchor
  handle2?: Point;
}
