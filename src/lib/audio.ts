import { logDevelopmentWarning } from './logger';

export type CueKind = 'step' | 'done';

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const AudioContextConstructor =
    window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;

  if (!AudioContextConstructor) {
    return null;
  }

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextConstructor();
  }

  return sharedAudioContext;
}

export function unlockAudio(): void {
  try {
    void getAudioContext()?.resume();
  } catch (error) {
    logDevelopmentWarning('Could not unlock audio context.', error);
  }
}

export function playCue(kind: CueKind, enabled: boolean): void {
  if (!enabled) {
    return;
  }

  try {
    const context = getAudioContext();

    if (!context) {
      return;
    }

    void context.resume();

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const frequency = kind === 'done' ? 760 : 560;
    const duration = kind === 'done' ? 0.18 : 0.11;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  } catch (error) {
    logDevelopmentWarning('Could not play audio cue.', error);
  }
}
