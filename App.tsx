import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import type { AnimationEngine, View, PathPoint, Point } from './types';
import {
  createDefaultBezierP1,
  createDefaultBezierP2,
  createDefaultGsapPoints,
  CUSTOM_GSAP_EASE_ID,
  DEFAULT_DURATION,
  DEFAULT_RANGE,
  getAnimationEngineLabel,
} from './animationConfig';
import { useMasterProgressAnimation } from './hooks/useMasterProgressAnimation';
import { useRegisterCustomEase } from './hooks/useRegisterCustomEase';

const CubicBezierView = lazy(() =>
  import('./views/CubicBezierView').then((module) => ({ default: module.CubicBezierView }))
);

const GSAPView = lazy(() =>
  import('./views/GSAPView').then((module) => ({ default: module.GSAPView }))
);

const EngineView = lazy(() =>
  import('./views/EngineView').then((module) => ({ default: module.EngineView }))
);

const App: React.FC = () => {
  const [view, setView] = useState<View>('cubic');
  const [engine, setEngine] = useState<AnimationEngine>('gsap');
  const [isPlaying, setIsPlaying] = useState(
    () => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  // Centralized state for cubic bezier and animation params
  const [p1, setP1] = useState<Point>(() => createDefaultBezierP1());
  const [p2, setP2] = useState<Point>(() => createDefaultBezierP2());
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [range, setRange] = useState(DEFAULT_RANGE);

  // Single source of truth for animation progress
  const progressRef = useRef({ progress: 0 });

  // State for the multipoint GSAP ease
  const [gsapPoints, setGsapPoints] = useState<PathPoint[]>(() => createDefaultGsapPoints());

  const customEaseId = CUSTOM_GSAP_EASE_ID;

  const changeView = (nextView: View) => {
    setView(nextView);
    if (nextView !== 'cubic') setEngine(nextView);
  };

  const engineState = useMasterProgressAnimation({
    progressRef,
    p1,
    p2,
    duration,
    isPlaying,
    engine,
  });
  useRegisterCustomEase({ customEaseId, points: gsapPoints });

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!reducedMotion) return;

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsPlaying(false);
    };

    reducedMotion.addEventListener('change', handleChange);
    return () => reducedMotion.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="min-h-screen font-sans flex flex-col selection:bg-accent-primary-bg selection:text-accent-primary transition-colors duration-300">
      <Header
        activeView={view}
        setView={changeView}
        progressRef={progressRef}
        isPlaying={isPlaying}
        togglePlay={() => setIsPlaying((current) => !current)}
        engine={engine}
        engineStatus={engineState.status}
      />
      {engineState.status === 'error' && (
        <div
          role="alert"
          className="mx-auto mb-4 flex w-[calc(100%-2rem)] max-w-7xl items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-text-primary"
        >
          <span>
            {getAnimationEngineLabel(engine)} no pudo iniciar: {engineState.error}
          </span>
          {engine !== 'gsap' && (
            <button
              type="button"
              onClick={() => changeView('gsap')}
              className="shrink-0 rounded-lg bg-accent-primary px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              Usar GSAP
            </button>
          )}
        </div>
      )}
      <main className="p-4 grow w-full max-w-480 mx-auto animate-in fade-in duration-500">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-90 text-text-secondary text-sm">
              Cargando editor…
            </div>
          }
        >
          {view === 'cubic' && (
            <CubicBezierView
              p1={p1}
              setP1={setP1}
              p2={p2}
              setP2={setP2}
              duration={duration}
              setDuration={setDuration}
              range={range}
              setRange={setRange}
              progressRef={progressRef}
              engine={engine}
            />
          )}
          {view === 'gsap' && (
            <GSAPView
              customEaseId={customEaseId}
              points={gsapPoints}
              setPoints={setGsapPoints}
              progressRef={progressRef}
              duration={duration}
              setDuration={setDuration}
              range={range}
              setRange={setRange}
              engine={engine}
            />
          )}
          {(view === 'motion' || view === 'animejs' || view === 'three') && (
            <EngineView
              engine={view}
              p1={p1}
              setP1={setP1}
              p2={p2}
              setP2={setP2}
              duration={duration}
              setDuration={setDuration}
              range={range}
              setRange={setRange}
              progressRef={progressRef}
            />
          )}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default App;
