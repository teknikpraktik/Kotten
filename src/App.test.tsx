import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { getWorkoutSteps, WORKOUT_PLAN } from './data/training';

const reactActGlobal = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

reactActGlobal.IS_REACT_ACT_ENVIRONMENT = true;

function getButtonByText(text: string): HTMLButtonElement {
  const button = Array.from(document.querySelectorAll('button')).find(
    (element) => element.textContent?.trim() === text
  );

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Expected a button named "${text}" to be rendered.`);
  }

  return button;
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
}

describe('App workout flow', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it('automatically starts the right-leg phase after the left-leg countdown', async () => {
    const rightLegInstruction = getWorkoutSteps(WORKOUT_PLAN)[1].phase.instruction;

    act(() => {
      root.render(<App />);
    });

    act(() => {
      getButtonByText('Starta passet').click();
    });

    act(() => {
      getButtonByText('Starta').click();
    });

    await act(async () => {
      vi.advanceTimersByTime(60_000);
      await flushMicrotasks();
    });

    await act(async () => {
      vi.advanceTimersByTime(3_000);
      await flushMicrotasks();
    });

    expect(document.body.textContent).toContain(rightLegInstruction);
  });

  it('shows the exercise-complete text interstitial before the next exercise', async () => {
    const nextExerciseTitle = getWorkoutSteps(WORKOUT_PLAN)[2].phase.title;

    act(() => {
      root.render(<App />);
    });

    act(() => {
      getButtonByText('Starta passet').click();
    });

    act(() => {
      getButtonByText('Starta').click();
    });

    await act(async () => {
      vi.advanceTimersByTime(60_000);
      await flushMicrotasks();
    });

    await act(async () => {
      vi.advanceTimersByTime(3_000);
      await flushMicrotasks();
    });

    await act(async () => {
      vi.advanceTimersByTime(60_000);
      await flushMicrotasks();
    });

    expect(document.body.textContent).toContain(`Nästa övning är ${nextExerciseTitle}.`);
    expect(document.body.textContent).toContain('Fortsätt');
  });

  it('can jump forward and backward between exercise preparation screens', () => {
    const balanceTitle = getWorkoutSteps(WORKOUT_PLAN)[0].exercise.title;
    const stairTitle = getWorkoutSteps(WORKOUT_PLAN)[2].exercise.title;

    act(() => {
      root.render(<App />);
    });

    act(() => {
      getButtonByText('Starta passet').click();
    });

    expect(document.body.textContent).toContain(balanceTitle);

    act(() => {
      getButtonByText('Nästa').click();
    });

    expect(document.body.textContent).toContain(stairTitle);

    act(() => {
      getButtonByText('Föregående').click();
    });

    expect(document.body.textContent).toContain(balanceTitle);
  });
});
