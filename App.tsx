import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { Header } from './components/Header';
import { CubicBezierView } from './views/CubicBezierView';
import { GSAPView } from './views/GSAPView';
import { Footer } from './components/Footer';
import type { View, PathPoint, Point } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>('cubic');
  const [isPlaying, setIsPlaying] = useState(true);

  // Centralized state for cubic bezier and animation params
  const [p1, setP1] = useState<Point>({ x: 0.645, y: 0.045 });
  const [p2, setP2] = useState<Point>({ x: 0.355, y: 1 });
  const [duration, setDuration] = useState(1.5);
  const [range, setRange] = useState(1);

  // Single source of truth for animation progress
  const progressRef = useRef({ progress: 0 });
  const masterTweenRef = useRef<gsap.core.Tween | null>(null);

  // State for the multipoint GSAP ease
  const [gsapPoints, setGsapPoints] = useState<PathPoint[]>([
    { x: 0, y: 0, handle2: { x: 0.34, y: 0 } },
    { x: 1, y: 1, handle1: { x: 0.66, y: 1 } },
  ]);

  const customEaseId = 'custom-gsap-ease';

  // Master Animation Logic
  useEffect(() => {
    const currentEase = `cubic-bezier(${p1.x}, ${p1.y}, ${p2.x}, ${p2.y})`;

    // Kill previous tween
    if (masterTweenRef.current) {
      masterTweenRef.current.kill();
    }

    // Create master tween
    masterTweenRef.current = gsap.fromTo(
      progressRef.current,
      { progress: 0 },
      {
        progress: 1,
        duration: duration,
        ease: currentEase,
        repeat: -1,
        yoyo: true,
        paused: !isPlaying,
        onUpdate: () => {
          // Clamp values for safety
          if (progressRef.current.progress > 1) progressRef.current.progress = 1;
          if (progressRef.current.progress < 0) progressRef.current.progress = 0;
        },
      }
    );

    // Update global CSS vars for components relying on CSS transitions matching the GSAP tween
    const root = document.documentElement;
    root.style.setProperty('--global-duration', `${duration}s`);
    root.style.setProperty('--global-easing', currentEase);

    return () => {
      masterTweenRef.current?.kill();
    };
  }, [p1, p2, duration]);

  // Handle Play/Pause efficiently
  useEffect(() => {
    if (masterTweenRef.current) {
      if (isPlaying) {
        masterTweenRef.current.play();
      } else {
        masterTweenRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Generate CustomEase when points change
  useEffect(() => {
    const pathParts: string[] = [`M ${gsapPoints[0].x},${gsapPoints[0].y}`];

    for (let i = 0; i < gsapPoints.length - 1; i++) {
      const start = gsapPoints[i];
      const end = gsapPoints[i + 1];

      if (start.handle2 && end.handle1) {
        pathParts.push(
          `C ${start.handle2.x},${start.handle2.y} ${end.handle1.x},${end.handle1.y} ${end.x},${end.y}`
        );
      } else {
        pathParts.push(`L ${end.x},${end.y}`);
      }
    }

    const pathString = pathParts.join(' ');
    CustomEase.create(customEaseId, pathString);
  }, [gsapPoints, customEaseId]);

  return (
    <div className="min-h-screen font-sans flex flex-col selection:bg-accent-primary-bg selection:text-accent-primary transition-colors duration-300">
      <Header
        activeView={view}
        setView={setView}
        progressRef={progressRef}
        isPlaying={isPlaying}
        togglePlay={() => setIsPlaying(!isPlaying)}
      />
      <main className="p-4 flex-grow w-full max-w-[1920px] mx-auto animate-in fade-in duration-500">
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
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
