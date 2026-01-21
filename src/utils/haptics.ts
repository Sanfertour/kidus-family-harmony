// src/utils/haptics.ts
export type HapticType = 'soft' | 'medium' | 'error' | 'success' | 'warning';

export const triggerHaptic = (type: HapticType = 'soft') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    switch (type) {
      case 'soft':
        navigator.vibrate(20);
        break;
      case 'medium':
        navigator.vibrate(50);
        break;
      case 'success':
        navigator.vibrate([10, 30, 10]);
        break;
      case 'warning':
        navigator.vibrate(80);
        break;
      case 'error':
        navigator.vibrate([100, 50, 100]);
        break;
      default:
        navigator.vibrate(20);
    }
  }
};
