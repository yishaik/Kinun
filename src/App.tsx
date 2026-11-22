import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { createStore } from './data/createStore';
import { SessionProvider, useSession } from './data/session';
import type { DataStore } from './data/store';
import { ToastProvider } from './data/toast';
import { GearPage } from './pages/GearPage';
import { HomePage } from './pages/HomePage';
import { LaborPage } from './pages/LaborPage';
import { LinksPage } from './pages/LinksPage';
import { MorePage } from './pages/MorePage';
import { WarningsPage } from './pages/WarningsPage';
import { LaborStagesPage } from './pages/LaborStagesPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { KicksPage } from './pages/KicksPage';
import { BirthPlanPage } from './pages/BirthPlanPage';
import { BirthPlanPrintPage } from './pages/BirthPlanPrintPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { NamesPage } from './pages/NamesPage';
import { WeekPage } from './pages/WeekPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SettingsPage } from './pages/SettingsPage';
import { PrivatePage } from './pages/PrivatePage';
import { AppMark } from './components/AppMark';
import { SignInPage } from './pages/SignInPage';
import { TasksPage } from './pages/TasksPage';

function Splash() {
  return (
    <div className="flex min-h-dvh items-center justify-center" aria-busy="true" aria-label="טוען">
      <AppMark size={72} />
    </div>
  );
}

function Gate() {
  const { status, household } = useSession();
  if (status === 'auth-loading' || status === 'households-loading') return <Splash />;
  if (status === 'signed-out') return <SignInPage />;
  if (status === 'not-allowed') return <PrivatePage />;
  if (status === 'no-household') return <OnboardingPage />;
  if (!household) return <Splash />;
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/gear" element={<GearPage />} />
          <Route path="/labor" element={<LaborPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/week" element={<WeekPage />} />
          <Route path="/warnings" element={<WarningsPage />} />
          <Route path="/stages" element={<LaborStagesPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/kicks" element={<KicksPage />} />
          <Route path="/birth-plan" element={<BirthPlanPage />} />
          <Route path="/birth-plan/print" element={<BirthPlanPrintPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/names" element={<NamesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export function App({ store: injected }: { store?: DataStore }) {
  const [store, setStore] = useState<DataStore | null>(injected ?? null);
  useEffect(() => {
    if (injected) return;
    let cancelled = false;
    createStore().then((s) => {
      if (!cancelled) setStore(s);
    });
    return () => {
      cancelled = true;
    };
  }, [injected]);

  if (!store) return <Splash />;
  return (
    <ToastProvider>
      <SessionProvider store={store}>
        <Gate />
      </SessionProvider>
    </ToastProvider>
  );
}
