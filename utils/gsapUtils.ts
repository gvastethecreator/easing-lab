import { gsap } from 'gsap';
import type { PathPoint } from '../types';

/**
 * Generates an SVG path `d` attribute from a GSAP easing string.
 * It samples the easing function at a specified number of points to create a line graph representation.
 *
 * @param ease - The GSAP easing string (e.g., 'power2.inOut', 'custom-ease-id').
 * @param width - The width of the SVG viewport.
 * @param height - The height of the SVG viewport.
 * @param samples - The number of samples to take along the curve for precision. Defaults to 100.
 * @returns A string containing SVG path commands.
 */
export const generateGSAPPath = (
  ease: string,
  width: number,
  height: number,
  samples: number = 100
): string => {
  let easeFunction: gsap.EaseFunction | undefined;

  try {
    easeFunction = gsap.parseEase(ease);
  } catch (e) {
    console.warn(`Failed to parse ease: ${ease}`, e);
  }

  // If the ease string is invalid or the plugin isn't registered, return a fallback diagonal line.
  if (!easeFunction || typeof easeFunction !== 'function') {
    return `M 0 ${height} L ${width} 0`;
  }

  // Optimize: reduce floating point precision overhead in the loop
  const points: string[] = [];
  const precision = 2;

  // Move to start
  points.push(`M 0 ${height}`);

  for (let i = 1; i <= samples; i++) {
    const progress = i / samples; // Represents time, from 0 to 1
    const easedValue = easeFunction(progress); // The eased value, typically 0 to 1

    const x = (progress * width).toFixed(precision);
    const y = (height - easedValue * height).toFixed(precision);
    points.push(`L ${x} ${y}`);
  }

  return points.join(' ');
};

/**
 * Converts a GSAP ease string into an array of editable PathPoints.
 * Uses adaptive sampling and Catmull-Rom logic to approximate the curve.
 *
 * @param ease - The GSAP ease string.
 * @param samples - Number of points to sample.
 */
export const convertGsapEaseToPoints = (ease: string, samples: number = 12): PathPoint[] => {
  let easeFunc: gsap.EaseFunction | undefined;

  try {
    easeFunc = gsap.parseEase(ease);
  } catch (e) {
    console.warn(`Failed to convert ease to points: ${ease}`, e);
    return [];
  }

  if (!easeFunc || typeof easeFunc !== 'function') {
    // Return a basic linear line as fallback
    return [
      { x: 0, y: 0, handle2: { x: 0.25, y: 0 } },
      { x: 1, y: 1, handle1: { x: 0.75, y: 1 } },
    ];
  }

  // 1. Sample raw points with high precision
  const rawPoints: { x: number; y: number }[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = i / samples;
    const y = easeFunc(x);
    rawPoints.push({ x, y });
  }

  // 2. Calculate control points (handles) to smooth the curve
  // Using simplified Catmull-Rom to Bezier conversion
  const tension = 0.2; // Controls how "tight" the curve is

  return rawPoints.map((p, i, arr) => {
    // Clamp values to sane defaults for display, though GSAP allows overshoot
    const pathPoint: PathPoint = {
      x: parseFloat(p.x.toFixed(3)),
      y: parseFloat(p.y.toFixed(3)),
    };

    if (i === 0) {
      // Start point
      const pNext = arr[i + 1];
      if (pNext) {
        const tx = pNext.x - p.x;
        const ty = pNext.y - p.y;
        pathPoint.handle2 = {
          x: parseFloat((p.x + tx * tension * 1.5).toFixed(3)),
          y: parseFloat((p.y + ty * tension * 1.5).toFixed(3)),
        };
      }
    } else if (i === arr.length - 1) {
      // End point
      const pPrev = arr[i - 1];
      if (pPrev) {
        const tx = p.x - pPrev.x;
        const ty = p.y - pPrev.y;
        pathPoint.handle1 = {
          x: parseFloat((p.x - tx * tension * 1.5).toFixed(3)),
          y: parseFloat((p.y - ty * tension * 1.5).toFixed(3)),
        };
      }
    } else {
      // Mid points
      const pPrev = arr[i - 1];
      const pNext = arr[i + 1];

      if (pPrev && pNext) {
        // Tangent vector
        const tx = pNext.x - pPrev.x;
        const ty = pNext.y - pPrev.y;

        pathPoint.handle1 = {
          x: parseFloat((p.x - tx * tension).toFixed(3)),
          y: parseFloat((p.y - ty * tension).toFixed(3)),
        };
        pathPoint.handle2 = {
          x: parseFloat((p.x + tx * tension).toFixed(3)),
          y: parseFloat((p.y + ty * tension).toFixed(3)),
        };
      }
    }

    return pathPoint;
  });
};
