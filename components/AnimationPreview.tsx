import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  PREVIEW_ANIMATION_TYPES,
  PREVIEW_TARGET_TRANSLATE_PERCENT,
  PREVIEW_TIMELINE_DURATION,
  PREVIEW_TRAIL_COUNT,
  getAnimationEngineLabel,
  type PreviewAnimationType,
} from '../animationConfig';
import type { AnimationEngine } from '../types';

const ThreePreview = lazy(() =>
  import('./ThreePreview').then((module) => ({ default: module.ThreePreview }))
);

interface AnimationPreviewProps {
  ease: string;
  duration: number;
  range: number;
  progressRef: React.MutableRefObject<{ progress: number }>;
  engine: AnimationEngine;
}

const clampProgress = (progress: number): number => Math.min(1, Math.max(0, progress));

const applyTransform = (
  target: HTMLDivElement,
  animation: Exclude<PreviewAnimationType, 'Stagger'>,
  progress: number,
  range: number
) => {
  switch (animation) {
    case 'Move':
      target.style.transform = `translateX(${progress * PREVIEW_TARGET_TRANSLATE_PERCENT * range}%)`;
      break;
    case 'Scale':
      target.style.transform = `scale(${1 + progress * range})`;
      break;
    case 'Rotate':
      target.style.transform = `rotate(${progress * 180 * range}deg)`;
      break;
  }
};

const PreviewButton: React.FC<{
  label: PreviewAnimationType;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isActive}
    className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border ${
      isActive
        ? 'bg-accent-primary text-white border-accent-primary shadow-sm'
        : 'bg-surface-base text-text-secondary border-border-subtle hover:bg-surface-2 hover:text-text-primary'
    }`}
  >
    {label}
  </button>
);

export const AnimationPreview: React.FC<AnimationPreviewProps> = ({
  ease,
  duration,
  range,
  progressRef,
  engine,
}) => {
  const [activeAnimation, setActiveAnimation] = useState<PreviewAnimationType>('Move');
  const [showTrails, setShowTrails] = useState(true);

  const targetsRef = useRef<(HTMLDivElement | null)[]>([]);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const parsedEase = useMemo(() => {
    try {
      return gsap.parseEase(ease) || ((progress: number) => progress);
    } catch {
      return (progress: number) => progress;
    }
  }, [ease]);

  useEffect(() => {
    let frameId = 0;

    const renderFrame = () => {
      const rawProgress = clampProgress(progressRef.current.progress);
      const easedProgress = parsedEase(rawProgress);
      const targets = targetsRef.current.filter(
        (target): target is HTMLDivElement => target !== null
      );
      const trails = trailRefs.current.filter((trail): trail is HTMLDivElement => trail !== null);

      if (activeAnimation === 'Stagger') {
        const totalDuration = PREVIEW_TIMELINE_DURATION + (targets.length - 1) * 0.1;
        targets.forEach((target, index) => {
          const localProgress = clampProgress(rawProgress * totalDuration - index * 0.1);
          applyTransform(target, 'Move', parsedEase(localProgress), range);
        });
      } else {
        const [target, ghost] = targets;
        if (target) applyTransform(target, activeAnimation, easedProgress, range);
        if (ghost) applyTransform(ghost, activeAnimation, rawProgress, range);
      }

      if (showTrails && activeAnimation === 'Move') {
        trails.forEach((trail, index) => {
          const delayedProgress = Math.max(0, rawProgress - (index + 1) * 0.015);
          const trailProgress = parsedEase(delayedProgress);
          const xPosition = trailProgress * PREVIEW_TARGET_TRANSLATE_PERCENT * range;
          trail.style.transform = `translateX(${xPosition}%) scale(${1 - index * 0.1})`;
          trail.style.opacity = `${1 - index / trails.length}`;
          trail.style.visibility = 'visible';
        });
      } else {
        trails.forEach((trail) => {
          trail.style.visibility = 'hidden';
        });
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${rawProgress})`;
      }

      frameId = window.requestAnimationFrame(renderFrame);
    };

    frameId = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(frameId);
  }, [activeAnimation, parsedEase, progressRef, range, showTrails]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          Preview · {getAnimationEngineLabel(engine)}
        </span>
        <div className="flex gap-2 items-center flex-wrap">
          {activeAnimation === 'Move' && engine !== 'three' && (
            <button
              type="button"
              onClick={() => setShowTrails((current) => !current)}
              aria-pressed={showTrails}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${showTrails ? 'text-text-primary bg-accent-primary/15' : 'text-text-secondary hover:text-text-primary'}`}
              title="Toggle Motion Trails"
            >
              Trails
            </button>
          )}

          <div className="w-px h-4 bg-border-subtle self-center hidden sm:block" />

          <div className="flex gap-1">
            {PREVIEW_ANIMATION_TYPES.map((type) => (
              <PreviewButton
                key={type}
                label={type}
                isActive={activeAnimation === type}
                onClick={() => setActiveAnimation(type)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full bg-surface-2/30 border border-border-subtle rounded-xl flex flex-col relative overflow-hidden">
        <div className="h-28 w-full flex items-center px-6 relative">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
              backgroundSize: '40px 100%',
            }}
          />

          {engine === 'three' ? (
            <Suspense
              fallback={
                <span className="m-auto text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                  Loading Three.js…
                </span>
              }
            >
              <ThreePreview
                activeAnimation={activeAnimation}
                easing={parsedEase}
                progressRef={progressRef}
                range={range}
              />
            </Suspense>
          ) : activeAnimation === 'Stagger' ? (
            <div className="flex flex-col gap-2 w-full">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  ref={(element) => {
                    targetsRef.current[index] = element;
                  }}
                  className="w-6 h-6 rounded bg-accent-primary shadow-sm relative z-10 will-change-transform"
                />
              ))}
            </div>
          ) : (
            <>
              <div
                ref={(element) => {
                  targetsRef.current[1] = element;
                }}
                className="w-10 h-10 rounded-lg bg-text-secondary/20 absolute left-6 pointer-events-none will-change-transform"
              />
              {activeAnimation === 'Move' &&
                Array.from({ length: PREVIEW_TRAIL_COUNT }, (_, index) => (
                  <div
                    key={`trail-${index}`}
                    ref={(element) => {
                      trailRefs.current[index] = element;
                    }}
                    className="w-10 h-10 rounded-lg bg-accent-primary/30 absolute left-6 pointer-events-none mix-blend-multiply dark:mix-blend-screen z-0 will-change-transform"
                  />
                ))}
              <div
                ref={(element) => {
                  targetsRef.current[0] = element;
                }}
                className="w-10 h-10 rounded-lg bg-accent-primary shadow-lg relative z-10 flex items-center justify-center will-change-transform"
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full opacity-50" />
              </div>
            </>
          )}
        </div>
        <div className="h-1 w-full bg-surface-2 relative">
          <div
            ref={progressBarRef}
            className="h-full bg-accent-primary origin-left will-change-transform"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-text-secondary px-1 font-mono">
        <span>0.0s</span>
        <span>{activeAnimation === 'Stagger' ? 'Stagger Delay' : 'Linear vs Eased'}</span>
        <span>{duration.toFixed(1)}s</span>
      </div>
    </div>
  );
};
