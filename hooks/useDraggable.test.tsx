import { act, renderHook } from "@testing-library/react";
import type { RefObject } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { installMockSvgGeometry } from "../test-utils/mockSvgGeometry";
import { useDraggable } from "./useDraggable";

describe("useDraggable", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("convierte mousemove en coordenadas SVG durante un drag", () => {
    const listeners = new Map<string, EventListenerOrEventListenerObject>();

    vi.spyOn(window, "addEventListener").mockImplementation((type, listener) => {
      listeners.set(type, listener);
    });

    vi.spyOn(window, "removeEventListener").mockImplementation((type) => {
      listeners.delete(type);
    });

    const onDrag = vi.fn();
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    installMockSvgGeometry(svg);

    const containerRef: RefObject<SVGSVGElement | null> = { current: svg };

    const { result } = renderHook(() =>
      useDraggable({
        containerRef,
        onDrag,
        onDragStart,
        onDragEnd,
      }),
    );

    act(() => {
      result.current.handleMouseDown({
        button: 0,
        clientX: 10,
        clientY: 20,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      });
    });

    const mouseMoveListener = listeners.get("mousemove");
    if (typeof mouseMoveListener === "function") {
      act(() => {
        mouseMoveListener(new MouseEvent("mousemove", { clientX: 125, clientY: 75 }));
      });
    }

    const mouseUpListener = listeners.get("mouseup");
    if (typeof mouseUpListener === "function") {
      act(() => {
        mouseUpListener(new MouseEvent("mouseup"));
      });
    }

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDrag).toHaveBeenLastCalledWith({ x: 125, y: 75 });
    expect(onDragEnd).toHaveBeenCalledTimes(1);
  });
});
