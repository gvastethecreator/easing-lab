import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScrubbableInput } from "./ScrubbableInput";

const ScrubbableInputHost: React.FC<{
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChangeSpy?: (value: number) => void;
}> = ({ initialValue = 0.5, min = 0, max = 1, step = 0.01, onChangeSpy }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <ScrubbableInput
      value={value}
      label="X"
      min={min}
      max={max}
      step={step}
      onChange={(nextValue) => {
        onChangeSpy?.(nextValue);
        setValue(nextValue);
      }}
    />
  );
};

describe("ScrubbableInput", () => {
  it("arrastra y respeta clamp min/max", () => {
    const onChangeSpy = vi.fn();

    render(<ScrubbableInputHost onChangeSpy={onChangeSpy} />);

    const dragLabel = screen.getByTitle(/drag to change value/i);
    Object.defineProperties(dragLabel, {
      setPointerCapture: { value: vi.fn() },
      hasPointerCapture: { value: vi.fn(() => true) },
      releasePointerCapture: { value: vi.fn() },
    });

    fireEvent.pointerDown(dragLabel, { button: 0, clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(dragLabel, { clientX: 260, pointerId: 1 });
    fireEvent.pointerUp(dragLabel, { clientX: 260, pointerId: 1 });

    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy.mock.lastCall?.[0]).toBe(1);
    expect(document.body.style.cursor).toBe("");
    expect(document.body.style.userSelect).toBe("");
  });

  it("edición manual clampa el valor al perder foco", () => {
    render(<ScrubbableInputHost initialValue={0.2} min={0} max={1} />);

    const input = screen.getByRole("spinbutton");

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "5" } });
    fireEvent.blur(input);

    expect(input).toHaveValue(1);
  });

  it("ignora entrada no numérica durante onChange", () => {
    const onChangeSpy = vi.fn();

    render(<ScrubbableInputHost onChangeSpy={onChangeSpy} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "abc" } });

    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});
