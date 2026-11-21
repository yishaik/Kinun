/** Shown when someone signs in with a Google account that is not on the allowlist (src/lib/access.ts). */
import { Lock } from 'lucide-react';
import { useActions, useSession } from '../data/session';

export function PrivatePage() {
  const { user } = useSession();
  const actions = useActions();
  return (
    <main className="pt-safe pb-safe mx-auto flex min-h-dvh max-w-md flex-col px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-fill text-twig-soft" aria-hidden>
          <Lock className="size-9" strokeWidth={1.75} />
        </span>
        <h1 className="mt-6 text-title1">האפליקציה הזו פרטית</h1>
        <p className="mt-3 text-body text-twig-soft text-balance">
          קינון פתוחה רק לבני המשפחה. החשבון שאיתו נכנסת לא נמצא ברשימת המורשים.
        </p>
        {user?.email && (
          <p className="mt-4 rounded-full bg-fill px-3 py-1 text-footnote text-twig-soft" dir="ltr">
            {user.email}
          </p>
        )}
      </div>
      <div className="pb-8">
        <button type="button" className="btn-primary min-h-[50px] w-full" onClick={() => void actions.signOut()}>
          התנתקות וכניסה עם חשבון אחר
        </button>
      </div>
    </main>
  );
}
