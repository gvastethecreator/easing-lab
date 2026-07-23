import { useEffect, useRef, useState } from 'react';
import { createProgressDriver, type ProgressDriver } from '../animation/progressDrivers';
import type { AnimationEngine, Point } from '../types';

type ProgressEngineStatus = 'loading' | 'ready' | 'error';

interface UseMasterProgressAnimationParams {
  progressRef: React.MutableRefObject<{ progress: number }>;
  p1: Point;
  p2: Point;
  duration: number;
  isPlaying: boolean;
  engine: AnimationEngine;
}

interface ProgressEngineState {
  status: ProgressEngineStatus;
  error: string | null;
}

export const useMasterProgressAnimation = ({
  progressRef,
  p1,
  p2,
  duration,
  isPlaying,
  engine,
}: UseMasterProgressAnimationParams): ProgressEngineState => {
  const driverRef = useRef<ProgressDriver | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const [state, setState] = useState<ProgressEngineState>({
    status: 'loading',
    error: null,
  });

  isPlayingRef.current = isPlaying;

  useEffect(() => {
    const currentEase = `cubic-bezier(${p1.x}, ${p1.y}, ${p2.x}, ${p2.y})`;
    const root = document.documentElement;
    root.style.setProperty('--global-duration', `${duration}s`);
    root.style.setProperty('--global-easing', currentEase);
  }, [duration, p1, p2]);

  useEffect(() => {
    let cancelled = false;

    driverRef.current?.dispose();
    driverRef.current = null;
    progressRef.current.progress = 0;
    setState({ status: 'loading', error: null });

    void createProgressDriver(engine, {
      duration,
      onProgress: (progress) => {
        progressRef.current.progress = progress;
      },
    })
      .then((driver) => {
        if (cancelled) {
          driver.dispose();
          return;
        }

        driverRef.current = driver;
        if (isPlayingRef.current) driver.play();
        setState({ status: 'ready', error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'No se pudo cargar el motor.';
        setState({ status: 'error', error: message });
      });

    return () => {
      cancelled = true;
      driverRef.current?.dispose();
      driverRef.current = null;
    };
  }, [duration, engine, progressRef]);

  useEffect(() => {
    const driver = driverRef.current;
    if (!driver) return;

    if (isPlaying) driver.play();
    else driver.pause();
  }, [isPlaying]);

  return state;
};
