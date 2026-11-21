import { useState } from 'react';
import { useSession } from '../data/session';
import { useToast } from '../data/toast';

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export function SignInPage() {
  const { store } = useSession();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const demo = store.mode === 'demo';

  const signIn = async () => {
    setBusy(true);
    try {
      await store.signInWithGoogle();
    } catch (err) {
      toast(`ההתחברות נכשלה: ${(err as Error).message}`, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="pt-safe mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10">
      <div className="flex flex-1 flex-col justify-center">
        <svg viewBox="0 0 120 150" className="mb-6 w-24" aria-hidden>
          <path
            d="M60 6 C 30 6, 10 52, 10 88 C 10 122, 33 144, 60 144 C 87 144, 110 122, 110 88 C 110 52, 90 6, 60 6 Z"
            fill="var(--color-robin-soft)"
            stroke="var(--color-robin)"
            strokeWidth="5"
          />
        </svg>
        <h1 className="font-display text-6xl leading-none">קינון</h1>
        <p className="mt-4 text-xl leading-snug">
          כל מה שצריך לעשות, לקנות ולארוז לקראת הלידה ואחריה — ברשימה אחת משותפת לשניכם.
        </p>
        <p className="mt-3 text-twig-soft">
          כל שינוי של אחד מכם מופיע מיד גם אצל השני. הרשימות מבוססות על מקורות רשמיים, ואפשר לערוך בהן הכול.
        </p>
      </div>

      <div>
        <button
          type="button"
          onClick={signIn}
          disabled={busy}
          className="btn w-full border border-line bg-paper text-lg text-twig shadow-sm"
        >
          {demo ? null : <GoogleMark />}
          {demo ? 'כניסה למצב הדגמה' : busy ? 'מתחברים…' : 'כניסה עם Google'}
        </button>
        {demo && (
          <p className="mt-3 text-center text-sm text-twig-soft">
            Firebase לא מחובר עדיין, אז הנתונים יישמרו רק במכשיר הזה. הוראות החיבור נמצאות ב-README.
          </p>
        )}
      </div>
    </main>
  );
}
