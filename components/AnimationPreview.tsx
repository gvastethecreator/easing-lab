import React, { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import {
  PREVIEW_ANIMATION_TYPES,
  PREVIEW_TARGET_TRANSLATE_PERCENT,
  PREVIEW_TIMELINE_DURATION,
  PREVIEW_TRAIL_COUNT,
} from '../animationConfig';

type AnimationType = (typeof PREVIEW_ANIMATION_TYPES)[number];

interface AnimationPreviewProps {
  ease: string;
  duration: number;
  range: number;
  progressRef: React.MutableRefObject<{ progress: number }>;
}

const PreviewButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({
  label,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
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
}) => {
  const [activeAnimation, setActiveAnimation] = useState<AnimationType>('Move');
  const [showTrails, setShowTrails] = useState(true);

  const targetsRef = useRef<(HTMLDivElement | null)[]>([]);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const ctxRef = useRef<gsap.Context | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Memoize ease function to avoid parsing it 60 times a second in the ticker
  const parsedEase = useMemo(() => {
    try {
      return gsap.parseEase(ease) || ((p: number) => p);
    } catch {
      return (p: number) => p;
    }
  }, [ease]);

  // Setup Animation Timeline
  useEffect(() => {
    if (ctxRef.current) ctxRef.current.revert();

    ctxRef.current = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      const items = targetsRef.current.filter(Boolean);
      const trails = trailRefs.current.filter(Boolean);

      gsap.set(trails, { autoAlpha: 0 });

      if (items.length === 0) return;

      const getProps = (isGhost: boolean) => {
        const easeVal = isGhost ? 'none' : ease;
        const alpha = isGhost ? 0.1 : 1;
        switch (activeAnimation) {
          case 'Move':
          case 'Stagger':
            return {
              xPercent: PREVIEW_TARGET_TRANSLATE_PERCENT * range,
              ease: easeVal,
              opacity: alpha,
            };
          case 'Scale':
            return { scale: 1 + 1 * range, ease: easeVal, opacity: alpha };
          case 'Rotate':
            return { rotation: 180 * range, ease: easeVal, opacity: alpha };
          default:
            return {};
        }
      };

      if (activeAnimation === 'Stagger') {
        items.forEach((item, i) => {
          tl.to(
            item,
            { ...getProps(false), duration: PREVIEW_TIMELINE_DURATION, overwrite: 'auto' },
            i * 0.1
          );
        });
      } else {
        const [target, ghost] = items;
        tl.to(
          target,
          { ...getProps(false), duration: PREVIEW_TIMELINE_DURATION, overwrite: 'auto' },
          0
        );
        if (ghost)
          tl.to(
            ghost,
            { ...getProps(true), duration: PREVIEW_TIMELINE_DURATION, overwrite: 'auto' },
            0
          );
      }
      tlRef.current = tl;
    });

    return () => {
      ctxRef.current?.revert();
    };
  }, [activeAnimation, range, ease, showTrails]);

  // Ticker Loop for Scrubbing
  useEffect(() => {
    const onTick = () => {
      const progress = progressRef.current.progress;
      const trails = trailRefs.current.filter((trail): trail is HTMLDivElement => Boolean(trail));

      // Ensure we have a valid timeline and context before animating
      if (tlRef.current && ctxRef.current) {
        tlRef.current.progress(progress);

        // Optimized Trail Logic
        if (showTrails && activeAnimation === 'Move' && targetsRef.current[0]) {
          for (let i = 0; i < trails.length; i++) {
            const trail = trails[i];
            const delay = (i + 1) * 0.015;
            const delayedProgress = Math.max(0, progress - delay);

            // Use memoized ease function
            const easedVal = parsedEase(delayedProgress);
            const xPos = easedVal * (PREVIEW_TARGET_TRANSLATE_PERCENT * range);

            // Direct style manipulation for performance
            trail.style.transform = `translate(${xPos}%, 0) scale(${1 - i * 0.1})`;
            trail.style.opacity = `${1 - i / trails.length}`;
            trail.style.visibility = 'visible';
          }
        } else {
          for (const trail of trails) {
            trail.style.visibility = 'hidden';
          }
        }
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    gsap.ticker.add(onTick);
    return () => {
      gsap.ticker.remove(onTick);
    };
  }, [progressRef, parsedEase, range, showTrails, activeAnimation]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          Preview
        </span>
        <div className="flex gap-2 items-center flex-wrap">
          {activeAnimation === 'Move' && (
            <button
              onClick={() => setShowTrails(!showTrails)}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${showTrails ? 'text-accent-primary bg-accent-primary/10' : 'text-text-placeholder hover:text-text-secondary'}`}
              title="Toggle Motion Trails"
            >
              Trails
            </button>
          )}

          <div className="w-px h-4 bg-border-subtle self-center hidden sm:block"></div>

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
          ></div>

          {activeAnimation === 'Stagger' ? (
            <div className="flex flex-col gap-2 w-full">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  ref={(el) => {
                    targetsRef.current[i] = el;
                  }}
                  className="w-6 h-6 rounded bg-accent-primary shadow-sm relative z-10"
                />
              ))}
            </div>
          ) : (
            <>
              <div
                ref={(el) => {
                  targetsRef.current[1] = el;
                }}
                className="w-10 h-10 rounded-lg bg-text-secondary/20 absolute left-6 pointer-events-none"
              />
              {activeAnimation === 'Move' &&
                [...Array(PREVIEW_TRAIL_COUNT)].map((_, i) => (
                  <div
                    key={`trail-${i}`}
                    ref={(el) => {
                      trailRefs.current[i] = el;
                    }}
                    className="w-10 h-10 rounded-lg bg-accent-primary/30 absolute left-6 pointer-events-none mix-blend-multiply dark:mix-blend-screen z-0 will-change-transform"
                  />
                ))}
              <div
                ref={(el) => {
                  targetsRef.current[0] = el;
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

      <div className="flex justify-between text-[10px] text-text-placeholder px-1 font-mono">
        <span>0.0s</span>
        <span>{activeAnimation === 'Stagger' ? 'Stagger Delay' : 'Linear vs Eased'}</span>
        <span>{duration.toFixed(1)}s</span>
      </div>
    </div>
  );
};
