import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import type { EasingFunction } from '../types';

interface EasingCardProps {
  easing: EasingFunction;
  onClick: () => void;
  duration: number;
}

export const EasingCard: React.FC<EasingCardProps> = ({ easing, onClick, duration }) => {
  const animationTl = useRef<gsap.core.Timeline | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);
  const [copied, setCopied] = useState(false);
  const isCustom = easing.id === 'custom';

  useEffect(() => {
    gsap.registerPlugin(MotionPathPlugin);
    gsap.set(markerRef.current, {
      motionPath: {
        path: pathRef.current,
        align: pathRef.current,
        alignOrigin: [0.5, 0.5],
        end: 0,
      },
    });
  }, []);

  const handleMouseEnter = () => {
    if (animationTl.current) {
      animationTl.current.kill();
    }
    if (!cardRef.current) return;

    // Get computed styles to pass concrete values to GSAP
    const computedStyle = getComputedStyle(cardRef.current);
    const accentPrimaryBg = computedStyle.getPropertyValue('--accent-primary-bg');
    const accentPrimary = computedStyle.getPropertyValue('--accent-primary');

    const easeString = `cubic-bezier(${easing.bezier.join(',')})`;
    
    animationTl.current = gsap.timeline({
      repeat: -1,
      yoyo: true,
    });

    animationTl.current.to(markerRef.current, {
      motionPath: {
        path: pathRef.current,
        align: pathRef.current,
        alignOrigin: [0.5, 0.5],
      },
      duration,
      ease: easeString,
    }, 0)
    .to(cardRef.current, {
      backgroundColor: accentPrimaryBg,
      borderColor: accentPrimary,
      duration,
      ease: easeString,
    }, 0)
    .to(pathRef.current, {
      stroke: accentPrimary,
      duration,
      ease: easeString,
    }, 0);
  };

  const handleMouseLeave = () => {
    if (animationTl.current) {
      animationTl.current.kill();
    }
    if (!cardRef.current) return;
    
    // Get computed styles for the revert animation
    const computedStyle = getComputedStyle(cardRef.current);
    const surface1 = computedStyle.getPropertyValue('--surface-1');
    const borderSubtle = computedStyle.getPropertyValue('--border-subtle');
    const accentPrimary = computedStyle.getPropertyValue('--accent-primary');
    const textSecondary = computedStyle.getPropertyValue('--text-secondary');

    const initialBorderColor = isCustom ? accentPrimary : borderSubtle;
    
    gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' }})
      .to(markerRef.current, {
        motionPath: {
          path: pathRef.current,
          align: pathRef.current,
          alignOrigin: [0.5, 0.5],
          end: 0,
        },
      }, 0)
      .to(cardRef.current, {
        backgroundColor: surface1,
        borderColor: initialBorderColor,
      }, 0)
      .to(pathRef.current, {
        stroke: textSecondary,
      }, 0);
  };
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card click from firing
    navigator.clipboard.writeText(`cubic-bezier(${easing.bezier.join(', ')})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="flex flex-col gap-2"
      style={{ viewTransitionName: `easing-card-${easing.id}` } as React.CSSProperties}
    >
      <div className="relative group/card">
        <button
          ref={cardRef}
          type="button"
          className={`relative aspect-square w-full rounded-md border-2 bg-surface-1 dark:bg-surface-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-base focus-visible:ring-accent-primary ${
            isCustom ? 'border-accent-primary' : 'border-border-subtle dark:border-border-subtle'
          }`}
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 224 224"
            className="absolute inset-0 w-full h-full p-3"
            preserveAspectRatio="none"
            overflow="visible"
          >
            {/* Grid */}
            <path
              d="M56 0 V 224 M112 0 V 224 M168 0 V 224 M0 56 H 224 M0 112 H 224 M0 168 H 224"
              stroke="var(--border-subtle)"
              strokeWidth="1"
            />
            
            {/* Curve */}
            <path
              ref={pathRef}
              d={easing.path}
              stroke="var(--text-secondary)"
              fill="transparent"
              strokeWidth="9"
              strokeLinecap="round"
              className="text-text-secondary dark:text-text-secondary"
            />

            {/* Marker */}
            <circle 
              ref={markerRef} 
              r="20" 
              fill="currentColor" 
              stroke="var(--surface-1)" 
              strokeWidth="4" 
              className="text-accent-primary dark:stroke-surface-1" 
            />
          </svg>
           {copied && (
            <div className="absolute inset-0 bg-accent-primary-bg flex items-center justify-center rounded-md transition-opacity duration-200 pointer-events-none">
              <span className="text-accent-primary font-bold text-sm">Copied!</span>
            </div>
          )}
        </button>

        {easing.description && !isCustom && (
          <div 
            className="absolute border-4 border-zinc-950 bottom-full mb-2 w-36 p-2 text-center text-xs text-white bg-zinc-900 rounded-md shadow-lg pointer-events-none z-10 left-1/2 -translate-x-1/2 opacity-0 translate-y-full group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300"
            style={{transitionTimingFunction: 'cubic-bezier(0.645, 0.045, 0.355, 1)'}}
          >
            {easing.description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-900"></div>
          </div>
        )}

         {!isCustom && (
          <button 
            onClick={handleCopy}
            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-surface-1/50 dark:bg-surface-2/50 backdrop-blur-sm text-text-placeholder hover:text-text-primary dark:hover:text-text-primary opacity-0 group-hover/card:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent-primary"
            aria-label="Copy cubic-bezier value"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
          </button>
        )}
      </div>

      <p className="text-center text-[11px] text-text-secondary dark:text-text-secondary font-medium transition-colors duration-200 group-hover:text-text-primary dark:group-hover:text-text-primary truncate">
        {easing.name}
      </p>
    </div>
  );
};