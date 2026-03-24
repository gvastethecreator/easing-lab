import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { CubicBezierView } from './views/CubicBezierView';
import { GSAPView } from './views/GSAPView';
import { Footer } from './components/Footer';
import type { View, PathPoint, Point } from './types';
import {
  createDefaultBezierP1,
  createDefaultBezierP2,
  createDefaultGsapPoints,
  CUSTOM_GSAP_EASE_ID,
  DEFAULT_DURATION,
  DEFAULT_RANGE,
} from './animationConfig';
import { useMasterProgressAnimation } from './hooks/useMasterProgressAnimation';
import { useRegisterCustomEase } from './hooks/useRegisterCustomEase';

const App: React.FC = () => {
  const [view, setView] = useState<View>('cubic');
  const [isPlaying, setIsPlaying] = useState(true);

  // Centralized state for cubic bezier and animation params
  const [p1, setP1] = useState<Point>(() => createDefaultBezierP1());
  const [p2, setP2] = useState<Point>(() => createDefaultBezierP2());
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [range, setRange] = useState(DEFAULT_RANGE);

  // Single source of truth for animation progress
  const progressRef = useRef({ progress: 0 });

  // State for the multipoint GSAP ease
  const [gsapPoints, setGsapPoints] = useState<PathPoint[]>(() => createDefaultGsapPoints());

  const customEaseId = CUSTOM_GSAP_EASE_ID;

  useMasterProgressAnimation({ progressRef, p1, p2, duration, isPlaying });
  useRegisterCustomEase({ customEaseId, points: gsapPoints });

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
