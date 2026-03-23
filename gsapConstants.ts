import { GSAPEasingCategory, GSAPEasingFunction } from './types';

export const GSAP_EASING_FUNCTIONS: GSAPEasingFunction[] = [
  // Power Eases
  { id: 'power0-none', name: 'Linear', category: GSAPEasingCategory.POWER, ease: 'none', description: 'Constant speed with no acceleration or deceleration.' },
  { id: 'power1-out', name: 'Quad Out', category: GSAPEasingCategory.POWER, ease: 'power1.out', description: 'Gentle deceleration, easing out of the animation.' },
  { id: 'power1-in', name: 'Quad In', category: GSAPEasingCategory.POWER, ease: 'power1.in', description: 'Gentle acceleration, easing into the animation.' },
  { id: 'power1-inOut', name: 'Quad In-Out', category: GSAPEasingCategory.POWER, ease: 'power1.inOut', description: 'Gentle acceleration and deceleration.' },
  { id: 'power2-out', name: 'Cubic Out', category: GSAPEasingCategory.POWER, ease: 'power2.out', description: 'Standard, more pronounced deceleration.' },
  { id: 'power2-in', name: 'Cubic In', category: GSAPEasingCategory.POWER, ease: 'power2.in', description: 'Standard, more pronounced acceleration.' },
  { id: 'power2-inOut', name: 'Cubic In-Out', category: GSAPEasingCategory.POWER, ease: 'power2.inOut', description: 'Standard acceleration and deceleration.' },
  { id: 'power3-out', name: 'Quart Out', category: GSAPEasingCategory.POWER, ease: 'power3.out', description: 'Strong deceleration, very noticeable.' },
  { id: 'power3-in', name: 'Quart In', category: GSAPEasingCategory.POWER, ease: 'power3.in', description: 'Strong acceleration, starts slow and finishes fast.' },
  { id: 'power3-inOut', name: 'Quart In-Out', category: GSAPEasingCategory.POWER, ease: 'power3.inOut', description: 'Strong acceleration and deceleration.' },
  { id: 'power4-out', name: 'Quint Out', category: GSAPEasingCategory.POWER, ease: 'power4.out', description: 'Extremely strong deceleration.' },
  { id: 'power4-in', name: 'Quint In', category: GSAPEasingCategory.POWER, ease: 'power4.in', description: 'Extremely strong acceleration.' },
  { id: 'power4-inOut', name: 'Quint In-Out', category: GSAPEasingCategory.POWER, ease: 'power4.inOut', description: 'Extremely strong acceleration and deceleration.' },

  // Elastic Eases
  { id: 'elastic-out', name: 'Elastic Out', category: GSAPEasingCategory.ELASTIC, ease: 'elastic.out(1, 0.3)', description: 'Overshoots and bounces back like an elastic band at the end.' },
  { id: 'elastic-in', name: 'Elastic In', category: GSAPEasingCategory.ELASTIC, ease: 'elastic.in(1, 0.3)', description: 'Bounces like an elastic band at the beginning.' },
  { id: 'elastic-inOut', name: 'Elastic In-Out', category: GSAPEasingCategory.ELASTIC, ease: 'elastic.inOut(1, 0.3)', description: 'Bounces like an elastic band at both ends.' },
  { id: 'elastic-out-soft', name: 'Soft Elastic Out', category: GSAPEasingCategory.ELASTIC, ease: 'elastic.out(1, 0.75)', description: 'A looser, more gentle elastic bounce at the end.' },
  { id: 'elastic-in-soft', name: 'Soft Elastic In', category: GSAPEasingCategory.ELASTIC, ease: 'elastic.in(1, 0.75)', description: 'A looser, more gentle elastic bounce at the start.' },
  { id: 'elastic-out-tight', name: 'Tight Elastic Out', category: GSAPEasingCategory.ELASTIC, ease: 'elastic.out(0.5, 0.2)', description: 'A tighter, faster elastic bounce at the end.' },
  { id: 'elastic-high-freq', name: 'High-Freq Elastic', category: GSAPEasingCategory.ELASTIC, ease: 'elastic.out(1, 0.1)', description: 'A very fast, high-frequency elastic bounce at the end.' },
  { id: 'elastic-slow-bouncy', name: 'Slow & Bouncy Elastic', category: GSAPEasingCategory.ELASTIC, ease: 'elastic.inOut(1.5, 0.5)', description: 'A very loose, wobbly, and pronounced elastic effect at both ends.' },
  
  // Bounce Eases
  { id: 'bounce-out', name: 'Bounce Out', category: GSAPEasingCategory.BOUNCE, ease: 'bounce.out', description: 'Bounces like a ball at the end of the animation.' },
  { id: 'bounce-in', name: 'Bounce In', category: GSAPEasingCategory.BOUNCE, ease: 'bounce.in', description: 'Bounces like a ball at the beginning of the animation.' },
  { id: 'bounce-inOut', name: 'Bounce In-Out', category: GSAPEasingCategory.BOUNCE, ease: 'bounce.inOut', description: 'Bounces like a ball at both the start and end.' },
  
  // Special Eases
  { id: 'back-out', name: 'Back Out', category: GSAPEasingCategory.SPECIAL, ease: 'back.out(1.7)', description: 'Overshoots the destination and then settles back.' },
  { id: 'back-in', name: 'Back In', category: GSAPEasingCategory.SPECIAL, ease: 'back.in(1.7)', description: 'Moves backward first, then animates forward.' },
  { id: 'back-inOut', name: 'Back In-Out', category: GSAPEasingCategory.SPECIAL, ease: 'back.inOut(1.7)', description: 'Combines the "in" and "out" back eases.' },
  { id: 'back-out-gentle', name: 'Gentle Overshoot', category: GSAPEasingCategory.SPECIAL, ease: 'back.out(1)', description: 'A subtle overshoot before settling at the destination.' },
  { id: 'back-in-strong', name: 'Strong Anticipate', category: GSAPEasingCategory.SPECIAL, ease: 'back.in(3)', description: 'Pulls back significantly before moving forward, creating strong anticipation.' },
  { id: 'slow', name: 'SlowMo', category: GSAPEasingCategory.SPECIAL, ease: 'slow(0.7, 0.7, false)', description: 'Creates a slow-motion effect in the middle of the tween.' },
  { id: 'steps', name: 'Steps', category: GSAPEasingCategory.SPECIAL, ease: 'steps(12)', description: 'Animates in a series of distinct steps or jumps.' },
  { id: 'circ-out', name: 'Circ Out', category: GSAPEasingCategory.SPECIAL, ease: 'circ.out', description: 'Circular ease; very gentle deceleration.' },
  { id: 'circ-in', name: 'Circ In', category: GSAPEasingCategory.SPECIAL, ease: 'circ.in', description: 'Circular ease; very gentle acceleration.' },
  { id: 'expo-out', name: 'Expo Out', category: GSAPEasingCategory.SPECIAL, ease: 'expo.out', description: 'Exponential ease; very abrupt, fast deceleration.' },
  { id: 'expo-in', name: 'Expo In', category: GSAPEasingCategory.SPECIAL, ease: 'expo.in', description: 'Exponential ease; very abrupt, fast acceleration.' },
  { id: 'sine-out', name: 'Sine Out', category: GSAPEasingCategory.SPECIAL, ease: 'sine.out', description: 'Sine wave ease; extremely subtle and smooth deceleration.' },
  { id: 'sine-in', name: 'Sine In', category: GSAPEasingCategory.SPECIAL, ease: 'sine.in', description: 'Sine wave ease; extremely subtle and smooth acceleration.' },
  { id: 'sine-inOut', name: 'Sine In-Out', category: GSAPEasingCategory.SPECIAL, ease: 'sine.inOut', description: 'The smoothest and most subtle acceleration and deceleration.' },
];