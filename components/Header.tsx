import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ColorToggle } from './ColorToggle';
import { ThemeToggle } from './ThemeToggle';
import { PlayIcon, PauseIcon, ChevronDownIcon } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { getAnimationEngineLabel, getViewLabel, VIEW_TABS } from '../animationConfig';
import type { AnimationEngine, View } from '../types';

interface HeaderProps {
  activeView: View;
  setView: (view: View) => void;
  progressRef: React.MutableRefObject<{ progress: number }>;
  isPlaying: boolean;
  togglePlay: () => void;
  engine: AnimationEngine;
  engineStatus: 'loading' | 'ready' | 'error';
}

const NavButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({
  label,
  isActive,
  onClick,
}) => (
  <button
    type="button"
    aria-pressed={isActive}
    onClick={onClick}
    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-surface-base focus:ring-accent-primary overflow-hidden ${
      isActive
        ? 'text-white shadow-md bg-accent-primary'
        : 'text-text-secondary hover:bg-surface-2 dark:hover:bg-surface-2 hover:text-text-primary'
    }`}
  >
    <span className="relative z-10">{label}</span>
  </button>
);

const PlayPauseButton: React.FC<{ isPlaying: boolean; onClick: () => void }> = ({
  isPlaying,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 rounded-full bg-surface-2 dark:bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
    title={isPlaying ? 'Pause Animation' : 'Play Animation'}
    aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
  >
    {isPlaying ? <PauseIcon /> : <PlayIcon />}
  </button>
);

const NUM_TRAIL_PARTICLES = 6;

const isDefined = <T,>(value: T | null): value is T => value !== null;

const getNumericGsapProperty = (target: gsap.TweenTarget, property: string): number => {
  const value = gsap.getProperty(target, property);
  if (typeof value === 'number') {
    return value;
  }

  const numericValue = Number.parseFloat(String(value));
  return Number.isFinite(numericValue) ? numericValue : 0;
};

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setView,
  progressRef,
  isPlaying,
  togglePlay,
  engine,
  engineStatus,
}) => {
  const { cycleAccentColor, nextAccentColor } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mousePos = useRef({ x: 0, y: 0 });
  const isInside = useRef(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    const container = containerRef.current;
    const follower = followerRef.current;
    if (!container || !follower) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const trail = trailRefs.current.filter(isDefined);
      const standbyPos = { x: container.offsetWidth - 20, y: container.offsetHeight / 2 };

      gsap.set([follower, ...trail], {
        xPercent: -50,
        yPercent: -50,
        scale: 0,
        autoAlpha: 0,
        x: standbyPos.x,
        y: standbyPos.y,
      });

      const followerXTo = gsap.quickTo(follower, 'x', { duration: 0.6, ease: 'power3.out' });
      const followerYTo = gsap.quickTo(follower, 'y', { duration: 0.6, ease: 'power3.out' });

      const trailXTo = trail.map((p, i) =>
        gsap.quickTo(p, 'x', { duration: 0.6 + (i + 1) * 0.05, ease: 'power3.out' })
      );
      const trailYTo = trail.map((p, i) =>
        gsap.quickTo(p, 'y', { duration: 0.6 + (i + 1) * 0.05, ease: 'power3.out' })
      );

      const tickerFunc = () => {
        if (!container.isConnected || !follower.isConnected) {
          return;
        }
        const currentStandby = { x: container.offsetWidth - 40, y: container.offsetHeight / 2 };
        const target = isInside.current ? mousePos.current : currentStandby;

        followerXTo(target.x);
        followerYTo(target.y);

        const leaderX = getNumericGsapProperty(follower, 'x');
        const leaderY = getNumericGsapProperty(follower, 'y');

        trail.forEach((_, i) => {
          trailXTo[i](leaderX);
          trailYTo[i](leaderY);
        });

        const prog = progressRef.current.progress;
        const pulse = 1 + Math.sin(prog * Math.PI) * 0.2;
        const blur = isInside.current ? 0 : 4 * (1 - prog);

        if (isInside.current) {
          gsap.set(follower, { scale: 1, filter: 'blur(0px)' });
        } else {
          gsap.set(follower, { scale: pulse * 0.5, filter: `blur(${blur}px)` });
        }
      };

      gsap.ticker.add(tickerFunc);
      return () => gsap.ticker.remove(tickerFunc);
    }, containerRef);

    const onMouseEnter = () => {
      isInside.current = true;
      gsap.to(follower, { autoAlpha: 1, duration: 0.3 });
      const trail = trailRefs.current.filter(isDefined);
      gsap.to(trail, { autoAlpha: 0.4, scale: (i) => 1 - i * 0.15, duration: 0.3, stagger: 0.05 });
    };

    const onMouseLeave = () => {
      isInside.current = false;
      gsap.to(follower, { autoAlpha: 0, duration: 0.5, delay: 0.2 });
      const trail = trailRefs.current.filter(isDefined);
      gsap.to(trail, { autoAlpha: 0, duration: 0.3 });
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mousemove', onMouseMove);

    return () => {
      gsap.killTweensOf([follower, ...trailRefs.current.filter(isDefined)]);
      ctx.revert();
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, [progressRef]);

  return (
    <header className="sticky top-2 z-50 mb-8">
      <div
        ref={containerRef}
        className="max-w-7xl mx-auto px-4 backdrop-blur-md rounded-2xl bg-surface-1/80 dark:bg-surface-2/60 border border-white/10 dark:border-white/5 relative shadow-lg transition-colors duration-500 z-50"
      >
        <div className="flex items-center justify-between h-16 relative z-20">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight text-text-primary select-none">
                EASY
                <span className="text-accent-primary dark:text-accent-primary-hover">EASING</span>
              </h1>
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest -mt-1 hidden sm:block">
                Motion Library
              </span>
            </div>

            <nav
              className="hidden xl:flex items-center gap-1 p-1 bg-surface-2/50 dark:bg-surface-1/30 rounded-xl border border-border-subtle"
              aria-label="Easing labs"
            >
              {VIEW_TABS.map((tab) => (
                <NavButton
                  key={tab.id}
                  label={tab.label}
                  isActive={activeView === tab.id}
                  onClick={() => setView(tab.id)}
                />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <PlayPauseButton isPlaying={isPlaying} onClick={togglePlay} />

            <span
              aria-hidden="true"
              title={
                engineStatus === 'ready'
                  ? `${getAnimationEngineLabel(engine)} ready`
                  : engineStatus === 'loading'
                    ? `Loading ${getAnimationEngineLabel(engine)}`
                    : `${getAnimationEngineLabel(engine)} failed`
              }
              className={`hidden size-2 rounded-full sm:block ${
                engineStatus === 'ready'
                  ? 'bg-emerald-500'
                  : engineStatus === 'loading'
                    ? 'animate-pulse bg-amber-400'
                    : 'bg-red-500'
              }`}
            />
            <span className="sr-only" role="status" aria-live="polite">
              {engineStatus === 'ready'
                ? `${getAnimationEngineLabel(engine)} ready`
                : engineStatus === 'loading'
                  ? `Loading ${getAnimationEngineLabel(engine)}`
                  : `${getAnimationEngineLabel(engine)} failed`}
            </span>

            {/* Compact navigation */}
            <div className="xl:hidden relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((current) => !current)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-menu"
                aria-haspopup="menu"
                className="bg-surface-2 text-text-primary text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-2 border border-border-subtle focus:ring-2 focus:ring-accent-primary outline-none min-w-28 justify-between"
              >
                <span>{getViewLabel(activeView, true)}</span>
                <ChevronDownIcon
                  className={`transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {mobileMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close navigation menu"
                    tabIndex={-1}
                    className="fixed inset-0 z-10"
                    onClick={() => setMobileMenuOpen(false)}
                  />
                  <div
                    id="mobile-navigation-menu"
                    role="menu"
                    className="absolute top-full right-0 mt-2 w-48 bg-surface-1 dark:bg-surface-2 border border-border-subtle rounded-xl shadow-xl z-20 overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <span className="px-3 pb-1 pt-2 text-[9px] font-bold uppercase tracking-widest text-text-placeholder">
                      Labs
                    </span>
                    {VIEW_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={activeView === tab.id}
                        onClick={() => {
                          setView(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${activeView === tab.id ? 'bg-accent-primary text-white' : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-6 bg-border-subtle mx-1 hidden sm:block"></div>
            <ColorToggle onToggle={cycleAccentColor} nextColor={nextAccentColor.main} />
            <ThemeToggle />
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none z-0 rounded-2xl overflow-hidden">
          <div
            ref={followerRef}
            className="absolute w-64 h-64 rounded-full mix-blend-screen dark:mix-blend-overlay pointer-events-none"
            style={{
              background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
              opacity: 0,
            }}
          />
          {[...Array(NUM_TRAIL_PARTICLES)].map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                trailRefs.current[i] = el;
              }}
              className="absolute w-32 h-32 rounded-full mix-blend-screen dark:mix-blend-overlay pointer-events-none"
              style={{
                background: 'radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)',
                opacity: 0,
              }}
            />
          ))}
        </div>
      </div>
    </header>
  );
};
