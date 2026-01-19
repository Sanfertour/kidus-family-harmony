// src/utils/haptics.ts
export const triggerHaptic = (type: 'soft' | 'medium' | 'error' = 'soft') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    switch (type) {
      case 'soft':
        navigator.vibrate(50);
        break;
      case 'medium':
        navigator.vibrate([100, 30, 100]);
        break;
      case 'error':
        navigator.vibrate([300, 100, 300]);
        break;
    }
  }
};
