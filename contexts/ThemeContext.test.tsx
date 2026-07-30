import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

const createStorageMock = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
};

const ThemeConsumer = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div>
      <span data-testid="theme-state">{isDarkMode ? "dark" : "light"}</span>
      <button type="button" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
};

describe("ThemeContext", () => {
  beforeEach(() => {
    const storage = createStorageMock();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: storage,
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: storage,
    });

    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("usa modo oscuro por defecto cuando no hay preferencia guardada", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme-state")).toHaveTextContent("dark");
      expect(document.documentElement).toHaveClass("dark");
      expect(window.localStorage.getItem("theme")).toBe("dark");
    });
  });

  it("respeta preferencia light guardada y permite alternar", async () => {
    window.localStorage.setItem("theme", "light");

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("theme-state")).toHaveTextContent("light");
      expect(document.documentElement).not.toHaveClass("dark");
      expect(window.localStorage.getItem("theme")).toBe("light");
    });

    fireEvent.click(screen.getByRole("button", { name: /toggle/i }));

    await waitFor(() => {
      expect(screen.getByTestId("theme-state")).toHaveTextContent("dark");
      expect(document.documentElement).toHaveClass("dark");
      expect(window.localStorage.getItem("theme")).toBe("dark");
    });
  });
});
