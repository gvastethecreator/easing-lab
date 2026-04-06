import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ColorToggle } from "./ColorToggle";
import { ThemeToggle } from "./ThemeToggle";
import { PlayIcon, PauseIcon, ChevronDownIcon } from "./Icons";
import { useTheme } from "../contexts/ThemeContext";
import type { View } from "../types";

interface HeaderProps {
  activeView: View;
  setView: (view: View) => void;
  progressRef: React.MutableRefObject<{ progress: number }>;
  isPlaying: boolean;
  togglePlay: () => void;
}

const NavButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({
  label,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-surface-base focus:ring-accent-primary overflow-hidden ${
      isActive
        ? "text-white shadow-md bg-accent-primary"
        : "text-text-secondary hover:bg-surface-2 dark:hover:bg-surface-2 hover:text-text-primary"
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
    onClick={onClick}
    className="p-2 rounded-full bg-surface-2 dark:bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
    title={isPlaying ? "Pause Animation" : "Play Animation"}
  >
    {isPlaying ? <PauseIcon /> : <PlayIcon />}
  </button>
);

const NUM_TRAIL_PARTICLES = 6;

const isDefined = <T,>(value: T | null): value is T => value !== null;

const getNumericGsapProperty = (target: gsap.TweenTarget, property: string): number => {
  const value = gsap.getProperty(target, property);
  if (typeof value === "number") {
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
}) => {
  const { cycleAccentColor, nextAccentColor } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mousePos = useRef({ x: 0, y: 0 });
  const isInside = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const follower = followerRef.current;
    if (!container || !follower) return;

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

      const followerXTo = gsap.quickTo(follower, "x", { duration: 0.6, ease: "power3.out" });
      const followerYTo = gsap.quickTo(follower, "y", { duration: 0.6, ease: "power3.out" });

      const trailXTo = trail.map((p, i) =>
        gsap.quickTo(p, "x", { duration: 0.6 + (i + 1) * 0.05, ease: "power3.out" }),
      );
      const trailYTo = trail.map((p, i) =>
        gsap.quickTo(p, "y", { duration: 0.6 + (i + 1) * 0.05, ease: "power3.out" }),
      );

      const tickerFunc = () => {
        if (!container.isConnected || !follower.isConnected) {
          return;
        }
        const currentStandby = { x: container.offsetWidth - 40, y: container.offsetHeight / 2 };
        const target = isInside.current ? mousePos.current : currentStandby;

        followerXTo(target.x);
        followerYTo(target.y);

        const leaderX = getNumericGsapProperty(follower, "x");
        const leaderY = getNumericGsapProperty(follower, "y");

        trail.forEach((_, i) => {
          trailXTo[i](leaderX);
          trailYTo[i](leaderY);
        });

        const prog = progressRef.current.progress;
        const pulse = 1 + Math.sin(prog * Math.PI) * 0.2;
        const blur = isInside.current ? 0 : 4 * (1 - prog);

        if (isInside.current) {
          gsap.set(follower, { scale: 1, filter: "blur(0px)" });
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

    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("mousemove", onMouseMove);

    return () => {
      gsap.killTweensOf([follower, ...trailRefs.current.filter(isDefined)]);
      ctx.revert();
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("mousemove", onMouseMove);
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
                EASY<span className="text-accent-primary">EASING</span>
              </h1>
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest opacity-60 -mt-1 hidden sm:block">
                Motion Library
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1 p-1 bg-surface-2/50 dark:bg-surface-1/30 rounded-xl border border-border-subtle">
              <NavButton
                label="Cubic Bezier"
                isActive={activeView === "cubic"}
                onClick={() => setView("cubic")}
              />
              <NavButton
                label="GSAP Gallery"
                isActive={activeView === "gsap"}
                onClick={() => setView("gsap")}
              />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <PlayPauseButton isPlaying={isPlaying} onClick={togglePlay} />

            {/* Mobile Dropdown */}
            <div className="md:hidden relative">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="bg-surface-2 text-text-primary text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-2 border border-border-subtle focus:ring-2 focus:ring-accent-primary outline-none min-w-25 justify-between"
              >
                <span>{activeView === "cubic" ? "Cubic" : "GSAP"}</span>
                <ChevronDownIcon
                  className={`transition-transform duration-200 ${mobileMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {mobileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMobileMenuOpen(false)}
                  ></div>
                  <div className="absolute top-full right-0 mt-2 w-32 bg-surface-1 dark:bg-surface-2 border border-border-subtle rounded-xl shadow-xl z-20 overflow-hidden flex flex-col p-1 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => {
                        setView("cubic");
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${activeView === "cubic" ? "bg-accent-primary text-white" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"}`}
                    >
                      Cubic Bezier
                    </button>
                    <button
                      onClick={() => {
                        setView("gsap");
                        setMobileMenuOpen(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${activeView === "gsap" ? "bg-accent-primary text-white" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"}`}
                    >
                      GSAP Gallery
                    </button>
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
              background: "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)",
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
                background: "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)",
                opacity: 0,
              }}
            />
          ))}
        </div>
      </div>
    </header>
  );
};
