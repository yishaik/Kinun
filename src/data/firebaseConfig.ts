/**
 * Decides which backend to use and resolves the Firebase web config.
 *
 * Order:
 * 1. Demo mode if `vite --mode demo`, `VITE_DEMO=true`, or the URL has `?demo=1`.
 * 2. `VITE_FIREBASE_*` env vars (local development — see .env.example).
 * 3. Firebase Hosting's reserved `/__/firebase/init.json` (zero-config in production).
 * 4. Otherwise demo mode.
 *
 * The Firebase web config is not a secret — access is controlled by firestore.rules.
 */
import type { FirebaseOptions } from 'firebase/app';

export type BackendChoice = { kind: 'firebase'; config: FirebaseOptions } | { kind: 'demo'; reason: string };

function demoRequested(): boolean {
  if (import.meta.env.MODE === 'demo' || import.meta.env.VITE_DEMO === 'true') return true;
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('demo');
}

function configFromEnv(): FirebaseOptions | null {
  const env = import.meta.env;
  if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID) return null;
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  };
}

async function configFromHosting(): Promise<FirebaseOptions | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/__/firebase/init.json', { cache: 'no-store' });
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('json')) return null;
    const cfg = (await res.json()) as FirebaseOptions;
    if (!cfg.apiKey || !cfg.projectId) return null;
    // Same-origin auth helper: Firebase Hosting serves /__/auth/* on every domain it hosts.
    // This keeps Google sign-in (redirect flow) working in Safari / iOS home-screen apps,
    // which block third-party storage. Localhost keeps the default authDomain.
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') cfg.authDomain = window.location.host;
    return cfg;
  } catch {
    return null;
  }
}

export async function chooseBackend(): Promise<BackendChoice> {
  if (demoRequested()) return { kind: 'demo', reason: 'requested' };
  const fromEnv = configFromEnv();
  if (fromEnv) return { kind: 'firebase', config: fromEnv };
  const fromHosting = await configFromHosting();
  if (fromHosting) return { kind: 'firebase', config: fromHosting };
  return { kind: 'demo', reason: 'no-config' };
}
