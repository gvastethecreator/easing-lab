import React, { useRef, useEffect, useState, useMemo, useCallback, useId } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { AnimationPreview } from './AnimationPreview';
import { DraggableHandle } from './DraggableHandle';
import { GraphGrid } from './GraphGrid';
import { ScrubbableInput } from './ScrubbableInput';
import { useHistory } from '../hooks/useHistory';
import { EditorLayout } from './EditorLayout';
import { UndoIcon, RedoIcon, ResetIcon, MagnetIcon } from './Icons';
import type { AnimationEngine, Point } from '../types';
import { CURVE_EDITOR_VIEWBOX_SIZE } from '../animationConfig';

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

const areBezierCoordsEqual = (
  left: { p1: Point; p2: Point },
  right: { p1: Point; p2: Point },
  tolerance: number = FLOAT_TOLERANCE
): boolean =>
  isPointEqual(left.p1, right.p1, tolerance) && isPointEqual(left.p2, right.p2, tolerance);

interface CurveEditorProps {
  p1: Point;
  setP1: (p: Point) => void;
  p2: Point;
  setP2: (p: Point) => void;
  duration: number;
  setDuration: (d: number) => void;
  range: number;
  setRange: (r: number) => void;
  progressRef: React.MutableRefObject<{ progress: number }>;
  engine: AnimationEngine;
}

export const CurveEditor: React.FC<CurveEditorProps> = ({
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
  const editorId = useId().replaceAll(':', '');
  const isInteractingRef = useRef(false);
  const viewBoxSize = CURVE_EDITOR_VIEWBOX_SIZE;
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);

  const [snapEnabled, setSnapEnabled] = useState(false);
  const [copied, setCopied] = useState(false);

  // Combine P1 and P2 into a single history state object
  const initialState = useMemo(() => ({ p1, p2 }), []);
  const {
    state: coords,
    set: setCoords,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useHistory(initialState);

  // State for Ghost Trace (comparison while dragging)
  const [dragStartCoords, setDragStartCoords] = useState<{ p1: Point; p2: Point } | null>(null);

  // ---------------------------------------------------------------------------
  // SYNC LOGIC (The Fix)
  // ---------------------------------------------------------------------------

  // 1. Downward Sync: Props (Parent) -> History (Child)
  // Only update internal history if props change externally and we are NOT interacting.
  useEffect(() => {
    if (!isInteractingRef.current) {
      if (!areBezierCoordsEqual({ p1, p2 }, coords)) {
        reset({ p1, p2 });
      }
    }
  }, [p1, p2, reset, coords]);

  // 2. Upward Sync: Explicit update function
  // Instead of a useEffect causing a loop, we call this whenever we change internal state via UI
  const updateParent = useCallback(
    (newCoords: { p1: Point; p2: Point }) => {
      setP1(newCoords.p1);
      setP2(newCoords.p2);
    },
    [setP1, setP2]
  );

  // When UNDO/REDO happens, we must sync to parent
  // We detect this by checking if coords changed BUT we are not interacting
  useEffect(() => {
    if (!isInteractingRef.current) {
      updateParent(coords);
    }
  }, [coords, updateParent]);

  // ---------------------------------------------------------------------------
  // ANIMATION SYNC
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const marker = markerRef.current;
    const path = pathRef.current;
    if (!marker || !path) return;

    const onTick = () => {
      // Guard against unmounted or invalid paths
      if (!path.isConnected || !path.getTotalLength) return;

      try {
        const rawPath = MotionPathPlugin.getRawPath(path);
        if (rawPath) {
          const pointOnPath = MotionPathPlugin.getPositionOnPath(
            rawPath,
            progressRef.current.progress
          );
          gsap.set(marker, { x: pointOnPath.x, y: pointOnPath.y });
        }
      } catch {
        // Silent catch
      }
    };

    gsap.ticker.add(onTick);
    return () => {
      gsap.ticker.remove(onTick);
    };
  }, [progressRef, coords]); // Re-bind if coords change structure (unlikely but safe)

  // ---------------------------------------------------------------------------
  // INTERACTION HANDLERS
  // ---------------------------------------------------------------------------

  const startInteraction = () => {
    isInteractingRef.current = true;
    setDragStartCoords(coords);
  };

  const endInteraction = () => {
    isInteractingRef.current = false;
    setDragStartCoords(null);
    setCoords(coords, true); // Commit to history
    updateParent(coords); // Ensure parent is perfectly synced at end
  };

  const handleP1Drag = (newPoint: Point) => {
    const newCoords = { ...coords, p1: newPoint };
    setCoords(newCoords, false); // Transient update (no history commit yet)
    updateParent(newCoords); // Live update parent
  };

  const handleP2Drag = (newPoint: Point) => {
    const newCoords = { ...coords, p2: newPoint };
    setCoords(newCoords, false);
    updateParent(newCoords);
  };

  const updateCoordinate = (key: 'p1' | 'p2', axis: 'x' | 'y', value: number) => {
    const newPoint = { ...coords[key], [axis]: value };
    const newCoords = { ...coords, [key]: newPoint };
    setCoords(newCoords, true); // Commit immediately for inputs
    updateParent(newCoords);
  };

  const applyPreset = (type: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut') => {
    let newState = { p1: { x: 0, y: 0 }, p2: { x: 1, y: 1 } };
    switch (type) {
      case 'linear':
        newState = { p1: { x: 0, y: 0 }, p2: { x: 1, y: 1 } };
        break;
      case 'easeIn':
        newState = { p1: { x: 0.42, y: 0 }, p2: { x: 1, y: 1 } };
        break;
      case 'easeOut':
        newState = { p1: { x: 0, y: 0 }, p2: { x: 0.58, y: 1 } };
        break;
      case 'easeInOut':
        newState = { p1: { x: 0.42, y: 0 }, p2: { x: 0.58, y: 1 } };
        break;
    }
    setCoords(newState, true);
    updateParent(newState);
  };

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(bezierString);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const bezierString = `cubic-bezier(${coords.p1.x.toFixed(2)}, ${coords.p1.y.toFixed(2)}, ${coords.p2.x.toFixed(2)}, ${coords.p2.y.toFixed(2)})`;

  const start = { x: 0, y: viewBoxSize };
  const end = { x: viewBoxSize, y: 0 };
  const cp1 = { x: coords.p1.x * viewBoxSize, y: viewBoxSize - coords.p1.y * viewBoxSize };
  const cp2 = { x: coords.p2.x * viewBoxSize, y: viewBoxSize - coords.p2.y * viewBoxSize };
  const pathData = `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;

  // Ghost Path Calculation
  let ghostPathData = null;
  if (dragStartCoords) {
    const gCp1 = {
      x: dragStartCoords.p1.x * viewBoxSize,
      y: viewBoxSize - dragStartCoords.p1.y * viewBoxSize,
    };
    const gCp2 = {
      x: dragStartCoords.p2.x * viewBoxSize,
      y: viewBoxSize - dragStartCoords.p2.y * viewBoxSize,
    };
    ghostPathData = `M ${start.x} ${start.y} C ${gCp1.x} ${gCp1.y}, ${gCp2.x} ${gCp2.y}, ${end.x} ${end.y}`;
  }

  const toolbarActions = (
    <>
      <button
        type="button"
        onClick={() => setSnapEnabled(!snapEnabled)}
        className={`p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary ${snapEnabled ? 'bg-accent-primary text-white' : 'hover:bg-surface-2 text-text-secondary'}`}
        title="Toggle Snap to Grid"
      >
        <MagnetIcon />
      </button>
      <div className="w-px h-5 bg-border-subtle mx-2 self-center"></div>
      <button
        type="button"
        onClick={undo}
        disabled={!canUndo}
        className="p-1.5 rounded-md hover:bg-surface-2 disabled:opacity-30 text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
        aria-label="Undo"
      >
        <UndoIcon />
      </button>
      <button
        type="button"
        onClick={redo}
        disabled={!canRedo}
        className="p-1.5 rounded-md hover:bg-surface-2 disabled:opacity-30 text-text-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
        aria-label="Redo"
      >
        <RedoIcon />
      </button>
      <div className="w-px h-5 bg-border-subtle mx-2 self-center"></div>
      <button
        type="button"
        onClick={() => applyPreset('linear')}
        className="p-1.5 rounded-md hover:bg-surface-2 text-text-secondary transition-colors"
        title="Reset to Linear"
      >
        <ResetIcon />
      </button>
    </>
  );

  const canvas = (
    <div className="relative aspect-square w-full max-w-70">
      <svg
        ref={svgRef}
        viewBox={`-40 -80 ${viewBoxSize + 80} ${viewBoxSize + 160}`}
        className="overflow-visible w-full h-full touch-none"
      >
        <GraphGrid size={viewBoxSize} />

        {/* Ghost Trace (Original Curve before Drag) */}
        {ghostPathData && (
          <path
            d={ghostPathData}
            stroke="var(--text-placeholder)"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
            className="pointer-events-none opacity-50"
          />
        )}

        {/* Connecting Lines */}
        <line
          x1={0}
          y1={viewBoxSize}
          x2={cp1.x}
          y2={cp1.y}
          stroke="var(--accent-primary)"
          strokeWidth="2"
          strokeDasharray="4"
          opacity="0.4"
          className="pointer-events-none"
        />
        <line
          x1={viewBoxSize}
          y1={0}
          x2={cp2.x}
          y2={cp2.y}
          stroke="var(--accent-primary)"
          strokeWidth="2"
          strokeDasharray="4"
          opacity="0.4"
          className="pointer-events-none"
        />

        {/* Curve */}
        <path
          ref={pathRef}
          d={pathData}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-text-primary drop-shadow-md pointer-events-none"
          strokeLinecap="round"
        />

        {/* Marker */}
        <circle
          ref={markerRef}
          r="8"
          fill="var(--accent-primary)"
          stroke="white"
          strokeWidth="2"
          className="shadow-sm pointer-events-none"
        />

        {/* Handles */}
        <DraggableHandle
          point={coords.p1}
          onDrag={handleP1Drag}
          onDragStart={startInteraction}
          onDragEnd={endInteraction}
          viewBoxSize={viewBoxSize}
          containerRef={svgRef}
          type="handle"
          snapToGrid={snapEnabled}
          connectedTo={{ x: 0, y: 0 }}
        />
        <DraggableHandle
          point={coords.p2}
          onDrag={handleP2Drag}
          onDragStart={startInteraction}
          onDragEnd={endInteraction}
          viewBoxSize={viewBoxSize}
          containerRef={svgRef}
          type="handle"
          snapToGrid={snapEnabled}
          connectedTo={{ x: 1, y: 1 }}
        />

        {/* Fixed Anchors */}
        <circle cx={0} cy={viewBoxSize} r="5" className="fill-text-secondary pointer-events-none" />
        <circle cx={viewBoxSize} cy={0} r="5" className="fill-text-secondary pointer-events-none" />
      </svg>
    </div>
  );

  const controls = (
    <>
      <div className="grid grid-cols-2 gap-6">
        {(['p1', 'p2'] as const).map((key) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              <span>{key === 'p1' ? 'Start Control' : 'End Control'}</span>
            </div>
            <div className="flex gap-2">
              <ScrubbableInput
                label="X"
                ariaLabel={`${key === 'p1' ? 'Start' : 'End'} control X`}
                value={coords[key].x}
                onChange={(v) => updateCoordinate(key, 'x', v)}
                min={0}
                max={1}
              />
              <ScrubbableInput
                label="Y"
                ariaLabel={`${key === 'p1' ? 'Start' : 'End'} control Y`}
                value={coords[key].y}
                onChange={(v) => updateCoordinate(key, 'y', v)}
                min={-2}
                max={2}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-center">
        {(['linear', 'easeIn', 'easeOut', 'easeInOut'] as const).map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => applyPreset(p)}
            className="px-2 py-1 rounded bg-surface-2 hover:bg-surface-hover text-[10px] text-text-secondary font-medium uppercase tracking-wide transition-colors focus:ring-2 focus:ring-accent-primary focus:outline-none"
          >
            {p.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>

      <div className="flex gap-6 pt-4 border-t border-border-subtle">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase">
            <span>Duration</span>
            <span className="font-mono text-text-primary">{duration}s</span>
          </div>
          <input
            id={`${editorId}-duration`}
            name="duration"
            aria-label="Animation duration"
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-accent-primary hover:accent-accent-primary-hover"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase">
            <span>Scale</span>
            <span className="font-mono text-text-primary">{range}x</span>
          </div>
          <input
            id={`${editorId}-scale`}
            name="preview-scale"
            aria-label="Preview scale"
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={range}
            onChange={(e) => setRange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-accent-primary hover:accent-accent-primary-hover"
          />
        </div>
      </div>
    </>
  );

  return (
    <EditorLayout
      title="Cubic Bezier"
      toolbarActions={toolbarActions}
      canvas={canvas}
      controls={controls}
      preview={
        <AnimationPreview
          ease={bezierString}
          duration={duration}
          range={range}
          progressRef={progressRef}
          engine={engine}
        />
      }
      codeString={bezierString}
      onCopyCode={copyToClipboard}
      isCopied={copied}
    />
  );
};
