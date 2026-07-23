import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getExerciseIndexForPhase,
  getFirstPhaseIndexForExercise,
  getWorkoutDurationSeconds,
  WORKOUT_PHASES,
  WORKOUT_PLAN
} from './data/training';
import { AbortDialog } from './components/AbortDialog';
import { FinishView } from './components/FinishView';
import { HomeView } from './components/HomeView';
import { ManualExerciseView } from './components/ManualExerciseView';
import { PrepareView } from './components/PrepareView';
import { SwitchLegView } from './components/SwitchLegView';
import { TimerView } from './components/TimerView';
import { getRandomFinishMessage } from './data/finishMessages';
import { useAbsoluteTimer } from './hooks/useAbsoluteTimer';
import { useWakeLock } from './hooks/useWakeLock';
import { playCue, unlockAudio } from './lib/audio';
import {
  addWorkoutCompletion,
  createWorkoutCompletion,
  loadWorkoutHistory,
  saveWorkoutHistory
} from './lib/history';
import { formatLocalDate } from './lib/localDate';
import { readLocalStorage, writeLocalStorage } from './lib/storage';
import { calculateStreakStats } from './lib/streak';
import type { WorkoutCompletion } from './types';

type FlowState =
  | { screen: 'home' }
  | { screen: 'preparation'; exerciseIndex: number }
  | { screen: 'active'; phaseIndex: number }
  | { screen: 'transition'; nextPhaseIndex: number }
  | { screen: 'completed' };

const SOUND_STORAGE_KEY = 'kotten.sound.enabled';
const BALANCE_SWITCH_SECONDS = 5;
const workoutDurationSeconds = getWorkoutDurationSeconds(WORKOUT_PLAN);

function loadSoundPreference(): boolean {
  return readLocalStorage(SOUND_STORAGE_KEY) !== 'false';
}

function getSafePhaseIndex(index: number): number {
  return Math.min(Math.max(index, 0), WORKOUT_PHASES.length - 1);
}

export default function App() {
  const [history, setHistory] = useState<WorkoutCompletion[]>(() => loadWorkoutHistory());
  const [flow, setFlow] = useState<FlowState>({ screen: 'home' });
  const [abortDialogOpen, setAbortDialogOpen] = useState(false);
  const [completedDate, setCompletedDate] = useState(() => formatLocalDate(new Date()));
  const [completedMessage, setCompletedMessage] = useState(() => getRandomFinishMessage());
  const [soundEnabled, setSoundEnabled] = useState(loadSoundPreference);
  const timerCompleteActionRef = useRef<() => void>(() => undefined);
  const resumeAfterAbortCancelRef = useRef(false);

  const stats = useMemo(() => calculateStreakStats(history), [history]);
  const {
    state: timerState,
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
    stop: stopTimer
  } = useAbsoluteTimer(() => timerCompleteActionRef.current());
  useWakeLock(timerState.status === 'running');

  const completeWorkout = useCallback(() => {
    const completedAt = new Date();
    const completion = createWorkoutCompletion(
      completedAt,
      workoutDurationSeconds,
      WORKOUT_PLAN.version
    );
    const nextHistory = addWorkoutCompletion(history, completion);

    setCompletedDate(completion.localDate);
    setCompletedMessage(getRandomFinishMessage());
    setHistory(nextHistory);
    saveWorkoutHistory(nextHistory);
    setFlow({ screen: 'completed' });
  }, [history]);

  const startPhase = useCallback(
    (phaseIndex: number) => {
      const safePhaseIndex = getSafePhaseIndex(phaseIndex);
      const phase = WORKOUT_PHASES[safePhaseIndex];

      unlockAudio();
      setAbortDialogOpen(false);
      setFlow({ screen: 'active', phaseIndex: safePhaseIndex });

      if (phase.mode === 'manual') {
        stopTimer();
        return;
      }

      startTimer(phase.durationSeconds * 1000);
    },
    [startTimer, stopTimer]
  );

  const goToPreparation = useCallback(
    (exerciseIndex: number) => {
      stopTimer();
      setAbortDialogOpen(false);
      setFlow({
        screen: 'preparation',
        exerciseIndex: Math.min(Math.max(exerciseIndex, 0), WORKOUT_PLAN.exercises.length - 1)
      });
    },
    [stopTimer]
  );

  const completePhase = useCallback(
    (phaseIndex: number) => {
      const currentPhase = WORKOUT_PHASES[phaseIndex];
      const nextPhaseIndex = phaseIndex + 1;
      const nextPhase = WORKOUT_PHASES[nextPhaseIndex];

      if (currentPhase.id === 'balance-first-leg') {
        playCue('step', soundEnabled);
        setFlow({ screen: 'transition', nextPhaseIndex });
        startTimer(BALANCE_SWITCH_SECONDS * 1000);
        return;
      }

      if (!nextPhase) {
        playCue('done', soundEnabled);
        completeWorkout();
        return;
      }

      playCue('step', soundEnabled);
      goToPreparation(getExerciseIndexForPhase(nextPhaseIndex));
    },
    [completeWorkout, goToPreparation, soundEnabled, startTimer]
  );

  const handleTimerComplete = useCallback(() => {
    if (flow.screen === 'transition') {
      startPhase(flow.nextPhaseIndex);
      return;
    }

    if (flow.screen !== 'active') {
      return;
    }

    completePhase(flow.phaseIndex);
  }, [completePhase, flow, startPhase]);

  useEffect(() => {
    timerCompleteActionRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  const startWorkout = useCallback(() => {
    unlockAudio();
    goToPreparation(0);
  }, [goToPreparation]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => {
      const nextValue = !current;
      if (nextValue) {
        unlockAudio();
      }
      writeLocalStorage(SOUND_STORAGE_KEY, String(nextValue));
      return nextValue;
    });
  }, []);

  const requestAbort = useCallback(() => {
    resumeAfterAbortCancelRef.current = timerState.status === 'running';
    if (timerState.status === 'running') {
      pauseTimer();
    }
    setAbortDialogOpen(true);
  }, [pauseTimer, timerState.status]);

  const cancelAbort = useCallback(() => {
    setAbortDialogOpen(false);
    if (resumeAfterAbortCancelRef.current) {
      resumeTimer();
    }
    resumeAfterAbortCancelRef.current = false;
  }, [resumeTimer]);

  const confirmAbort = useCallback(() => {
    stopTimer();
    resumeAfterAbortCancelRef.current = false;
    setAbortDialogOpen(false);
    setFlow({ screen: 'home' });
  }, [stopTimer]);

  const renderScreen = () => {
    if (flow.screen === 'home') {
      return (
        <HomeView
          stats={stats}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          onStart={startWorkout}
        />
      );
    }

    if (flow.screen === 'preparation') {
      const exercise = WORKOUT_PLAN.exercises[flow.exerciseIndex];
      const firstPhaseIndex = getFirstPhaseIndexForExercise(exercise);

      return (
        <PrepareView
          exercise={exercise}
          onStart={() => startPhase(firstPhaseIndex)}
          onAbort={requestAbort}
        />
      );
    }

    if (flow.screen === 'active') {
      const phase = WORKOUT_PHASES[flow.phaseIndex];

      if (phase.mode === 'manual') {
        return (
          <ManualExerciseView
            phase={phase}
            onDone={() => completePhase(flow.phaseIndex)}
            onAbort={requestAbort}
          />
        );
      }

      return (
        <TimerView
          phase={phase}
          timer={timerState}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onAbort={requestAbort}
        />
      );
    }

    if (flow.screen === 'transition') {
      return <SwitchLegView timer={timerState} onAbort={requestAbort} />;
    }

    return (
      <FinishView
        stats={stats}
        completedDate={completedDate}
        message={completedMessage}
        onHome={() => setFlow({ screen: 'home' })}
      />
    );
  };

  return (
    <>
      {renderScreen()}
      {abortDialogOpen && <AbortDialog onCancel={cancelAbort} onConfirm={confirmAbort} />}
    </>
  );
}
