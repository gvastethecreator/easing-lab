export function renderWithStartupMetrics(render: () => void): void {
  const hasPerformanceApi = typeof performance !== "undefined";

  if (hasPerformanceApi) {
    performance.mark("easing-lab:startup:start");
  }

  render();

  if (hasPerformanceApi) {
    performance.mark("easing-lab:startup:end");
    performance.measure(
      "easing-lab:startup:render",
      "easing-lab:startup:start",
      "easing-lab:startup:end",
    );
  }
}
