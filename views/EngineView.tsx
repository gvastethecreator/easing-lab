import React, { useMemo, useState } from "react";
import { CurveEditor } from "../components/CurveEditor";
import { EasingPresetBrowser } from "../components/EasingPresetBrowser";
import { getAnimationEngineLabel } from "../animationConfig";
import type { AnimationEngine, Point } from "../types";

type DedicatedEngine = Exclude<AnimationEngine, "gsap">;

interface EngineViewProps {
  engine: DedicatedEngine;
  p1: Point;
  setP1: React.Dispatch<React.SetStateAction<Point>>;
  p2: Point;
  setP2: React.Dispatch<React.SetStateAction<Point>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  range: number;
  setRange: React.Dispatch<React.SetStateAction<number>>;
  progressRef: React.MutableRefObject<{ progress: number }>;
}

const ENGINE_DETAILS: Record<
  DedicatedEngine,
  {
    description: string;
    docsUrl: string;
    timing: string;
    rendering: string;
  }
> = {
  motion: {
    description: "Run cubic-bezier easing through Motion numeric animation controls.",
    docsUrl: "https://motion.dev/docs/animate",
    timing: "Seconds with reverse repeats",
    rendering: "DOM preview driven by normalized progress",
  },
  animejs: {
    description: "Run cubic-bezier easing through Anime.js 4 alternate loops.",
    docsUrl: "https://animejs.com/documentation/animation/",
    timing: "Milliseconds with alternate loops",
    rendering: "DOM preview driven by normalized progress",
  },
  three: {
    description: "Drive a WebGL scene with Three.js Timer and renderer lifecycle controls.",
    docsUrl: "https://threejs.org/docs/pages/Timer.html",
    timing: "Frame delta from Three.js Timer",
    rendering: "WebGLRenderer with explicit cleanup",
  },
};

const createCode = (engine: DedicatedEngine, p1: Point, p2: Point, duration: number): string => {
  const curve = `${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)}, ${p2.y.toFixed(2)}`;

  switch (engine) {
    case "motion":
      return `import { animate } from 'motion';\n\nanimate(\n  element,\n  { x: 320 },\n  { duration: ${duration.toFixed(1)}, ease: [${curve}] }\n);`;
    case "animejs":
      return `import { animate, cubicBezier } from 'animejs';\n\nanimate(element, {\n  x: 320,\n  duration: ${Math.round(duration * 1000)},\n  ease: cubicBezier(${curve}),\n});`;
    case "three":
      return `import { Timer } from 'three';\n\nconst timer = new Timer();\ntimer.connect(document);\n\nrenderer.setAnimationLoop((time) => {\n  timer.update(time);\n  progress += timer.getDelta() / ${duration.toFixed(1)};\n  mesh.position.x = ease(progress) * 3.2;\n  renderer.render(scene, camera);\n});`;
  }
};

export const EngineView: React.FC<EngineViewProps> = ({
  engine,
  p1,
  setP1,
  p2,
  setP2,
  duration,
  setDuration,
  range,
  setRange,
  progressRef,
}) => {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const details = ENGINE_DETAILS[engine];
  const label = getAnimationEngineLabel(engine);
  const code = useMemo(() => createCode(engine, p1, p2, duration), [duration, engine, p1, p2]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("error");
    }
  };

  const selectCurve = (bezier: [number, number, number, number]) => {
    setP1({ x: bezier[0], y: bezier[1] });
    setP2({ x: bezier[2], y: bezier[3] });
    if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12">
        <aside className="lg:col-span-1" aria-label={`${label} curve editor`}>
          <div className="lg:sticky lg:top-28">
            <CurveEditor
              p1={p1}
              setP1={setP1}
              p2={p2}
              setP2={setP2}
              duration={duration}
              setDuration={setDuration}
              range={range}
              setRange={setRange}
              progressRef={progressRef}
              engine={engine}
            />
          </div>
        </aside>

        <section className="lg:col-span-2" aria-labelledby={`${engine}-engine-title`}>
          <div className="flex flex-col gap-8">
            <div className="rounded-2xl border border-border-subtle bg-surface-1 p-5 sm:p-7 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border-subtle pb-5">
                <div className="max-w-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-primary">
                    Animation engine
                  </span>
                  <h2
                    id={`${engine}-engine-title`}
                    className="mt-1 text-2xl font-black text-text-primary"
                  >
                    {label}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {details.description}
                  </p>
                </div>
                <a
                  href={details.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border-subtle bg-surface-2 px-3 py-2 text-xs font-bold text-text-secondary transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  Official docs
                </a>
              </div>

              <dl className="grid gap-3 py-5 sm:grid-cols-3">
                <div className="rounded-xl bg-surface-2 p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                    Package
                  </dt>
                  <dd className="mt-1 font-mono text-sm text-text-primary">{engine}</dd>
                </div>
                <div className="rounded-xl bg-surface-2 p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                    Timing
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary">{details.timing}</dd>
                </div>
                <div className="rounded-xl bg-surface-2 p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-text-placeholder">
                    Output
                  </dt>
                  <dd className="mt-1 text-sm text-text-primary">{details.rendering}</dd>
                </div>
              </dl>

              <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
                <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Current curve
                  </span>
                  <button
                    type="button"
                    onClick={() => void copyCode()}
                    className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-primary hover:bg-accent-primary/10 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  >
                    {copyState === "copied"
                      ? "Copied"
                      : copyState === "error"
                        ? "Copy failed"
                        : "Copy code"}
                  </button>
                </div>
                <pre className="overflow-x-auto p-4 text-xs leading-6 text-text-secondary">
                  <code>{code}</code>
                </pre>
              </div>
            </div>

            <div aria-label={`${label} easing cards`}>
              <EasingPresetBrowser p1={p1} p2={p2} onSelect={selectCurve} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
