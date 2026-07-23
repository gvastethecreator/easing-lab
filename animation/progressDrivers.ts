import type { AnimationEngine } from '../types';

export interface ProgressDriver {
  play: () => void;
  pause: () => void;
  dispose: () => void;
}

interface ProgressDriverOptions {
  duration: number;
  onProgress: (progress: number) => void;
}

const MIN_DURATION_SECONDS = 0.05;

const clampProgress = (progress: number): number => Math.min(1, Math.max(0, progress));

const normalizeDuration = (duration: number): number =>
  Number.isFinite(duration) ? Math.max(MIN_DURATION_SECONDS, duration) : MIN_DURATION_SECONDS;

const createGsapDriver = async ({
  duration,
  onProgress,
}: ProgressDriverOptions): Promise<ProgressDriver> => {
  const { gsap } = await import('gsap');
  const state = { progress: 0 };
  const tween = gsap.to(state, {
    progress: 1,
    duration: normalizeDuration(duration),
    ease: 'none',
    repeat: -1,
    yoyo: true,
    paused: true,
    onUpdate: () => onProgress(clampProgress(state.progress)),
  });

  return {
    play: () => tween.play(),
    pause: () => tween.pause(),
    dispose: () => tween.kill(),
  };
};

const createMotionDriver = async ({
  duration,
  onProgress,
}: ProgressDriverOptions): Promise<ProgressDriver> => {
  const { animate } = await import('motion');
  const controls = animate(0, 1, {
    duration: normalizeDuration(duration),
    ease: 'linear',
    repeat: Infinity,
    repeatType: 'reverse',
    autoplay: false,
    onUpdate: (latest) => onProgress(clampProgress(latest)),
  });

  return {
    play: () => controls.play(),
    pause: () => controls.pause(),
    dispose: () => controls.cancel(),
  };
};

const createAnimeDriver = async ({
  duration,
  onProgress,
}: ProgressDriverOptions): Promise<ProgressDriver> => {
  const { animate } = await import('animejs');
  const state = { progress: 0 };
  const animation = animate(state, {
    progress: 1,
    duration: normalizeDuration(duration) * 1000,
    ease: 'linear',
    loop: true,
    alternate: true,
    autoplay: false,
    onUpdate: () => onProgress(clampProgress(state.progress)),
  });

  return {
    play: () => animation.play(),
    pause: () => animation.pause(),
    dispose: () => animation.cancel(),
  };
};

const createThreeDriver = async ({
  duration,
  onProgress,
}: ProgressDriverOptions): Promise<ProgressDriver> => {
  const { MathUtils, Timer } = await import('three');
  const timer = new Timer();
  timer.connect(document);
  const safeDuration = normalizeDuration(duration);
  let progress = 0;
  let direction = 1;
  let frameId: number | null = null;
  let running = false;
  let disposed = false;

  const tick = (timestamp: number) => {
    if (!running) return;

    timer.update(timestamp);
    progress += (timer.getDelta() / safeDuration) * direction;

    while (progress > 1 || progress < 0) {
      if (progress > 1) {
        progress = 2 - progress;
        direction = -1;
      } else {
        progress = -progress;
        direction = 1;
      }
    }

    onProgress(MathUtils.clamp(progress, 0, 1));
    frameId = window.requestAnimationFrame(tick);
  };

  const pause = () => {
    if (!running) return;
    running = false;
    timer.reset();
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  };

  return {
    play: () => {
      if (running || disposed) return;
      running = true;
      timer.reset();
      frameId = window.requestAnimationFrame(tick);
    },
    pause,
    dispose: () => {
      if (disposed) return;
      pause();
      timer.dispose();
      disposed = true;
    },
  };
};

/** Creates the timing driver for the selected, fixed set of animation engines. */
export const createProgressDriver = (
  engine: AnimationEngine,
  options: ProgressDriverOptions
): Promise<ProgressDriver> => {
  switch (engine) {
    case 'gsap':
      return createGsapDriver(options);
    case 'motion':
      return createMotionDriver(options);
    case 'animejs':
      return createAnimeDriver(options);
    case 'three':
      return createThreeDriver(options);
  }
};
