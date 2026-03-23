import { describe, expect, it } from 'vitest';
import { areBezierCoordsEqual, arePathPointsEqual, isPointEqual } from './equality';

describe('equality utils', () => {
  it('compara puntos con tolerancia', () => {
    expect(isPointEqual({ x: 0.5, y: 0.5 }, { x: 0.5004, y: 0.4997 })).toBe(true);
    expect(isPointEqual({ x: 0.5, y: 0.5 }, { x: 0.51, y: 0.5 })).toBe(false);
  });

  it('compara coordenadas bezier compuestas', () => {
    expect(
      areBezierCoordsEqual(
        { p1: { x: 0.2, y: 0.3 }, p2: { x: 0.8, y: 0.9 } },
        { p1: { x: 0.2005, y: 0.2996 }, p2: { x: 0.8, y: 0.9 } }
      )
    ).toBe(true);
  });

  it('detecta diferencias en handles y puntos de trayecto', () => {
    const left = [
      { x: 0, y: 0, handle2: { x: 0.25, y: 0 } },
      { x: 1, y: 1, handle1: { x: 0.75, y: 1 } },
    ];
    const right = [
      { x: 0, y: 0, handle2: { x: 0.25, y: 0 } },
      { x: 1, y: 1, handle1: { x: 0.7, y: 1 } },
    ];

    expect(arePathPointsEqual(left, left)).toBe(true);
    expect(arePathPointsEqual(left, right)).toBe(false);
  });
});
