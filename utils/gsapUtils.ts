import { gsap } from 'gsap';
import type { PathPoint } from '../types';

interface ResolvedGsapEase {
  easeFunction: gsap.EaseFunction | null;
  error: Error | null;
}

const createFallbackLinearPath = (width: number, height: number) => `M 0 ${height} L ${width} 0`;

const createFallbackLinearPoints = (): PathPoint[] => [
  { x: 0, y: 0, handle2: { x: 0.25, y: 0 } },
  { x: 1, y: 1, handle1: { x: 0.75, y: 1 } },
];

const resolveGsapEaseFunction = (ease: string): ResolvedGsapEase => {
  try {
    const parsedEase = gsap.parseEase(ease);
    if (typeof parsedEase !== 'function') {
      return {
        easeFunction: null,
        error: new Error(`GSAP ease did not resolve to a function: ${ease}`),
      };
    }

    return { easeFunction: parsedEase, error: null };
  } catch (cause) {
    return {
      easeFunction: null,
      error: new Error(`Invalid GSAP ease: ${ease}`, { cause }),
    };
  }
};

/** Creates an SVG line graph by sampling a GSAP easing function. */
export const generateGSAPPath = (
  ease: string,
  width: number,
  height: number,
  samples = 100
): string => {
  const { easeFunction } = resolveGsapEaseFunction(ease);
  if (!easeFunction) return createFallbackLinearPath(width, height);

  const points: string[] = [`M 0 ${height}`];
  for (let i = 1; i <= samples; i += 1) {
    const progress = i / samples;
    const easedValue = easeFunction(progress);
    const x = (progress * width).toFixed(2);
    const y = (height - easedValue * height).toFixed(2);
    points.push(`L ${x} ${y}`);
  }

  return points.join(' ');
};

/** Converts a GSAP easing into editable anchor points with Bezier handles. */
export const convertGsapEaseToPoints = (ease: string, samples = 12): PathPoint[] => {
  const { easeFunction } = resolveGsapEaseFunction(ease);
  if (!easeFunction) return createFallbackLinearPoints();

  const rawPoints = Array.from({ length: samples + 1 }, (_, index) => {
    const x = index / samples;
    return { x, y: easeFunction(x) };
  });
  const tension = 0.2;

  return rawPoints.map((point, index, allPoints) => {
    const pathPoint: PathPoint = {
      x: Number(point.x.toFixed(3)),
      y: Number(point.y.toFixed(3)),
    };
    const previous = allPoints[index - 1];
    const next = allPoints[index + 1];

    if (!previous && next) {
      const tx = next.x - point.x;
      const ty = next.y - point.y;
      pathPoint.handle2 = {
        x: Number((point.x + tx * tension * 1.5).toFixed(3)),
        y: Number((point.y + ty * tension * 1.5).toFixed(3)),
      };
    } else if (!next && previous) {
      const tx = point.x - previous.x;
      const ty = point.y - previous.y;
      pathPoint.handle1 = {
        x: Number((point.x - tx * tension * 1.5).toFixed(3)),
        y: Number((point.y - ty * tension * 1.5).toFixed(3)),
      };
    } else if (previous && next) {
      const tx = next.x - previous.x;
      const ty = next.y - previous.y;
      pathPoint.handle1 = {
        x: Number((point.x - tx * tension).toFixed(3)),
        y: Number((point.y - ty * tension).toFixed(3)),
      };
      pathPoint.handle2 = {
        x: Number((point.x + tx * tension).toFixed(3)),
        y: Number((point.y + ty * tension).toFixed(3)),
      };
    }

    return pathPoint;
  });
};
