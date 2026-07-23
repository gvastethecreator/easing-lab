import React from 'react';
import { CurveEditor } from '../components/CurveEditor';
import { EasingPresetBrowser } from '../components/EasingPresetBrowser';
import type { AnimationEngine, Point } from '../types';

interface CubicBezierViewProps {
  p1: Point;
  setP1: React.Dispatch<React.SetStateAction<Point>>;
  p2: Point;
  setP2: React.Dispatch<React.SetStateAction<Point>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  range: number;
  setRange: React.Dispatch<React.SetStateAction<number>>;
  progressRef: React.MutableRefObject<{ progress: number }>;
  engine: AnimationEngine;
}

export const CubicBezierView: React.FC<CubicBezierViewProps> = ({
  p1,
  setP1,
  p2,
  setP2,
  duration,
  setDuration,
  range,
  setRange,
  progressRef,
  engine,
}) => {
  const selectCurve = (bezier: [number, number, number, number]) => {
    setP1({ x: bezier[0], y: bezier[1] });
    setP2({ x: bezier[2], y: bezier[3] });
    if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-28">
            <CurveEditor
              p1={p1}
              setP1={setP1}
              p2={p2}
              setP2={setP2}
              duration={duration}
              setDuration={setDuration}
              range={range}
              setRange={setRange}
              progressRef={progressRef}
              engine={engine}
            />
          </div>
        </aside>
        <section className="lg:col-span-2" aria-label="Easing presets">
          <EasingPresetBrowser p1={p1} p2={p2} onSelect={selectCurve} />
        </section>
      </div>
    </div>
  );
};
