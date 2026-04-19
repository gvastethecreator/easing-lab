import React from "react";
import type { PathPoint } from "../types";

interface GSAPViewProps {
  customEaseId: string;
  points: PathPoint[];
  setPoints: React.Dispatch<React.SetStateAction<PathPoint[]>>;
  progressRef: React.MutableRefObject<{ progress: number }>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  range: number;
  setRange: React.Dispatch<React.SetStateAction<number>>;
}

export const GSAPView: React.FC<GSAPViewProps> = ({
  customEaseId,
  points,
  setPoints,
  progressRef,
  duration,
  setDuration,
  range,
  setRange,
}) => {
  const addPoint = () => {
    setPoints((prev) => [...prev, { x: 1, y: 1 }]);
    progressRef.current.progress = 0;
  };

  return (
    <section className="rounded-xl border border-zinc-700/60 bg-zinc-900/30 p-4 text-zinc-200">
      <h2 className="mb-2 text-sm font-semibold">GSAP (modo básico)</h2>
      <p className="mb-3 text-xs text-zinc-400">customEaseId: {customEaseId}</p>
      <div className="space-y-1 text-xs text-zinc-300">
        <div>points: {points.length}</div>
        <div>duration: {duration.toFixed(2)}s</div>
        <div>range: {range.toFixed(2)}</div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs hover:bg-zinc-800"
          onClick={addPoint}
        >
          Add point
        </button>
        <button
          type="button"
          className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs hover:bg-zinc-800"
          onClick={() => {
            setDuration(1);
            setRange(1);
            progressRef.current.progress = 0;
          }}
        >
          Reset timing
        </button>
      </div>
    </section>
  );
};
