/** Storage seam: tools.ts talks to this interface; Firestore is one implementation, tests use another. */
import { FirestoreClient, type Plain } from './firestore';

export interface StoredItem {
  id: string;
  data: Plain;
}

export interface Repo {
  getHousehold(): Promise<Plain>;
  listItems(): Promise<StoredItem[]>;
  getItem(id: string): Promise<StoredItem | null>;
  addItem(data: Plain): Promise<string>;
  patchItem(id: string, patch: Plain): Promise<void>;
}

export class FirestoreRepo implements Repo {
  private householdIdPromise: Promise<string> | null = null;

  constructor(
    private readonly fs: FirestoreClient,
    private readonly configuredHouseholdId?: string,
  ) {}

  /** The configured id, or the only household in the project (an error if there are several). */
  private householdId(): Promise<string> {
    this.householdIdPromise ??= (async () => {
      if (this.configuredHouseholdId) return this.configuredHouseholdId;
      const all = await this.fs.listDocs('households', 10);
      if (all.length !== 1) {
        throw new Error(`Expected exactly one household, found ${all.length}. Set the HOUSEHOLD_ID variable.`);
      }
      return all[0].id;
    })();
    this.householdIdPromise.catch(() => (this.householdIdPromise = null));
    return this.householdIdPromise;
  }

  async getHousehold(): Promise<Plain> {
    const id = await this.householdId();
    const doc = await this.fs.getDoc(`households/${id}`);
    if (!doc) throw new Error('Household not found');
    return { id, ...doc.data };
  }

  async listItems(): Promise<StoredItem[]> {
    return this.fs.listDocs(`households/${await this.householdId()}/items`);
  }

  async getItem(id: string): Promise<StoredItem | null> {
    if (!/^[A-Za-z0-9]{1,64}$/.test(id)) return null;
    return this.fs.getDoc(`households/${await this.householdId()}/items/${id}`);
  }

  async addItem(data: Plain): Promise<string> {
    return this.fs.createDoc(`households/${await this.householdId()}/items`, data);
  }

  async patchItem(id: string, patch: Plain): Promise<void> {
    await this.fs.patchDoc(`households/${await this.householdId()}/items/${id}`, patch);
  }
}
