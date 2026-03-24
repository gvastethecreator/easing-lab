import React, { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { GraphGrid } from './GraphGrid';
import { CopyIcon, CheckIcon } from './Icons';
import { GRAPH_CARD_VIEWBOX_SIZE } from '../animationConfig';

interface UniversalGraphCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  pathData: string;
  animationEase: string; // CSS string or GSAP ease string
  onSelect: () => void;
  isCustom?: boolean;
  copyValue: string;
}

const createMotionPath = (path: SVGPathElement, end?: number) => ({
  path,
  align: path,
  alignOrigin: [0.5, 0.5] as [number, number],
  ...(typeof end === 'number' ? { end } : {}),
});

export const UniversalGraphCard: React.FC<UniversalGraphCardProps> = React.memo(
  ({
    id,
    title,
    subtitle,
    description,
    pathData,
    animationEase,
    onSelect,
    isCustom = false,
    copyValue,
  }) => {
    const cardRef = useRef<HTMLButtonElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const markerRef = useRef<SVGCircleElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);

    const ctxRef = useRef<gsap.Context | null>(null);

    // Memoize static visual components
    const grid = useMemo(
      () => (
        <GraphGrid
          size={GRAPH_CARD_VIEWBOX_SIZE}
          subdivisions={4}
          showMidLines={false}
          opacity={0.3}
          showFineGrid={false}
        />
      ),
      []
    );

    useEffect(() => {
      // Initial Setup
      if (markerRef.current && pathRef.current) {
        gsap.set(markerRef.current, {
          motionPath: {
            ...createMotionPath(pathRef.current),
            end: 0,
          },
        });
      }

      if (tooltipRef.current) {
        gsap.set(tooltipRef.current, { autoAlpha: 0, y: 10, scale: 0.95 });
      }

      return () => {
        if (ctxRef.current) ctxRef.current.revert();
      };
    }, [pathData]);

    const handleMouseEnter = () => {
      if (ctxRef.current) ctxRef.current.revert();
      const card = cardRef.current;
      const marker = markerRef.current;
      const path = pathRef.current;
      if (!card || !marker || !path) return;

      ctxRef.current = gsap.context(() => {
        gsap.to(marker, {
          motionPath: {
            ...createMotionPath(path),
            end: 1,
          },
          duration: 1.5,
          ease: animationEase,
          repeat: -1,
          yoyo: true,
          overwrite: 'auto',
        });

        gsap.to(card, {
          backgroundColor: 'var(--accent-primary-bg)',
          borderColor: 'var(--accent-primary)',
          duration: 0.5,
          overwrite: 'auto',
        });

        gsap.to(path, {
          stroke: 'var(--accent-primary)',
          duration: 0.5,
          overwrite: 'auto',
        });

        if (description && tooltipRef.current) {
          gsap.to(tooltipRef.current, {
            duration: 0.4,
            ease: 'back.out(1.7)',
            autoAlpha: 1,
            y: 0,
            scale: 1,
            overwrite: true,
          });
        }
      }, card);
    };

    const handleMouseLeave = () => {
      const card = cardRef.current;
      const path = pathRef.current;
      const marker = markerRef.current;
      if (!card || !path || !marker) {
        return;
      }

      gsap.killTweensOf([card, path, marker, tooltipRef.current].filter(Boolean));

      const borderColor = isCustom ? 'var(--accent-primary)' : 'var(--border-subtle)';

      gsap.to(marker, {
        duration: 0.5,
        ease: 'power2.out',
        motionPath: {
          ...createMotionPath(path),
          end: 0,
        },
        overwrite: true,
      });

      gsap.to(card, {
        duration: 0.4,
        backgroundColor: 'var(--surface-1)',
        borderColor: borderColor,
        overwrite: true,
      });

      gsap.to(path, {
        duration: 0.4,
        stroke: 'var(--text-secondary)',
        overwrite: true,
      });

      if (tooltipRef.current) {
        gsap.to(tooltipRef.current, {
          duration: 0.3,
          ease: 'power2.in',
          autoAlpha: 0,
          y: 10,
          scale: 0.95,
          overwrite: true,
        });
      }
    };

    const handleCopy = (e: React.MouseEvent) => {
      e.stopPropagation();
      void navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div
        className="flex flex-col gap-2 relative group/card h-full"
        style={{ viewTransitionName: `graph-card-${id}` } as React.CSSProperties}
      >
        <div
          className="relative w-full aspect-square"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            ref={cardRef}
            type="button"
            onClick={onSelect}
            className={`relative w-full h-full rounded-xl border-2 bg-surface-1 dark:bg-surface-1 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-1 focus-visible:ring-accent-primary/60 dark:focus-visible:ring-offset-surface-base ${isCustom ? 'border-accent-primary' : 'border-border-subtle dark:border-border-subtle'
              }`}
            aria-label={`Select ${title}`}
          >
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${GRAPH_CARD_VIEWBOX_SIZE} ${GRAPH_CARD_VIEWBOX_SIZE}`}
              className="absolute inset-0 w-full h-full p-4"
              preserveAspectRatio="none"
              overflow="visible"
            >
              {grid}

              <path
                ref={pathRef}
                d={pathData}
                stroke="currentColor"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-text-secondary dark:text-text-secondary transition-colors"
              />

              <circle
                ref={markerRef}
                r="18"
                fill="currentColor"
                stroke="var(--surface-1)"
                strokeWidth="4"
                className="text-accent-primary shadow-sm"
              />
            </svg>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded-lg bg-surface-1/90 dark:bg-surface-2/90 backdrop-blur border border-border-subtle text-text-secondary hover:text-accent-primary hover:border-accent-primary opacity-0 group-hover/card:opacity-100 transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-accent-primary scale-90 hover:scale-100 z-20 shadow-sm"
            aria-label="Copy easing value"
            title="Copy to clipboard"
          >
            <CopyIcon />
          </button>

          {/* Feedback Copied */}
          <div
            className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-all duration-300 ${copied ? 'opacity-100 backdrop-blur-[2px]' : 'opacity-0'}`}
          >
            <div
              className={`transform transition-all duration-300 ${copied ? 'translate-y-0 scale-100' : 'translate-y-4 scale-90'}`}
            >
              <div className="bg-text-primary text-surface-1 px-4 py-2 rounded-full shadow-xl font-bold text-xs flex items-center gap-2">
                <CheckIcon />
                Copied!
              </div>
            </div>
          </div>

          {/* Tooltip */}
          {description && (
            <div
              ref={tooltipRef}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-3 text-center text-xs leading-relaxed text-surface-1 bg-text-primary backdrop-blur rounded-lg shadow-xl pointer-events-none z-10 origin-bottom"
            >
              {description}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-text-primary"></div>
            </div>
          )}
        </div>

        <div className="text-center px-1">
          <h3 className="text-xs font-semibold text-text-primary truncate">{title}</h3>
          {subtitle && (
            <p className="text-[10px] font-mono text-text-secondary truncate mt-0.5 opacity-80">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }
);

UniversalGraphCard.displayName = 'UniversalGraphCard';
