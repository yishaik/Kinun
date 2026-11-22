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

    // Before the birth, home shows this week's card and the warning-signs entry.
    expect(screen.getByRole('link', { name: /השבוע שלכם, שבוע \d+/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /סימני אזהרה/ }));
    expect(await screen.findByRole('heading', { name: 'חירום — מתקשרים 101' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /מד״א 101/ })).toHaveAttribute('href', 'tel:101');

    // The "עוד" hub lists the reference screens and stays highlighted on them.
    fireEvent.click(within(nav).getByRole('link', { name: 'עוד' }));
    expect(await screen.findByRole('heading', { name: 'עוד', level: 1 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /השבוע שלכם/ }));
    expect(await screen.findByRole('heading', { name: 'התינוק/ת' })).toBeInTheDocument();

    // Labor stages and the glossary, from the hub.
    fireEvent.click(within(nav).getByRole('link', { name: 'עוד' }));
    fireEvent.click(await screen.findByRole('link', { name: /שלבי הלידה/ }));
    expect(await screen.findByRole('heading', { name: 'שלב שני: הלחיצות' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'אמצעים תרופתיים' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'מילון מונחים' }));
    fireEvent.change(await screen.findByPlaceholderText(/חיפוש/), { target: { value: 'פקק' } });
    expect(screen.getByText('פקק רירי')).toBeInTheDocument();
    expect(screen.queryByText('אפידורל בהליכה')).toBeNull();

    // Kick counter: count, finish, see it in the history.
    fireEvent.click(within(nav).getByRole('link', { name: 'עוד' }));
    fireEvent.click(await screen.findByRole('link', { name: /מונה תנועות/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'התחלת ספירה' }));
    for (let i = 0; i < 3; i++) fireEvent.click(await screen.findByRole('button', { name: /^תנועה/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'תנועה. נספרו 3' })).toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('3 תנועות ומעלה');
    fireEvent.click(screen.getByRole('button', { name: 'סיום הספירה' }));
    expect(await screen.findByText(/3 תנועות ב-/)).toBeInTheDocument();

    // Birth plan: fill, then the print view shows only what was filled.
    fireEvent.click(within(nav).getByRole('link', { name: 'עוד' }));
    fireEvent.click(await screen.findByRole('link', { name: /תוכנית לידה/ }));
    const nameField = await screen.findByLabelText('שם מלא');
    fireEvent.change(nameField, { target: { value: 'נועה כהן' } });
    fireEvent.blur(nameField);
    const music = screen.getByRole('group', { name: 'מוזיקה' });
    fireEvent.click(within(music).getByRole('button', { name: 'כן' }));
    await waitFor(() =>
      expect(within(music).getByRole('button', { name: 'כן' })).toHaveAttribute('aria-pressed', 'true'),
    );
    fireEvent.click(screen.getByRole('link', { name: /תצוגה להדפסה/ }));
    expect(await screen.findByRole('heading', { name: 'תוכנית לידה — נועה כהן' })).toBeInTheDocument();
    expect(screen.getByText('מוזיקה')).toBeInTheDocument();
    expect(screen.queryByText('חוקן')).toBeNull();
  });

  it('shows the private screen to a real (non-demo) sign-in that is not on the allowlist', async () => {
    const store = new LocalStore('app-test-private');
    // Pretend to be the Firebase backend: the demo user (demo@kinun.local) is not allowlisted.
    Object.defineProperty(store, 'mode', { value: 'firebase' });
    render(<App store={store as unknown as LocalStore} />);
    fireEvent.click(await screen.findByRole('button', { name: 'כניסה עם Google' }));
    expect(await screen.findByRole('heading', { name: 'האפליקציה הזו פרטית' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'בואו נכין את הקן' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /התנתקות/ }));
    expect(await screen.findByRole('button', { name: 'כניסה עם Google' })).toBeInTheDocument();
  });
});
