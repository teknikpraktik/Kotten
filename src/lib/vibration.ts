import { logDevelopmentWarning } from './logger';

export function vibrate(pattern: number | number[]): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    logDevelopmentWarning('Could not use vibration feedback.', error);
  }
}
