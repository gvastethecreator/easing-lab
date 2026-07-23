import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnimationEngine } from '../types';
import { createProgressDriver } from './progressDrivers';

const mocks = vi.hoisted(() => ({
  gsap: {
    play: vi.fn(),
    pause: vi.fn(),
    kill: vi.fn(),
  },
  motion: {
    play: vi.fn(),
    pause: vi.fn(),
    cancel: vi.fn(),
  },
  anime: {
    play: vi.fn(),
    pause: vi.fn(),
    cancel: vi.fn(),
  },
}));

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn((target: { progress: number }, options: { onUpdate: () => void }) => {
      target.progress = 0.5;
      options.onUpdate();
      return mocks.gsap;
    }),
  },
}));

vi.mock('motion', () => ({
  animate: vi.fn(
    (_from: number, _to: number, options: { onUpdate: (progress: number) => void }) => {
      options.onUpdate(0.5);
      return mocks.motion;
    }
  ),
}));

vi.mock('animejs', () => ({
  animate: vi.fn((target: { progress: number }, options: { onUpdate: () => void }) => {
    target.progress = 0.5;
    options.onUpdate();
    return mocks.anime;
  }),
}));

vi.mock('three', () => ({
  Timer: class {
    connect = vi.fn();
    reset = vi.fn();
    update = vi.fn();
    getDelta = vi.fn(() => 0.25);
    dispose = vi.fn();
  },
  MathUtils: {
    clamp: (value: number, minimum: number, maximum: number) =>
      Math.min(maximum, Math.max(minimum, value)),
  },
}));

describe('createProgressDriver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['gsap', mocks.gsap.play, mocks.gsap.pause, mocks.gsap.kill],
    ['motion', mocks.motion.play, mocks.motion.pause, mocks.motion.cancel],
    ['animejs', mocks.anime.play, mocks.anime.pause, mocks.anime.cancel],
  ] satisfies Array<
    [AnimationEngine, typeof mocks.gsap.play, typeof mocks.gsap.pause, typeof mocks.gsap.kill]
  >)('normaliza el ciclo de vida de %s', async (engine, play, pause, dispose) => {
    const onProgress = vi.fn();
    const driver = await createProgressDriver(engine, { duration: 1, onProgress });

    expect(onProgress).toHaveBeenCalledWith(0.5);
    driver.play();
    driver.pause();
    driver.dispose();

    expect(play).toHaveBeenCalledOnce();
    expect(pause).toHaveBeenCalledOnce();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it('usa el reloj de Three.js y cancela su frame al pausar', async () => {
    const scheduledFrame: { current: FrameRequestCallback | null } = { current: null };
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      scheduledFrame.current = callback;
      return 17;
    });
    const cancelAnimationFrame = vi.fn();
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame);

    const onProgress = vi.fn();
    const driver = await createProgressDriver('three', { duration: 1, onProgress });

    driver.play();
    expect(requestAnimationFrame).toHaveBeenCalledOnce();
    expect(scheduledFrame.current).not.toBeNull();
    if (!scheduledFrame.current) throw new Error('Expected a scheduled frame.');
    scheduledFrame.current(0);
    expect(onProgress).toHaveBeenCalledWith(0.25);

    driver.pause();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(17);
  });
});
