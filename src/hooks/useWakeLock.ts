import { useCallback, useEffect, useRef } from 'react';
import { logDevelopmentWarning } from '../lib/logger';

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
}

interface WakeLockManagerLike {
  request: (type: 'screen') => Promise<WakeLockSentinelLike>;
}

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: WakeLockManagerLike;
};

function getWakeLockManager(): WakeLockManagerLike | null {
  return (navigator as NavigatorWithWakeLock).wakeLock ?? null;
}

export function useWakeLock(enabled: boolean): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);
  const enabledRef = useRef(enabled);

  const releaseWakeLock = useCallback(async () => {
    const sentinel = sentinelRef.current;
    sentinelRef.current = null;

    if (!sentinel || sentinel.released) {
      return;
    }

    try {
      await sentinel.release();
    } catch (error) {
      logDevelopmentWarning('Could not release wake lock.', error);
    }
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!enabledRef.current || document.visibilityState !== 'visible') {
      return;
    }

    const wakeLock = getWakeLockManager();
    if (!wakeLock || sentinelRef.current) {
      return;
    }

    try {
      const sentinel = await wakeLock.request('screen');
      sentinel.addEventListener('release', () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
        }
      });
      sentinelRef.current = sentinel;
    } catch (error) {
      logDevelopmentWarning('Could not request wake lock.', error);
    }
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;

    if (enabled) {
      void requestWakeLock();
    } else {
      void releaseWakeLock();
    }

    return () => {
      void releaseWakeLock();
    };
  }, [enabled, releaseWakeLock, requestWakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabledRef.current) {
        void requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [requestWakeLock]);
}
