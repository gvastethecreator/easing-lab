import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EngineView } from './EngineView';
import type { AnimationEngine, Point } from '../types';

vi.mock('../components/CurveEditor', () => ({
  CurveEditor: ({ engine }: { engine: AnimationEngine }) => <div>{engine} curve editor</div>,
}));

vi.mock('../components/EasingPresetBrowser', () => ({
  EasingPresetBrowser: ({
    onSelect,
  }: {
    onSelect: (curve: [number, number, number, number]) => void;
  }) => (
    <button type="button" onClick={() => onSelect([0.1, 0.2, 0.3, 0.4])}>
      Curve cards
    </button>
  ),
}));

const renderEngine = (engine: 'motion' | 'animejs' | 'three') => {
  const setP1 = vi.fn();
  const setP2 = vi.fn();
  const point1: Point = { x: 0.25, y: 0.1 };
  const point2: Point = { x: 0.25, y: 1 };

  render(
    <EngineView
      engine={engine}
      p1={point1}
      setP1={setP1}
      p2={point2}
      setP2={setP2}
      duration={1.5}
      setDuration={vi.fn()}
      range={1}
      setRange={vi.fn()}
      progressRef={{ current: { progress: 0 } }}
    />
  );

  return { setP1, setP2 };
};

describe.each([
  ['motion', 'Motion'],
  ['animejs', 'Anime.js'],
  ['three', 'Three.js'],
] as const)('EngineView %s', (engine, label) => {
  it('muestra integración, código y cards de curvas', () => {
    const { setP1, setP2 } = renderEngine(engine);

    expect(screen.getByRole('heading', { name: label })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Official docs' })).toHaveAttribute('href');
    expect(screen.getByRole('button', { name: 'Curve cards' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Curve cards' }));
    expect(setP1).toHaveBeenCalledWith({ x: 0.1, y: 0.2 });
    expect(setP2).toHaveBeenCalledWith({ x: 0.3, y: 0.4 });
  });
});
