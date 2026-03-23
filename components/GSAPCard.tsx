
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import type { GSAPEasingFunction } from '../types';
import { generateGSAPPath } from '../utils/gsapUtils';

interface GSAPCardProps {
  easing: GSAPEasingFunction;
  onClick: () => void;
}

export const GSAPCard: React.FC<GSAPCardProps> = ({ easing, onClick }) => {
  const animationTl = useRef<gsap.core.Timeline | null>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Generate the path data once using the new utility function
  const pathData = useMemo(() => generateGSAPPath(easing.ease, 224, 224), [easing.ease]);

  useEffect(() => {
    gsap.registerPlugin(MotionPathPlugin);
    // Set initial position of the marker at the start of the path
    gsap.set(markerRef.current, {
      motionPath: {
        path: pathRef.current,
        align: pathRef.current,
        alignOrigin: [0.5, 0.5],
        end: 0,
      },
    });
    // Set initial state for the tooltip
    gsap.set(tooltipRef.current, { autoAlpha: 0, y: 100 });
  }, []);

  const handleMouseEnter = () => {
    if (animationTl.current) animationTl.current.kill();
    if (!cardRef.current) return;

    // Get computed styles to pass concrete values to GSAP
    const computedStyle = getComputedStyle(cardRef.current);
    const accentPrimaryBg = computedStyle.getPropertyValue('--accent-primary-bg');
    const accentPrimary = computedStyle.getPropertyValue('--accent-primary');

    animationTl.current = gsap.timeline({
      repeat: -1,
      yoyo: true,
    });
    
    animationTl.current.to(markerRef.current, {
      motionPath: {
        path: pathRef.current,
        align: pathRef.current,
        alignOrigin: [0.5, 0.5],
        end: 1,
      },
      duration: 1.5,
      ease: easing.ease,
    }, 0)
    .to(cardRef.current, {
      backgroundColor: accentPrimaryBg,
      borderColor: accentPrimary,
      duration: 1.5,
      ease: easing.ease,
    }, 0)
    .to(pathRef.current, {
      stroke: accentPrimary,
      duration: 1.5,
      ease: easing.ease,
    }, 0);
      
    // Tooltip animation runs once, not part of the yoyo loop
    gsap.to(tooltipRef.current, {
        duration: 0.5,
        ease: easing.ease,
        autoAlpha: 1,
        y: 0,
    });
  };

  const handleMouseLeave = () => {
    if (animationTl.current) animationTl.current.kill();
    if (!cardRef.current) return;
    
    // Kill any running tooltip animations
    gsap.killTweensOf(tooltipRef.current);
    
    // Get computed styles for the revert animation
    const computedStyle = getComputedStyle(cardRef.current);
    const surface1 = computedStyle.getPropertyValue('--surface-1');
    const borderSubtle = computedStyle.getPropertyValue('--border-subtle');
    const textSecondary = computedStyle.getPropertyValue('--text-secondary');

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
        borderColor: borderSubtle,
      }, 0)
      .to(pathRef.current, {
        stroke: textSecondary,
      }, 0)
      .to(tooltipRef.current, {
        autoAlpha: 0,
        y: 15,
      }, 0);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click
    navigator.clipboard.writeText(easing.ease);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex flex-col gap-2">
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
            ref={cardRef} // Ref is on this button specifically for BG/Border animations
            type="button"
            className="aspect-square w-full rounded-md border-2 border-border-subtle dark:border-border-subtle bg-surface-1 dark:bg-surface-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-base focus-visible:ring-accent-primary"
            onClick={onClick} // Main action is select
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
              d={pathData}
              stroke="currentColor"
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
        </button>

        {/* Copy Button Overlay */}
        <button 
            onClick={handleCopy}
            className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-surface-1/60 dark:bg-surface-2/60 backdrop-blur-md text-text-placeholder hover:text-text-primary dark:hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent-primary z-20"
            aria-label="Copy GSAP ease string"
        >
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
        </button>

          {copied && (
            <div className="absolute top-1.5 right-8 bg-accent-primary-bg px-2 py-1 rounded-md transition-opacity duration-200 pointer-events-none z-30">
              <span className="text-accent-primary font-bold text-xs">Copied!</span>
            </div>
          )}
        
        {/* Tooltip for description */}
        <div 
          ref={tooltipRef}
          className="absolute border-4 border-zinc-950 bottom-full mb-2 w-32 p-2 text-center text-xs text-white bg-zinc-900 dark:bg-zinc-900 rounded-md shadow-lg pointer-events-none z-10 left-1/2 -translate-x-1/2"
        >
          {easing.description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-zinc-900"></div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <p className="text-center text-[11px] text-text-primary font-semibold truncate w-full group-hover:text-text-primary dark:group-hover:text-text-primary transition-colors duration-200">
            {easing.name}
        </p>
        <p className="text-center text-[10px] text-text-secondary font-mono truncate w-full">
            {easing.ease}
        </p>
      </div>
    </div>
  );
};
