import React from "react";
import type { Point } from "../types";

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
}) => {
  const resetPreview = () => {
    setP1({ x: 0.25, y: 0.1 });
    setP2({ x: 0.25, y: 1 });
    setDuration(1.2);
    setRange(1);
    progressRef.current.progress = 0;
  };

  return (
    <section className="rounded-xl border border-zinc-700/60 bg-zinc-900/30 p-4 text-zinc-200">
      <h2 className="mb-2 text-sm font-semibold">Cubic Bézier (modo básico)</h2>
      <p className="mb-3 text-xs text-zinc-400">
        Vista temporal para mantener el build estable mientras se restauran los módulos de editor.
      </p>
      <div className="space-y-1 text-xs text-zinc-300">
        <div>
          p1: ({p1.x.toFixed(2)}, {p1.y.toFixed(2)})
        </div>
        <div>
          p2: ({p2.x.toFixed(2)}, {p2.y.toFixed(2)})
        </div>
        <div>duration: {duration.toFixed(2)}s</div>
        <div>range: {range.toFixed(2)}</div>
      </div>
      <button
        type="button"
        className="mt-3 rounded-lg border border-zinc-600 px-3 py-1.5 text-xs hover:bg-zinc-800"
        onClick={resetPreview}
      >
        Reset preview
      </button>
    </section>
  );
};
