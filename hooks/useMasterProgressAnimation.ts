import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { Point } from '../types';

interface UseMasterProgressAnimationParams {
  progressRef: React.MutableRefObject<{ progress: number }>;
  p1: Point;
  p2: Point;
  duration: number;
  isPlaying: boolean;
}

export const useMasterProgressAnimation = ({
  progressRef,
  p1,
  p2,
  duration,
  isPlaying,
}: UseMasterProgressAnimationParams) => {
  const masterTweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const currentEase = `cubic-bezier(${p1.x}, ${p1.y}, ${p2.x}, ${p2.y})`;

    masterTweenRef.current?.kill();

    masterTweenRef.current = gsap.fromTo(
      progressRef.current,
      { progress: 0 },
      {
        progress: 1,
        duration,
        ease: currentEase,
        repeat: -1,
        yoyo: true,
        paused: !isPlaying,
        onUpdate: () => {
          if (progressRef.current.progress > 1) progressRef.current.progress = 1;
          if (progressRef.current.progress < 0) progressRef.current.progress = 0;
        },
      }
    );

    const root = document.documentElement;
    root.style.setProperty('--global-duration', `${duration}s`);
    root.style.setProperty('--global-easing', currentEase);

    return () => {
      masterTweenRef.current?.kill();
    };
  }, [duration, isPlaying, p1, p2, progressRef]);

  useEffect(() => {
    const tween = masterTweenRef.current;

    if (!tween) {
      return;
    }

    if (isPlaying) {
      tween.play();
    } else {
      tween.pause();
    }
  }, [isPlaying]);

  return masterTweenRef;
};
