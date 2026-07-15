import type { SpeechCue } from '../types';
import { logDevelopmentWarning } from './logger';

function getSpeechSynthesis(): SpeechSynthesis | null {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    return null;
  }

  return window.speechSynthesis;
}

const playfulVoiceNameHints = ['alva', 'maja', 'klara', 'sara', 'sofie', 'female', 'enhanced'];

function getVoiceScore(voice: SpeechSynthesisVoice): number {
  const language = voice.lang.toLowerCase();
  const name = voice.name.toLowerCase();

  if (!language.startsWith('sv')) {
    return -1;
  }

  let score = 10;

  if (language === 'sv-se') {
    score += 6;
  }

  if (voice.localService) {
    score += 2;
  }

  if (playfulVoiceNameHints.some((hint) => name.includes(hint))) {
    score += 5;
  }

  return score;
}

function findSwedishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices
    .map((voice) => ({ voice, score: getVoiceScore(voice) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score)[0]?.voice;
}

function getPlayfulSpeechText(text: SpeechCue): string {
  if (text === 'Start') {
    return 'Nu kör vi!';
  }

  if (text === 'Byt ben') {
    return 'Byt ben!';
  }

  if (text === 'Övningen är klar') {
    return 'Heja, nästa!';
  }

  return 'Klart, toppen!';
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

    const utterance = new SpeechSynthesisUtterance(getPlayfulSpeechText(text));
    const swedishVoice = findSwedishVoice(synthesis.getVoices());

    utterance.lang = swedishVoice?.lang ?? 'sv-SE';
    utterance.rate = 1.08;
    utterance.pitch = 1.45;
    utterance.volume = 1;

    if (swedishVoice) {
      utterance.voice = swedishVoice;
    }

    synthesis.cancel();
    synthesis.speak(utterance);
  } catch (error) {
    logDevelopmentWarning('Could not use speech synthesis.', error);
  }
}
