import type { PathPoint, Point } from '../types';

export const FLOAT_TOLERANCE = 0.001;

export interface BezierCoords {
  p1: Point;
  p2: Point;
}

export function isPointEqual(
  left?: Point,
  right?: Point,
  tolerance: number = FLOAT_TOLERANCE
): boolean {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return Math.abs(left.x - right.x) <= tolerance && Math.abs(left.y - right.y) <= tolerance;
}

export function areBezierCoordsEqual(
  left: BezierCoords,
  right: BezierCoords,
  tolerance: number = FLOAT_TOLERANCE
): boolean {
  return isPointEqual(left.p1, right.p1, tolerance) && isPointEqual(left.p2, right.p2, tolerance);
}

export function arePathPointsEqual(
  left: PathPoint[],
  right: PathPoint[],
  tolerance: number = FLOAT_TOLERANCE
): boolean {
  if (left === right) {
    return true;
  }

  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    const leftPoint = left[index];
    const rightPoint = right[index];

    if (!rightPoint) {
      return false;
    }

    if (
      !isPointEqual(leftPoint, rightPoint, tolerance) ||
      !isPointEqual(leftPoint.handle1, rightPoint.handle1, tolerance) ||
      !isPointEqual(leftPoint.handle2, rightPoint.handle2, tolerance)
    ) {
      return false;
    }
  }

  return true;
}
