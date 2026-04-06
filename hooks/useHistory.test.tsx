import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useHistory } from "./useHistory";

describe("useHistory", () => {
  it("registra cambios confirmados y permite undo/redo", () => {
    const { result } = renderHook(() => useHistory({ value: 1 }));

    act(() => {
      result.current.set({ value: 2 });
      result.current.set({ value: 3 });
    });

    expect(result.current.state).toEqual({ value: 3 });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    act(() => {
      result.current.undo();
    });

    expect(result.current.state).toEqual({ value: 2 });
    expect(result.current.canRedo).toBe(true);

    act(() => {
      result.current.redo();
    });

    expect(result.current.state).toEqual({ value: 3 });
  });

  it("no agrega historial en cambios transitorios", () => {
    const { result } = renderHook(() => useHistory({ value: 1 }));

    act(() => {
      result.current.set({ value: 2 }, false);
    });

    expect(result.current.state).toEqual({ value: 2 });
    expect(result.current.historyState.past).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it("ignora estados equivalentes y respeta el límite de historial", () => {
    const { result } = renderHook(() => useHistory({ value: 0 }, 2));

    act(() => {
      result.current.set({ value: 0 });
      result.current.set({ value: 1 });
      result.current.set({ value: 2 });
      result.current.set({ value: 3 });
    });

    expect(result.current.historyState.past).toEqual([{ value: 1 }, { value: 2 }]);
    expect(result.current.state).toEqual({ value: 3 });
  });
});
