import { useCallback, useEffect, useMemo, useState } from 'react';
import { getWorkoutDurationSeconds, getWorkoutSteps, WORKOUT_PLAN } from './data/training';
import { useAbsoluteTimer } from './hooks/useAbsoluteTimer';
import { useWakeLock } from './hooks/useWakeLock';
import {
  addWorkoutCompletion,
  createWorkoutCompletion,
  loadWorkoutHistory,
  saveWorkoutHistory
} from './lib/history';
import { getRemainingMsFromEndTime } from './lib/timer';
import { calculateStreakStats } from './lib/streak';
import { playTone, type ToneKind } from './lib/audio';
import { speakSwedish, warmUpSpeechVoices } from './lib/speech';
import { vibrate } from './lib/vibration';
import type { SpeechCue, WorkoutCompletion } from './types';
import { HomeView } from './components/HomeView';
import { TimerView } from './components/TimerView';
import { SwitchLegView } from './components/SwitchLegView';
import { FinishView } from './components/FinishView';

type FlowScreen = 'home' | 'timer' | 'switch-leg' | 'finished';

const steps = getWorkoutSteps(WORKOUT_PLAN);
const workoutDurationSeconds = getWorkoutDurationSeconds(WORKOUT_PLAN);

function sendFeedback(
  message: SpeechCue,
  tone: ToneKind,
  vibrationPattern: number | number[]
): void {
  speakSwedish(message);
  playTone(tone);
  vibrate(vibrationPattern);
}

function getSafeStep(index: number) {
  return steps[Math.min(Math.max(index, 0), steps.length - 1)];
}

export default function App() {
  const [history, setHistory] = useState<WorkoutCompletion[]>(() => loadWorkoutHistory());
  const [screen, setScreen] = useState<FlowScreen>('home');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseStartToken, setPhaseStartToken] = useState(0);
  const [switchRemainingSeconds, setSwitchRemainingSeconds] = useState(3);
  const [liveMessage, setLiveMessage] = useState('Kotten är redo.');

  const currentStep = getSafeStep(phaseIndex);
  const stats = useMemo(() => calculateStreakStats(history), [history]);

  const completeWorkout = useCallback(() => {
    const completion = createWorkoutCompletion(
      new Date(),
      workoutDurationSeconds,
      WORKOUT_PLAN.version
    );
    const nextHistory = addWorkoutCompletion(history, completion);
    setHistory(nextHistory);
    saveWorkoutHistory(nextHistory);
    setScreen('finished');
  }, [history]);

  const completePhase = useCallback(() => {
    const step = getSafeStep(phaseIndex);
    setLiveMessage(step.phase.completionSpeech);

    if (step.phase.completionSpeech === 'Passet är klart') {
      sendFeedback('Passet är klart', 'done', [80, 40, 80]);
    } else if (step.phase.completionSpeech === 'Byt ben') {
      sendFeedback('Byt ben', 'notice', [80]);
    } else {
      sendFeedback('Övningen är klar', 'done', [60, 30, 60]);
    }

    if (step.phase.transition?.kind === 'auto-countdown-to-next-phase') {
      setSwitchRemainingSeconds(step.phase.transition.countdownSeconds);
      setScreen('switch-leg');
      return;
    }

    if (step.isLastPhase) {
      completeWorkout();
      return;
    }

    const nextIndex = Math.min(phaseIndex + 1, steps.length - 1);
    setPhaseIndex(nextIndex);
    setPhaseStartToken((token) => token + 1);
    setScreen('timer');
  }, [completeWorkout, phaseIndex]);

  const {
    state: timerState,
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
    stop: stopTimer
  } = useAbsoluteTimer(completePhase);
  useWakeLock(timerState.status === 'running');

  useEffect(() => {
    warmUpSpeechVoices();
  }, []);

  const startWorkout = useCallback(() => {
    setPhaseIndex(0);
    setSwitchRemainingSeconds(3);
    setPhaseStartToken((token) => token + 1);
    setScreen('timer');
  }, []);

  useEffect(() => {
    if (screen !== 'timer') {
      return;
    }

    const step = getSafeStep(phaseIndex);
    setLiveMessage(step.phase.instruction);
    sendFeedback(step.phase.startSpeech, 'start', 40);
    startTimer(step.phase.durationSeconds * 1000);
  }, [phaseIndex, phaseStartToken, screen, startTimer]);

  const abortWorkout = useCallback(() => {
    stopTimer();
    setScreen('home');
    setPhaseIndex(0);
    setSwitchRemainingSeconds(3);
    setLiveMessage('Passet avbröts.');
  }, [stopTimer]);

  const returnHome = useCallback(() => {
    stopTimer();
    setScreen('home');
    setPhaseIndex(0);
    setLiveMessage('Kotten är redo.');
  }, [stopTimer]);

  useEffect(() => {
    if (screen !== 'switch-leg') {
      return undefined;
    }

    const transition = currentStep.phase.transition;
    if (!transition) {
      return undefined;
    }

    const endTimeMs = Date.now() + transition.countdownSeconds * 1000;

    const tick = () => {
      const remainingMs = getRemainingMsFromEndTime(endTimeMs, Date.now());
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      setSwitchRemainingSeconds(Math.max(0, remainingSeconds));

      if (remainingMs === 0) {
        window.clearInterval(intervalId);
        const nextIndex = Math.min(phaseIndex + 1, steps.length - 1);
        setPhaseIndex(nextIndex);
        setPhaseStartToken((token) => token + 1);
        setScreen('timer');
      }
    };

    const intervalId = window.setInterval(tick, 100);
    tick();
    return () => window.clearInterval(intervalId);
  }, [currentStep, phaseIndex, screen]);

  const renderScreen = () => {
    if (screen === 'home') {
      return <HomeView stats={stats} onStart={startWorkout} />;
    }

    if (screen === 'timer') {
      return (
        <TimerView
          step={currentStep}
          timer={timerState}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onAbort={abortWorkout}
        />
      );
    }

    if (screen === 'switch-leg') {
      return (
        <SwitchLegView
          step={currentStep}
          remainingSeconds={switchRemainingSeconds}
          onAbort={abortWorkout}
        />
      );
    }

    return <FinishView onHome={returnHome} />;
  };

  return (
    <>
      <div className="live-region" aria-live="assertive" aria-atomic="true">
        {liveMessage}
      </div>
      {renderScreen()}
    </>
  );
}
