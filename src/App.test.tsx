import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { getWorkoutSteps, WORKOUT_PLAN } from './data/training';

const reactActGlobal = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT: boolean;
};

reactActGlobal.IS_REACT_ACT_ENVIRONMENT = true;

function getFirstButton(): HTMLButtonElement {
  const button = document.querySelector('button');

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error('Expected a button to be rendered.');
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
      getFirstButton().click();
    });

    act(() => {
      getFirstButton().click();
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
});
