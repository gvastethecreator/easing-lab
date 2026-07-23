import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CurveEditor } from './CurveEditor';
import type { Point } from '../types';

const { gsapSetMock, gsapTickerAddMock, gsapTickerRemoveMock } = vi.hoisted(() => ({
  gsapSetMock: vi.fn(),
  gsapTickerAddMock: vi.fn(),
  gsapTickerRemoveMock: vi.fn(),
}));

vi.mock('./AnimationPreview', () => ({
  AnimationPreview: () => <div data-testid="animation-preview" />,
}));

vi.mock('gsap', () => ({
  gsap: {
    set: gsapSetMock,
    ticker: {
      add: gsapTickerAddMock,
      remove: gsapTickerRemoveMock,
    },
  },
}));

vi.mock('gsap/MotionPathPlugin', () => ({
  MotionPathPlugin: {
    getRawPath: vi.fn(() => []),
    getPositionOnPath: vi.fn(() => ({ x: 0, y: 0 })),
  },
}));

const TestHost: React.FC<{
  onP1Change: (point: Point) => void;
  onP2Change: (point: Point) => void;
}> = ({ onP1Change, onP2Change }) => {
  const [p1, setP1] = useState<Point>({ x: 0.25, y: 0.25 });
  const [p2, setP2] = useState<Point>({ x: 0.75, y: 0.75 });

  const handleSetP1 = (point: Point) => {
    onP1Change(point);
    setP1(point);
  };

  const handleSetP2 = (point: Point) => {
    onP2Change(point);
    setP2(point);
  };

  return (
    <CurveEditor
      p1={p1}
      setP1={handleSetP1}
      p2={p2}
      setP2={handleSetP2}
      duration={1.5}
      setDuration={vi.fn()}
      range={1}
      setRange={vi.fn()}
      progressRef={{ current: { progress: 0 } }}
      engine="gsap"
    />
  );
};

describe('CurveEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aplica presets y sincroniza el estado con el padre', () => {
    const onP1Change = vi.fn();
    const onP2Change = vi.fn();

    render(<TestHost onP1Change={onP1Change} onP2Change={onP2Change} />);

    onP1Change.mockClear();
    onP2Change.mockClear();

    fireEvent.click(screen.getByRole('button', { name: /ease out/i }));

    expect(onP1Change).toHaveBeenLastCalledWith({ x: 0, y: 0 });
    expect(onP2Change).toHaveBeenLastCalledWith({ x: 0.58, y: 1 });
  });
  it('permite ajustar un handle con teclado', () => {
    const onP1Change = vi.fn();
    const onP2Change = vi.fn();

    render(<TestHost onP1Change={onP1Change} onP2Change={onP2Change} />);

    onP1Change.mockClear();

    const handles = screen.getAllByRole('slider', { name: /control handle/i });
    fireEvent.keyDown(handles[0], { key: 'ArrowRight' });

    expect(onP1Change).toHaveBeenCalled();
    expect(onP1Change.mock.lastCall?.[0]).toMatchObject({ x: 0.26, y: 0.25 });
  });
});
