import { logDevelopmentWarning } from './logger';

export function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    logDevelopmentWarning(`Could not read localStorage key "${key}".`, error);
    return null;
  }
}

export function writeLocalStorage(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    logDevelopmentWarning(`Could not write localStorage key "${key}".`, error);
    return false;
  }
}
