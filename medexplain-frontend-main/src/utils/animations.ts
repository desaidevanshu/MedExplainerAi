import anime from 'animejs';

export type AnimeInstance = anime.AnimeInstance;

/**
 * Checks if the user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Subtle page entrance animation
 */
export const animatePageEntrance = (
  target: HTMLElement | string | null,
  options: { delay?: number; duration?: number } = {}
): anime.AnimeInstance | null => {
  if (!target || prefersReducedMotion()) return null;

  try {
    return anime({
      targets: target,
      opacity: [0, 1],
      translateY: [12, 0],
      duration: options.duration || 320,
      delay: options.delay || 0,
      easing: 'easeOutCubic',
    });
  } catch {
    return null;
  }
};

/**
 * Staggered cards / list items entrance
 */
export const animateStaggeredCards = (
  targets: HTMLElement[] | string,
  options: { delay?: number; stagger?: number; duration?: number } = {}
): anime.AnimeInstance | null => {
  if (prefersReducedMotion()) return null;

  try {
    return anime({
      targets,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: options.duration || 300,
      delay: anime.stagger(options.stagger || 45, { start: options.delay || 40 }),
      easing: 'easeOutCubic',
    });
  } catch {
    return null;
  }
};

/**
 * Smooth number count-up animation
 */
export const animateNumberCount = (
  element: HTMLElement | null,
  targetValue: number,
  duration: number = 600
): anime.AnimeInstance | null => {
  if (!element) return null;

  if (prefersReducedMotion()) {
    element.textContent = targetValue.toString();
    return null;
  }

  const obj = { count: 0 };
  try {
    return anime({
      targets: obj,
      count: targetValue,
      round: 1,
      duration,
      easing: 'easeOutQuad',
      update: () => {
        if (element) {
          element.textContent = obj.count.toString();
        }
      },
    });
  } catch {
    element.textContent = targetValue.toString();
    return null;
  }
};

/**
 * Smooth card expansion
 */
export const animateAccordion = (
  target: HTMLElement | null,
  isOpening: boolean,
  duration: number = 240
): anime.AnimeInstance | null => {
  if (!target || prefersReducedMotion()) return null;

  try {
    if (isOpening) {
      target.style.display = 'block';
      const height = target.scrollHeight;
      target.style.height = '0px';
      target.style.opacity = '0';

      return anime({
        targets: target,
        height: [0, height],
        opacity: [0, 1],
        duration,
        easing: 'easeOutCubic',
        complete: () => {
          if (target) target.style.height = 'auto';
        },
      });
    } else {
      return anime({
        targets: target,
        height: 0,
        opacity: 0,
        duration: duration * 0.8,
        easing: 'easeInCubic',
        complete: () => {
          if (target) target.style.display = 'none';
        },
      });
    }
  } catch {
    target.style.display = isOpening ? 'block' : 'none';
    return null;
  }
};

/**
 * Subtle pulse for processing indicator
 */
export const animateProcessingPulse = (
  target: HTMLElement | string | null
): anime.AnimeInstance | null => {
  if (!target || prefersReducedMotion()) return null;

  try {
    return anime({
      targets: target,
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
      duration: 1800,
      loop: true,
      easing: 'easeInOutSine',
    });
  } catch {
    return null;
  }
};

/**
 * Chat message entrance
 */
export const animateChatMessage = (
  target: HTMLElement | string | null
): anime.AnimeInstance | null => {
  if (!target || prefersReducedMotion()) return null;

  try {
    return anime({
      targets: target,
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 250,
      easing: 'easeOutQuad',
    });
  } catch {
    return null;
  }
};

/**
 * Safe cleanup of Anime.js instance
 */
export const cleanupAnimation = (anim: anime.AnimeInstance | null | undefined): void => {
  if (anim && typeof anim.pause === 'function') {
    anim.pause();
  }
};
