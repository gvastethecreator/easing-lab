import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useHistory } from '../hooks/useHistory';
import { AnimationPreview } from './AnimationPreview';
import { DraggableHandle } from './DraggableHandle';
import { GraphGrid } from './GraphGrid';
import { ScrubbableInput } from './ScrubbableInput';
import { EditorLayout } from './EditorLayout';
import { UndoIcon, RedoIcon, ResetIcon, MagnetIcon, TrashIcon, SparklesIcon } from './Icons';
import type { PathPoint, Point } from '../types';
import { CURVE_EDITOR_VIEWBOX_SIZE } from '../animationConfig';

const VIEW_BOX_SIZE = CURVE_EDITOR_VIEWBOX_SIZE;

const FLOAT_TOLERANCE = 0.001;

const isPointEqual = (
  left?: Point,
  right?: Point,
  tolerance: number = FLOAT_TOLERANCE
): boolean => {
  if (!left && !right) return true;
  if (!left || !right) return false;
  return Math.abs(left.x - right.x) <= tolerance && Math.abs(left.y - right.y) <= tolerance;
};

const arePathPointsEqual = (
  left: PathPoint[],
  right: PathPoint[],
  tolerance: number = FLOAT_TOLERANCE
): boolean => {
  if (left === right) return true;
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    const leftPoint = left[index];
    const rightPoint = right[index];
    if (!rightPoint) return false;
    if (
      !isPointEqual(leftPoint, rightPoint, tolerance) ||
      !isPointEqual(leftPoint.handle1, rightPoint.handle1, tolerance) ||
      !isPointEqual(leftPoint.handle2, rightPoint.handle2, tolerance)
    ) {
      return false;
    }
  }
  return true;
};

interface MultiPointCurveEditorProps {
  points: PathPoint[];
  setPoints: (points: PathPoint[]) => void;
  customEaseId: string;
  duration: number;
  setDuration: (d: number) => void;
  range: number;
  setRange: (r: number) => void;
  progressRef: React.MutableRefObject<{ progress: number }>;
}

export const MultiPointCurveEditor: React.FC<MultiPointCurveEditorProps> = ({
  points: propPoints,
  setPoints: setPropPoints,
  customEaseId,
  duration,
  setDuration,
  range,
  setRange,
  progressRef,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(false);

  // Internal history state
  const {
    state: points,
    set: setPointsInternal,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useHistory(propPoints);
  const isInteractingRef = useRef(false);

  // ---------------------------------------------------------------------------
  // SYNC LOGIC
  // ---------------------------------------------------------------------------

  // 1. Sync Props -> History
  useEffect(() => {
    if (!isInteractingRef.current) {
      if (!arePathPointsEqual(propPoints, points)) {
        reset(propPoints);
      }
    }
  }, [propPoints, reset, points]);

  // 2. Upward Sync helper
  const updateParent = useCallback(
    (newPoints: PathPoint[]) => {
      setPropPoints(newPoints);
    },
    [setPropPoints]
  );

  // Handle Undo/Redo (when history changes but no interaction active)
  useEffect(() => {
    if (!isInteractingRef.current) {
      updateParent(points);
    }
  }, [points, updateParent]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const startInteraction = () => {
    isInteractingRef.current = true;
  };
  const endInteraction = () => {
    isInteractingRef.current = false;
    setPointsInternal(points, true); // Commit history
    updateParent(points);
  };

  const handleSelectPoint = (index: number) => setSelectedPointIndex(index);

  const handleReset = () => {
    const newPoints = [
      { x: 0, y: 0, handle2: { x: 0.3, y: 0 } },
      { x: 1, y: 1, handle1: { x: 0.7, y: 1 } },
    ];
    setPointsInternal(newPoints, true);
    updateParent(newPoints);
    setSelectedPointIndex(null);
  };

  const handleSmoothAll = () => {
    const tension = 0.25;
    const newPoints = points.map((p, i, arr) => {
      const point = { ...p };
      const prev = arr[i - 1];
      const next = arr[i + 1];

      if (prev && next) {
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const d1 = Math.sqrt(Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2));
        const d2 = Math.sqrt(Math.pow(next.x - p.x, 2) + Math.pow(next.y - p.y, 2));

        const scale1 = (d1 / dist) * tension;
        const scale2 = (d2 / dist) * tension;

        point.handle1 = {
          x: parseFloat((p.x - dx * scale1).toFixed(3)),
          y: parseFloat((p.y - dy * scale1).toFixed(3)),
        };
        point.handle2 = {
          x: parseFloat((p.x + dx * scale2).toFixed(3)),
          y: parseFloat((p.y + dy * scale2).toFixed(3)),
        };
      } else if (i === 0 && next) {
        const tx = next.x - p.x;
        const ty = next.y - p.y;
        point.handle2 = {
          x: parseFloat((p.x + tx * tension).toFixed(3)),
          y: parseFloat((p.y + ty * tension).toFixed(3)),
        };
      } else if (i === arr.length - 1 && prev) {
        const tx = p.x - prev.x;
        const ty = p.y - prev.y;
        point.handle1 = {
          x: parseFloat((p.x - tx * tension).toFixed(3)),
          y: parseFloat((p.y - ty * tension).toFixed(3)),
        };
      }
      return point;
    });
    setPointsInternal(newPoints, true);
    updateParent(newPoints);
  };

  const handleRemovePoint = (indexToRemove: number) => {
    if (indexToRemove > 0 && indexToRemove < points.length - 1) {
      const newPoints = points.filter((_, index) => index !== indexToRemove);
      setPointsInternal(newPoints, true);
      updateParent(newPoints);
      if (selectedPointIndex === indexToRemove) setSelectedPointIndex(null);
      else if (selectedPointIndex !== null && selectedPointIndex > indexToRemove)
        setSelectedPointIndex(selectedPointIndex - 1);
    }
  };

  const addPoint = () => {
    let largestGapIndex = 0;
    let maxGap = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const gap = points[i + 1].x - points[i].x;
      if (gap > maxGap) {
        maxGap = gap;
        largestGapIndex = i;
      }
    }

    const p1 = points[largestGapIndex];
    const p2 = points[largestGapIndex + 1];

    const newPoint: PathPoint = {
      x: parseFloat((p1.x + (p2.x - p1.x) / 2).toFixed(3)),
      y: parseFloat((p1.y + (p2.y - p1.y) / 2).toFixed(3)),
    };

    const handleOffset = (p2.x - p1.x) / 6;
    newPoint.handle1 = { x: parseFloat((newPoint.x - handleOffset).toFixed(3)), y: newPoint.y };
    newPoint.handle2 = { x: parseFloat((newPoint.x + handleOffset).toFixed(3)), y: newPoint.y };

    const newPoints = [
      ...points.slice(0, largestGapIndex + 1),
      newPoint,
      ...points.slice(largestGapIndex + 1),
    ];
    setPointsInternal(newPoints, true);
    updateParent(newPoints);
    setSelectedPointIndex(largestGapIndex + 1);
  };

  const togglePointSmoothing = (index: number) => {
    const newPoints = [...points];
    const point = { ...newPoints[index] };

    if (point.handle1 || point.handle2) {
      delete point.handle1;
      delete point.handle2;
    } else {
      const prev = newPoints[index - 1] || { x: point.x - 0.1, y: point.y };
      const next = newPoints[index + 1] || { x: point.x + 0.1, y: point.y };
      const width = Math.min(Math.abs(point.x - prev.x), Math.abs(next.x - point.x)) * 0.35;

      point.handle1 = { x: parseFloat((point.x - width).toFixed(3)), y: point.y };
      point.handle2 = { x: parseFloat((point.x + width).toFixed(3)), y: point.y };
    }
    newPoints[index] = point;
    setPointsInternal(newPoints, true);
    updateParent(newPoints);
  };

  const updatePointCoordinate = (index: number, axis: 'x' | 'y', value: number) => {
    const newPoints = [...points];

    if (axis === 'x') {
      const prevX = index > 0 ? newPoints[index - 1].x : 0;
      const nextX = index < newPoints.length - 1 ? newPoints[index + 1].x : 1;

      if (index === 0) value = 0;
      else if (index === newPoints.length - 1) value = 1;
      else value = Math.max(prevX + 0.001, Math.min(nextX - 0.001, value));
    }

    const point = { ...newPoints[index], [axis]: value };

    if (axis === 'x' || axis === 'y') {
      const dx = value - newPoints[index][axis];
      if (axis === 'x') {
        if (point.handle1)
          point.handle1 = { ...point.handle1, x: parseFloat((point.handle1.x + dx).toFixed(3)) };
        if (point.handle2)
          point.handle2 = { ...point.handle2, x: parseFloat((point.handle2.x + dx).toFixed(3)) };
      } else {
        if (point.handle1)
          point.handle1 = { ...point.handle1, y: parseFloat((point.handle1.y + dx).toFixed(3)) };
        if (point.handle2)
          point.handle2 = { ...point.handle2, y: parseFloat((point.handle2.y + dx).toFixed(3)) };
      }
    }

    newPoints[index] = point;
    setPointsInternal(newPoints, true);
    updateParent(newPoints);
  };

  const handleDragAnchor = (index: number, draggedPoint: Point) => {
    const newPoints = [...points];

    const prevX = index > 0 ? newPoints[index - 1].x : 0;
    const nextX = index < newPoints.length - 1 ? newPoints[index + 1].x : 1;

    const constrainedX = Math.max(prevX + 0.001, Math.min(nextX - 0.001, draggedPoint.x));
    const finalX =
      index === 0 || index === points.length - 1 ? (index === 0 ? 0 : 1) : constrainedX;

    const dx = finalX - newPoints[index].x;
    const dy = draggedPoint.y - newPoints[index].y;

    const updatedPoint = { ...newPoints[index], x: finalX, y: draggedPoint.y };

    if (updatedPoint.handle1)
      updatedPoint.handle1 = {
        x: parseFloat((updatedPoint.handle1.x + dx).toFixed(3)),
        y: parseFloat((updatedPoint.handle1.y + dy).toFixed(3)),
      };
    if (updatedPoint.handle2)
      updatedPoint.handle2 = {
        x: parseFloat((updatedPoint.handle2.x + dx).toFixed(3)),
        y: parseFloat((updatedPoint.handle2.y + dy).toFixed(3)),
      };

    newPoints[index] = updatedPoint;
    setPointsInternal(newPoints, false);
    updateParent(newPoints);
    if (selectedPointIndex !== index) setSelectedPointIndex(index);
  };

  const handleDragHandle = (
    pointIndex: number,
    handleKey: 'handle1' | 'handle2',
    handlePos: Point
  ) => {
    const newPoints = [...points];
    const point = { ...newPoints[pointIndex] };
    point[handleKey] = handlePos;
    newPoints[pointIndex] = point;
    setPointsInternal(newPoints, false);
    updateParent(newPoints);
    if (selectedPointIndex !== pointIndex) setSelectedPointIndex(pointIndex);
  };

  const { pathData, easeCodeString } = useMemo(() => {
    if (!points || points.length === 0) return { pathData: '', easeCodeString: '' };

    const svgPathParts: string[] = [
      `M ${points[0].x * VIEW_BOX_SIZE},${VIEW_BOX_SIZE - points[0].y * VIEW_BOX_SIZE}`,
    ];
    const pathParts: string[] = [`M ${points[0].x.toFixed(3)},${points[0].y.toFixed(3)}`];

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      if (p1.handle2 && p2.handle1) {
        svgPathParts.push(
          `C ${p1.handle2.x * VIEW_BOX_SIZE},${VIEW_BOX_SIZE - p1.handle2.y * VIEW_BOX_SIZE} ${p2.handle1.x * VIEW_BOX_SIZE},${VIEW_BOX_SIZE - p2.handle1.y * VIEW_BOX_SIZE} ${p2.x * VIEW_BOX_SIZE},${VIEW_BOX_SIZE - p2.y * VIEW_BOX_SIZE}`
        );
        pathParts.push(
          `C ${p1.handle2.x.toFixed(3)},${p1.handle2.y.toFixed(3)} ${p2.handle1.x.toFixed(3)},${p2.handle1.y.toFixed(3)} ${p2.x.toFixed(3)},${p2.y.toFixed(3)}`
        );
      } else {
        svgPathParts.push(`L ${p2.x * VIEW_BOX_SIZE},${VIEW_BOX_SIZE - p2.y * VIEW_BOX_SIZE}`);
        pathParts.push(`L ${p2.x.toFixed(3)},${p2.y.toFixed(3)}`);
      }
    }
    return {
      pathData: svgPathParts.join(' '),
      easeCodeString: `CustomEase.create("${customEaseId}", "${pathParts.join(' ')}");`,
    };
  }, [points, customEaseId]);

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(easeCodeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const selectedPoint = selectedPointIndex !== null ? points[selectedPointIndex] : null;

  const toolbarActions = (
    <>
      <button
        onClick={handleSmoothAll}
        className="p-1.5 rounded-md hover:bg-surface-2 text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
        title="Smooth All Points"
      >
        <SparklesIcon />
      </button>
      <button
        onClick={handleReset}
        className="p-1.5 rounded-md hover:bg-surface-2 text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
        title="Reset to Linear"
      >
        <ResetIcon />
      </button>
      <div className="w-px h-5 bg-border-subtle mx-2 self-center"></div>
      <button
        onClick={() => setSnapEnabled(!snapEnabled)}
        className={`p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary ${snapEnabled ? 'bg-accent-primary text-white' : 'hover:bg-surface-2 text-text-secondary'}`}
        title="Toggle Snap to Grid"
      >
        <MagnetIcon />
      </button>
      <div className="w-px h-5 bg-border-subtle mx-2 self-center"></div>
      <button
        onClick={undo}
        disabled={!canUndo}
        className="p-1.5 rounded-md hover:bg-surface-2 disabled:opacity-30 text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
        aria-label="Undo"
      >
        <UndoIcon />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="p-1.5 rounded-md hover:bg-surface-2 disabled:opacity-30 text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
        aria-label="Redo"
      >
        <RedoIcon />
      </button>
      <div className="w-px h-5 bg-border-subtle mx-2 self-center"></div>
      <button
        onClick={addPoint}
        className="px-2 py-1.5 rounded-md hover:bg-surface-2 text-[10px] font-bold uppercase tracking-wide text-text-secondary transition-colors flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-accent-primary"
      >
        + Point
      </button>
    </>
  );

  const canvas = (
    <div
      className="relative aspect-square w-full max-w-70"
      onClick={(e) => {
        e.stopPropagation();
        setSelectedPointIndex(null);
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`-40 -80 ${VIEW_BOX_SIZE + 80} ${VIEW_BOX_SIZE + 160}`}
        className="overflow-visible w-full h-full touch-none"
      >
        <GraphGrid size={VIEW_BOX_SIZE} />

        {/* Path */}
        <path
          d={pathData}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-text-primary drop-shadow-md pointer-events-none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactions */}
        {points.map((p, i) => (
          <g key={`group-${i}`}>
            {p.handle1 && (
              <line
                x1={p.handle1.x * VIEW_BOX_SIZE}
                y1={VIEW_BOX_SIZE - p.handle1.y * VIEW_BOX_SIZE}
                x2={p.x * VIEW_BOX_SIZE}
                y2={VIEW_BOX_SIZE - p.y * VIEW_BOX_SIZE}
                className="stroke-accent-primary/50 stroke-1 pointer-events-none"
              />
            )}
            {p.handle2 && (
              <line
                x1={p.handle2.x * VIEW_BOX_SIZE}
                y1={VIEW_BOX_SIZE - p.handle2.y * VIEW_BOX_SIZE}
                x2={p.x * VIEW_BOX_SIZE}
                y2={VIEW_BOX_SIZE - p.y * VIEW_BOX_SIZE}
                className="stroke-accent-primary/50 stroke-1 pointer-events-none"
              />
            )}

            {p.handle1 && (
              <DraggableHandle
                point={p.handle1}
                onDrag={(np) => handleDragHandle(i, 'handle1', np)}
                onDragStart={startInteraction}
                onDragEnd={endInteraction}
                viewBoxSize={VIEW_BOX_SIZE}
                containerRef={svgRef}
                type="handle"
                isSelected={selectedPointIndex === i}
                snapToGrid={snapEnabled}
              />
            )}
            {p.handle2 && (
              <DraggableHandle
                point={p.handle2}
                onDrag={(np) => handleDragHandle(i, 'handle2', np)}
                onDragStart={startInteraction}
                onDragEnd={endInteraction}
                viewBoxSize={VIEW_BOX_SIZE}
                containerRef={svgRef}
                type="handle"
                isSelected={selectedPointIndex === i}
                snapToGrid={snapEnabled}
              />
            )}

            <DraggableHandle
              point={p}
              onDrag={(np) => handleDragAnchor(i, np)}
              onDragStart={startInteraction}
              onDragEnd={endInteraction}
              viewBoxSize={VIEW_BOX_SIZE}
              containerRef={svgRef}
              type="anchor"
              onDoubleClick={() => handleRemovePoint(i)}
              onSelect={() => handleSelectPoint(i)}
              isDraggable={true}
              isSelected={selectedPointIndex === i}
              snapToGrid={snapEnabled}
            />
          </g>
        ))}
      </svg>

      <div className="absolute top-2 right-2 bg-surface-1/80 backdrop-blur-sm border border-border-subtle px-2 py-1 rounded text-[9px] text-text-secondary shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 select-none">
        Double click to remove point
      </div>
    </div>
  );

  const controls = (
    <>
      {/* Selected Point Context Menu */}
      {selectedPoint && selectedPointIndex !== null && (
        <div className="px-5 py-3 bg-accent-primary/5 border-t border-b border-accent-primary/20 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-bold text-accent-primary uppercase tracking-wide">
              Point {selectedPointIndex + 1}
            </div>
            <div className="w-px h-4 bg-accent-primary/20"></div>
            <div className="flex gap-2 w-32">
              <ScrubbableInput
                label="X"
                value={selectedPoint.x}
                onChange={(v) => updatePointCoordinate(selectedPointIndex, 'x', v)}
                min={0}
                max={1}
              />
              <ScrubbableInput
                label="Y"
                value={selectedPoint.y}
                onChange={(v) => updatePointCoordinate(selectedPointIndex, 'y', v)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => togglePointSmoothing(selectedPointIndex)}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                selectedPoint.handle1 || selectedPoint.handle2
                  ? 'bg-accent-primary text-white'
                  : 'bg-surface-1 text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {selectedPoint.handle1 || selectedPoint.handle2 ? 'Smooth' : 'Linear'}
            </button>
            <button
              onClick={() => handleRemovePoint(selectedPointIndex)}
              disabled={selectedPointIndex === 0 || selectedPointIndex === points.length - 1}
              className="p-1.5 rounded bg-surface-1 text-text-secondary hover:text-red-500 disabled:opacity-30 border border-border-subtle transition-colors"
              title="Remove Point"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-6 pt-2">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase">
            <span>Duration</span>
            <span className="font-mono text-text-primary">{duration.toFixed(1)}s</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-surface-2 rounded-lg accent-accent-primary appearance-none cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase">
            <span>Scale</span>
            <span className="font-mono text-text-primary">{range}x</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={range}
            onChange={(e) => setRange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-surface-2 rounded-lg accent-accent-primary appearance-none cursor-pointer"
          />
        </div>
      </div>
    </>
  );

  return (
    <EditorLayout
      title="GSAP Custom"
      toolbarActions={toolbarActions}
      canvas={canvas}
      controls={controls}
      preview={
        <AnimationPreview
          ease={customEaseId}
          duration={duration}
          range={range}
          progressRef={progressRef}
        />
      }
      codeString={easeCodeString}
      onCopyCode={copyToClipboard}
      isCopied={copied}
    />
  );
};
