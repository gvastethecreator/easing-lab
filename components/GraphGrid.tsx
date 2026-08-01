import React, { useMemo } from "react";

interface GraphGridProps {
  size: number;
  subdivisions?: number;
  showFineGrid?: boolean;
  showMidLines?: boolean;
  opacity?: number;
}

export const GraphGrid: React.FC<GraphGridProps> = ({
  size,
  subdivisions = 10,
  showFineGrid = true,
  showMidLines = true,
  opacity = 0.5,
}) => {
  // Memoize grid lines to prevent recalculation on every render
  const gridLines = useMemo(() => {
    return Array.from({ length: subdivisions - 1 }).map((_, i) => {
      const pos = (i + 1) * (size / subdivisions);
      return (
        <React.Fragment key={i}>
          <line
            x1={pos}
            y1={0}
            x2={pos}
            y2={size}
            stroke="var(--border-subtle)"
            strokeWidth="0.5"
            opacity="0.5"
          />
          <line
            x1={0}
            y1={pos}
            x2={size}
            y2={pos}
            stroke="var(--border-subtle)"
            strokeWidth="0.5"
            opacity="0.5"
          />
        </React.Fragment>
      );
    });
  }, [size, subdivisions]);

  return (
    <g className="pointer-events-none select-none" style={{ opacity }}>
      {/* Background */}
      <rect x="0" y="0" width={size} height={size} fill="var(--surface-base)" />

      {/* Fine Grid */}
      {showFineGrid && gridLines}

      {/* Mid Lines (Quarter markers for better reference) */}
      {showMidLines && (
        <>
          <line
            x1={size / 2}
            y1={0}
            x2={size / 2}
            y2={size}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          <line
            x1={0}
            y1={size / 2}
            x2={size}
            y2={size / 2}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
        </>
      )}

      {/* Border */}
      <rect
        x="0"
        y="0"
        width={size}
        height={size}
        fill="none"
        stroke="var(--border-subtle)"
        strokeWidth="1"
      />

      {/* Diagonal reference (optional, keeps UI clean if omitted, but good for linear ref) */}
      <line
        x1={0}
        y1={size}
        x2={size}
        y2={0}
        stroke="var(--border-subtle)"
        strokeWidth="0.5"
        strokeDasharray="4"
        opacity="0.3"
      />
    </g>
  );
};
