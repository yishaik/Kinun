import { chooseBackend } from './firebaseConfig';
import { LocalStore } from './localStore';
import type { DataStore } from './store';

/** Pick and construct the backend. Firebase code is loaded only when it's actually used. */
export async function createStore(): Promise<DataStore> {
  const choice = await chooseBackend();
  if (choice.kind === 'firebase') {
    const { FirebaseStore } = await import('./firebaseStore');
    return new FirebaseStore(choice.config);
  }
  return new LocalStore();
}
