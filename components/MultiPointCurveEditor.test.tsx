import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MultiPointCurveEditor } from "./MultiPointCurveEditor";
import type { PathPoint } from "../types";

vi.mock("./AnimationPreview", () => ({
  AnimationPreview: () => <div data-testid="animation-preview" />,
}));

const INITIAL_POINTS: PathPoint[] = [
  { x: 0, y: 0, handle2: { x: 0.3, y: 0 } },
  { x: 1, y: 1, handle1: { x: 0.7, y: 1 } },
];

const TestHost: React.FC<{ onPointsChange: (points: PathPoint[]) => void }> = ({
  onPointsChange,
}) => {
  const [points, setPoints] = useState<PathPoint[]>(INITIAL_POINTS);

  const handleSetPoints = (nextPoints: PathPoint[]) => {
    onPointsChange(nextPoints);
    setPoints(nextPoints);
  };

  return (
    <MultiPointCurveEditor
      points={points}
      setPoints={handleSetPoints}
      customEaseId="custom-gsap-ease"
      duration={1.5}
      setDuration={vi.fn()}
      range={1}
      setRange={vi.fn()}
      progressRef={{ current: { progress: 0 } }}
    />
  );
};

describe("MultiPointCurveEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("añade un punto nuevo en el mayor hueco disponible", () => {
    const onPointsChange = vi.fn();

    render(<TestHost onPointsChange={onPointsChange} />);

    onPointsChange.mockClear();
    fireEvent.click(screen.getByRole("button", { name: /\+ point/i }));

    const lastPoints = onPointsChange.mock.lastCall?.[0];
    expect(lastPoints).toHaveLength(3);
    expect(lastPoints[1]).toMatchObject({ x: 0.5, y: 0.5 });
  });

  it("permite seleccionar y eliminar un punto intermedio", () => {
    const onPointsChange = vi.fn();

    render(<TestHost onPointsChange={onPointsChange} />);

    fireEvent.click(screen.getByRole("button", { name: /\+ point/i }));
    onPointsChange.mockClear();

    const anchors = screen.getAllByRole("slider", { name: /anchor point/i });
    fireEvent.keyDown(anchors[1], { key: "Enter" });
    fireEvent.click(screen.getByTitle(/remove point/i));

    const lastPoints = onPointsChange.mock.lastCall?.[0];
    expect(lastPoints).toHaveLength(2);
  });
});
