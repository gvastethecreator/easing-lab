export interface StartupMetrics {
  firstFrameMs: number;
  domContentLoadedMs: number | null;
  loadEventMs: number | null;
  firstPaintMs: number | null;
  firstContentfulPaintMs: number | null;
}

declare global {
  interface Window {
    __EASING_LAB_STARTUP_METRICS__?: StartupMetrics;
  }
}

const roundMetric = (value: number | null | undefined): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return Number(value.toFixed(2));
};

const getPaintMetric = (name: string): number | null => {
  const entry = performance.getEntriesByType('paint').find((item) => item.name === name);

  return roundMetric(entry?.startTime);
};

const isNavigationTiming = (entry: PerformanceEntry): entry is PerformanceNavigationTiming =>
  'domContentLoadedEventEnd' in entry && 'loadEventEnd' in entry;

/**
 * Ejecuta el render de la app y publica métricas ligeras de arranque en
 * `window.__EASING_LAB_STARTUP_METRICS__` tras el segundo frame.
 */
export const renderWithStartupMetrics = (renderApp: () => void) => {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    renderApp();
    return;
  }

  const renderStart = performance.now();
  renderApp();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const navigationEntry = performance.getEntriesByType('navigation').find(isNavigationTiming);

      const metrics: StartupMetrics = {
        firstFrameMs: Number((performance.now() - renderStart).toFixed(2)),
        domContentLoadedMs: roundMetric(navigationEntry?.domContentLoadedEventEnd),
        loadEventMs: roundMetric(navigationEntry?.loadEventEnd),
        firstPaintMs: getPaintMetric('first-paint'),
        firstContentfulPaintMs: getPaintMetric('first-contentful-paint'),
      };

      window.__EASING_LAB_STARTUP_METRICS__ = metrics;

      if (import.meta.env.DEV) {
        console.info('[easing-lab] startup metrics', metrics);
      }
    });
  });
};
