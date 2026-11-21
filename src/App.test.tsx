/** Integration test: the whole app on the LocalStore backend, from sign-in to the home screen. */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { LocalStore } from './data/localStore';
import { SEED_TASKS } from './content';

describe('App (demo backend)', () => {
  it('signs in, creates the household with default content, and shows the home screen', async () => {
    render(<App store={new LocalStore('app-test')} />);

    fireEvent.click(await screen.findByRole('button', { name: 'כניסה למצב הדגמה' }));
    expect(await screen.findByRole('heading', { name: 'בואו נכין את הקן' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('תאריך לידה משוער'), { target: { value: '2027-01-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'יצירת הרשימות שלנו' }));

    expect(await screen.findByText('מה עכשיו')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'ניווט ראשי' });
    expect(within(nav).getAllByRole('link')).toHaveLength(5);

    // All default tasks were created.
    await waitFor(() => expect(screen.getByText(`0 מתוך ${SEED_TASKS.length}`)).toBeInTheDocument());
  });
});
