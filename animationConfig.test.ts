import { describe, expect, it } from 'vitest';
import { VIEW_TABS, getAnimationEngineLabel } from './animationConfig';

describe('animationConfig', () => {
  it('mantiene una tab dedicada para cada motor', () => {
    expect(VIEW_TABS.map((tab) => tab.id)).toEqual(['cubic', 'gsap', 'motion', 'animejs', 'three']);
    expect(getAnimationEngineLabel('three')).toBe('Three.js');
  });
});
