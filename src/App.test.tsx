import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { HISTORY_STORAGE_KEY } from './lib/history';

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

async function advanceTimers(ms: number): Promise<void> {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
  });
}

function getStoredCompletionCount(): number {
  const storedValue = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!storedValue) {
    return 0;
  }

  const payload = JSON.parse(storedValue) as { completions?: unknown[] };
  return payload.completions?.length ?? 0;
}

describe('App workout flow', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0));
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

  it('runs the full guided workout and stores completion only after the final phase', async () => {
    act(() => {
      root.render(<App />);
    });

    expect(document.body.textContent).toContain('Kotten');

    act(() => {
      getButtonByText('Starta passet').click();
    });

    expect(document.body.textContent).toContain('Balansbräda');
    expect(document.body.textContent).toContain('1 minut per ben.');

    act(() => {
      getButtonByText('Starta').click();
    });

    expect(document.body.textContent).toContain('Första benet');
    await advanceTimers(60_000);

    expect(document.body.textContent).toContain('Byt ben');
    expect(getStoredCompletionCount()).toBe(0);

    await advanceTimers(5_000);

    expect(document.body.textContent).toContain('Andra benet');
    await advanceTimers(60_000);

    expect(document.body.textContent).toContain('Tåhävningar i trappa');
    expect(document.body.textContent).toContain('1 minut.');

    act(() => {
      getButtonByText('Starta').click();
    });

    expect(document.body.textContent).toContain('Tåhävningar i trappa');
    await advanceTimers(60_000);

    expect(document.body.textContent).toContain('Tåhävningar med tennisboll');

    act(() => {
      getButtonByText('Starta').click();
    });

    expect(document.body.textContent).toContain('Tåhävningar med tennisboll');
    await advanceTimers(60_000);

    expect(document.body.textContent).toContain('Passet är klart');
    expect(getStoredCompletionCount()).toBe(1);
  });

  it('does not store an aborted workout', () => {
    act(() => {
      root.render(<App />);
    });

    act(() => {
      getButtonByText('Starta passet').click();
    });

    act(() => {
      getButtonByText('Starta').click();
    });

    act(() => {
      getButtonByText('Avbryt').click();
    });

    expect(document.body.textContent).toContain('Vill du avsluta passet?');

    act(() => {
      getButtonByText('Avsluta passet').click();
    });

    expect(document.body.textContent).toContain('Kotten');
    expect(getStoredCompletionCount()).toBe(0);
  });
});
