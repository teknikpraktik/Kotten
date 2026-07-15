import type { SpeechCue } from '../types';
import { logDevelopmentWarning } from './logger';

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    return null;
  }

  return window.speechSynthesis;
}

function findSwedishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices.find((voice) => voice.lang.toLowerCase().startsWith('sv'));
}

export function warmUpSpeechVoices(): void {
  try {
    getSpeechSynthesis()?.getVoices();
  } catch (error) {
    logDevelopmentWarning('Could not load speech synthesis voices.', error);
  }
}

export function speakSwedish(text: SpeechCue): void {
  try {
    const synthesis = getSpeechSynthesis();

    if (!synthesis) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const swedishVoice = findSwedishVoice(synthesis.getVoices());

    utterance.lang = swedishVoice?.lang ?? 'sv-SE';
    utterance.rate = 0.92;
    utterance.pitch = 1;

    if (swedishVoice) {
      utterance.voice = swedishVoice;
    }

    synthesis.cancel();
    synthesis.speak(utterance);
  } catch (error) {
    logDevelopmentWarning('Could not use speech synthesis.', error);
  }
}
