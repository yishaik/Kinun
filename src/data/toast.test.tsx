import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from './toast';

function Trigger() {
  const { toast } = useToast();
  return (
    <>
      <button onClick={() => toast('נוסף', 'success')}>add</button>
      <button onClick={() => toast('נשמר', 'success')}>save</button>
    </>
  );
}

describe('toast HUD', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows one toast at a time (a new one replaces the old) and hides it after ~2s', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    act(() => screen.getByText('add').click());
    act(() => screen.getByText('add').click());
    act(() => screen.getByText('save').click());
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('נשמר');
    act(() => vi.advanceTimersByTime(2100));
    expect(screen.queryByRole('status')).toBeNull();
  });
});
