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
import { PrepareView } from './components/PrepareView';
import { TimerView } from './components/TimerView';
import { SwitchLegView } from './components/SwitchLegView';
import { ExerciseCompleteView } from './components/ExerciseCompleteView';
import { FinishView } from './components/FinishView';

type FlowScreen = 'home' | 'prepare' | 'timer' | 'switch-leg' | 'exercise-complete' | 'finished';

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

function getFirstStepIndexForExercise(exerciseIndex: number): number {
  const safeExerciseIndex = Math.min(Math.max(exerciseIndex, 0), WORKOUT_PLAN.exercises.length - 1);
  const stepIndex = steps.findIndex((step) => step.exerciseIndex === safeExerciseIndex);
  return stepIndex >= 0 ? stepIndex : 0;
}

export default function App() {
  const [history, setHistory] = useState<WorkoutCompletion[]>(() => loadWorkoutHistory());
  const [screen, setScreen] = useState<FlowScreen>('home');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [switchRemainingSeconds, setSwitchRemainingSeconds] = useState(3);
  const [liveMessage, setLiveMessage] = useState('Kotten är redo.');

  const currentStep = getSafeStep(phaseIndex);
  const stats = useMemo(() => calculateStreakStats(history), [history]);
  const canGoPreviousExercise = currentStep.exerciseIndex > 0;
  const canGoNextExercise = currentStep.exerciseIndex < WORKOUT_PLAN.exercises.length - 1;

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

    setScreen('exercise-complete');
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
    setScreen('prepare');
    setLiveMessage('Gör dig redo.');
  }, []);

  const startCurrentPhase = useCallback(() => {
    const step = getSafeStep(phaseIndex);
    setScreen('timer');
    setLiveMessage(step.phase.instruction);
    sendFeedback(step.phase.startSpeech, 'start', 40);
    startTimer(step.phase.durationSeconds * 1000);
  }, [phaseIndex, startTimer]);

  const abortWorkout = useCallback(() => {
    stopTimer();
    setScreen('home');
    setPhaseIndex(0);
    setSwitchRemainingSeconds(3);
    setLiveMessage('Passet avbröts.');
  }, [stopTimer]);

  const jumpToExercise = useCallback(
    (exerciseIndex: number) => {
      stopTimer();
      setPhaseIndex(getFirstStepIndexForExercise(exerciseIndex));
      setSwitchRemainingSeconds(3);
      setScreen('prepare');
      setLiveMessage('Gör dig redo.');
    },
    [stopTimer]
  );

  const goToPreviousExercise = useCallback(() => {
    jumpToExercise(currentStep.exerciseIndex - 1);
  }, [currentStep.exerciseIndex, jumpToExercise]);

  const goToNextExercise = useCallback(() => {
    jumpToExercise(currentStep.exerciseIndex + 1);
  }, [currentStep.exerciseIndex, jumpToExercise]);

  const continueToNextExercise = useCallback(() => {
    const nextIndex = Math.min(phaseIndex + 1, steps.length - 1);
    setPhaseIndex(nextIndex);
    setScreen('prepare');
    setLiveMessage('Gör dig redo för nästa övning.');
  }, [phaseIndex]);

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
        setScreen('timer');
        const nextStep = getSafeStep(nextIndex);
        setLiveMessage(nextStep.phase.instruction);
        sendFeedback(nextStep.phase.startSpeech, 'start', 40);
        startTimer(nextStep.phase.durationSeconds * 1000);
      }
    };

    const intervalId = window.setInterval(tick, 100);
    tick();
    return () => window.clearInterval(intervalId);
  }, [currentStep, phaseIndex, screen, startTimer]);

  const renderScreen = () => {
    if (screen === 'home') {
      return <HomeView stats={stats} onStart={startWorkout} />;
    }

    if (screen === 'prepare') {
      return (
        <PrepareView
          step={currentStep}
          onStart={startCurrentPhase}
          onAbort={abortWorkout}
          canGoPrevious={canGoPreviousExercise}
          canGoNext={canGoNextExercise}
          onPreviousExercise={goToPreviousExercise}
          onNextExercise={goToNextExercise}
        />
      );
    }

    if (screen === 'timer') {
      return (
        <TimerView
          step={currentStep}
          timer={timerState}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onAbort={abortWorkout}
          canGoPrevious={canGoPreviousExercise}
          canGoNext={canGoNextExercise}
          onPreviousExercise={goToPreviousExercise}
          onNextExercise={goToNextExercise}
        />
      );
    }

    if (screen === 'switch-leg') {
      return (
        <SwitchLegView
          step={currentStep}
          remainingSeconds={switchRemainingSeconds}
          onAbort={abortWorkout}
          canGoPrevious={canGoPreviousExercise}
          canGoNext={canGoNextExercise}
          onPreviousExercise={goToPreviousExercise}
          onNextExercise={goToNextExercise}
        />
      );
    }

    if (screen === 'exercise-complete') {
      return (
        <ExerciseCompleteView
          completedStep={currentStep}
          nextStep={getSafeStep(phaseIndex + 1)}
          onContinue={continueToNextExercise}
          onAbort={abortWorkout}
          canGoPrevious={canGoPreviousExercise}
          canGoNext={canGoNextExercise}
          onPreviousExercise={goToPreviousExercise}
          onNextExercise={goToNextExercise}
        />
      );
    }

    return <FinishView stats={stats} onHome={returnHome} />;
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
