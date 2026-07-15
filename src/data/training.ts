import type { PassVersion, WorkoutPlan, WorkoutStep } from '../types';

export const PASS_VERSION: PassVersion = 'kotten-v1';

export const WORKOUT_PLAN: WorkoutPlan = {
  version: PASS_VERSION,
  exercises: [
    {
      id: 'balance-board',
      title: 'Balansbräda',
      preparation: [
        'Ställ balansbrädan stadigt.',
        'Ha något tryggt nära om du behöver stöd.',
        'Första minuten görs på vänster ben.'
      ],
      phases: [
        {
          id: 'balance-left',
          title: 'Balansbräda',
          instruction: 'Stå på vänster ben på balansbrädan.',
          durationSeconds: 60,
          startSpeech: 'Start',
          completionSpeech: 'Byt ben',
          transition: {
            kind: 'auto-countdown-to-next-phase',
            message: 'Byt ben',
            countdownSeconds: 3
          }
        },
        {
          id: 'balance-right',
          title: 'Balansbräda',
          instruction: 'Stå på höger ben på balansbrädan.',
          durationSeconds: 60,
          startSpeech: 'Start',
          completionSpeech: 'Övningen är klar'
        }
      ]
    },
    {
      id: 'stair-calf-raises',
      title: 'Tåhävningar i trappa',
      preparation: [
        'Placera framfoten på en vikt handduk på kanten av ett trappsteg.',
        'Tårna och framfoten vilar på steget.',
        'Hälarna ska vara fria utanför kanten.',
        'Håll i räcket.',
        'Gör lugna tåhävningar under 60 sekunder.'
      ],
      phases: [
        {
          id: 'stair-calf-raises',
          title: 'Tåhävningar i trappa',
          instruction: 'Gör lugna tåhävningar. Appen räknar inte repetitioner.',
          durationSeconds: 60,
          startSpeech: 'Start',
          completionSpeech: 'Övningen är klar'
        }
      ]
    },
    {
      id: 'ball-calf-raises',
      title: 'Tåhävningar med tennisboll',
      preparation: [
        'Stå på ett plant golv.',
        'Fötterna ska vara parallella.',
        'Placera en tennisboll mellan hälarna.',
        'Håll kvar tennisbollen mellan hälarna.',
        'Gör lugna tåhävningar under 60 sekunder.'
      ],
      phases: [
        {
          id: 'ball-calf-raises',
          title: 'Tåhävningar med tennisboll',
          instruction: 'Håll kvar tennisbollen mellan hälarna och gör lugna tåhävningar.',
          durationSeconds: 60,
          startSpeech: 'Start',
          completionSpeech: 'Passet är klart'
        }
      ]
    }
  ]
};

export function getWorkoutSteps(plan: WorkoutPlan = WORKOUT_PLAN): WorkoutStep[] {
  const totalPhases = plan.exercises.reduce((sum, exercise) => sum + exercise.phases.length, 0);
  let globalPhaseIndex = 0;

  return plan.exercises.flatMap((exercise, exerciseIndex) =>
    exercise.phases.map((phase, phaseIndexInExercise) => {
      const step: WorkoutStep = {
        exercise,
        phase,
        exerciseIndex,
        phaseIndexInExercise,
        globalPhaseIndex,
        totalExercises: plan.exercises.length,
        totalPhases,
        isLastPhaseOfExercise: phaseIndexInExercise === exercise.phases.length - 1,
        isLastPhase: globalPhaseIndex === totalPhases - 1
      };

      globalPhaseIndex += 1;
      return step;
    })
  );
}

export function getWorkoutDurationSeconds(plan: WorkoutPlan = WORKOUT_PLAN): number {
  return plan.exercises.reduce(
    (exerciseSum, exercise) =>
      exerciseSum +
      exercise.phases.reduce((phaseSum, phase) => phaseSum + phase.durationSeconds, 0),
    0
  );
}
