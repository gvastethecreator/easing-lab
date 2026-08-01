import React, { useRef } from "react";
import { useDraggable } from "../hooks/useDraggable";
import type { Point } from "../types";

interface DraggableHandleProps extends Omit<React.SVGProps<SVGCircleElement>, "onDrag"> {
  point: Point;
  onDrag: (p: Point) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  viewBoxSize: number;
  containerRef: React.RefObject<SVGSVGElement | null>;
  isDraggable?: boolean;
  type?: "anchor" | "handle";
  connectedTo?: Point;
  snapToGrid?: boolean;
}

export const DraggableHandle: React.FC<DraggableHandleProps> = ({
  point,
  onDrag,
  onDragStart,
  onDragEnd,
  onSelect,
  isSelected = false,
  viewBoxSize,
  containerRef,
  isDraggable = true,
  type = "anchor",
  connectedTo,
  snapToGrid = false,
  className = "",
  r,
  ...props
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const dragDidMove = useRef(false);
  const parsedRadius =
    typeof r === "number" ? r : typeof r === "string" ? Number.parseFloat(r) : Number.NaN;

  // The hook now returns coordinates in SVG User Space (e.g., 0 to 250)
  const { handleMouseDown, isDragging } = useDraggable({
    containerRef,
    onDrag: (svgPoint) => {
      dragDidMove.current = true;

      // Normalize from SVG Space (0 -> viewBoxSize) to Unit Space (0 -> 1)
      // Invert Y axis: Input 0 is Top, Output 0 is Bottom (Graph Math)
      let unitX = svgPoint.x / viewBoxSize;
      let unitY = 1 - svgPoint.y / viewBoxSize;

      // Snapping Logic
      if (snapToGrid) {
        unitX = Math.round(unitX * 10) / 10;
        unitY = Math.round(unitY * 10) / 10;
      }

      onDrag({ x: parseFloat(unitX.toFixed(3)), y: parseFloat(unitY.toFixed(3)) });
    },
    onDragStart: () => {
      dragDidMove.current = false;
      onDragStart?.();
    },
    onDragEnd: () => {
      if (!dragDidMove.current && onSelect) {
        onSelect();
      }
      onDragEnd?.();
    },
    disabled: !isDraggable,
  });

  // Calculate visual coordinates for rendering
  const cx = point.x * viewBoxSize;
  const cy = viewBoxSize - point.y * viewBoxSize;

  const baseRadius = Number.isFinite(parsedRadius) ? parsedRadius : type === "anchor" ? 6 : 4;
  const visualRadius = isDragging ? baseRadius * 1.5 : isSelected ? baseRadius * 1.25 : baseRadius;

  const defaultStyles =
    type === "anchor"
      ? "fill-surface-1 stroke-accent-primary stroke-2 focus:stroke-[3px] focus:fill-accent-primary-bg"
      : "fill-surface-1 stroke-text-secondary stroke-2 focus:stroke-accent-primary focus:stroke-[3px]";

  const selectedStyles = isSelected ? "stroke-[3px] fill-accent-primary-bg shadow-sm" : "";

  const cursorClass = isDraggable
    ? isDragging
      ? "cursor-grabbing"
      : "cursor-grab hover:scale-110"
    : "cursor-not-allowed opacity-50";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDraggable) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.();
      return;
    }

    const step = e.shiftKey ? 0.1 : 0.01;
    let newX = point.x;
    let newY = point.y;
    let changed = false;

    switch (e.key) {
      case "ArrowUp":
        newY = point.y + step;
        changed = true;
        break;
      case "ArrowDown":
        newY = point.y - step;
        changed = true;
        break;
      case "ArrowRight":
        newX = point.x + step;
        changed = true;
        break;
      case "ArrowLeft":
        newX = point.x - step;
        changed = true;
        break;
    }

    if (changed) {
      e.preventDefault();
      e.stopPropagation();
      if (snapToGrid) {
        newX = Math.round(newX * 10) / 10;
        newY = Math.round(newY * 10) / 10;
      }
      onDrag({ x: parseFloat(newX.toFixed(3)), y: parseFloat(newY.toFixed(3)) });
    }
  };

  return (
    <g className="group/handle">
      {type === "handle" && connectedTo && (
        <line
          x1={cx}
          y1={cy}
          x2={connectedTo.x * viewBoxSize}
          y2={viewBoxSize - connectedTo.y * viewBoxSize}
          className={`stroke-1 stroke-dashed pointer-events-none transition-opacity duration-200 ${isSelected ? "stroke-accent-primary opacity-100" : "stroke-text-placeholder opacity-50"}`}
        />
      )}

      {/* Halo effect for selection */}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={baseRadius * 2.2}
          fill="transparent"
          className="stroke-accent-primary/30 stroke-2 animate-pulse pointer-events-none"
        />
      )}

      {/* Larger invisible hit area for easier grabbing */}
      <circle
        cx={cx}
        cy={cy}
        r={Math.max(baseRadius * 3, 20)} // Ensure minimum 40x40px touch target
        fill="transparent"
        className={isDraggable ? "cursor-grab active:cursor-grabbing touch-none" : ""}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      />

      {/* Visual Circle */}
      <circle
        ref={circleRef}
        cx={cx}
        cy={cy}
        r={visualRadius}
        tabIndex={isDraggable ? 0 : -1}
        role="slider"
        aria-label={`${type === "anchor" ? "Anchor Point" : "Control Handle"} at ${point.x.toFixed(2)}, ${point.y.toFixed(2)}`}
        aria-valuenow={point.y * 100}
        onKeyDown={handleKeyDown}
        className={`transition-all duration-200 outline-none ${defaultStyles} ${selectedStyles} ${cursorClass} ${className}`}
        style={{
          filter: isDragging ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
        {...props}
      />
    </g>
  );
};
