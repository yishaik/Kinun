/**
 * Minimal Firestore REST client for a Cloudflare Worker (no firebase-admin, which needs Node).
 *
 * Auth: a Google service-account key → signed JWT (RS256, WebCrypto) → OAuth access token.
 * The service account bypasses security rules, so every write MUST be validated by tools.ts.
 */

export interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

type FsValue = Record<string, unknown>;
export type Plain = Record<string, unknown>;

// ───────── value codec ─────────

export function encodeValue(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === 'object') return { mapValue: { fields: encodeFields(v as Plain) } };
  throw new Error(`Cannot encode ${typeof v}`);
}

export function encodeFields(obj: Plain): Record<string, FsValue> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, encodeValue(v)]));
}

/** Timestamps decode to epoch ms, like the app's `millis()`. */
export function decodeValue(v: FsValue | undefined): unknown {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return Date.parse(String(v.timestampValue));
  if ('arrayValue' in v) {
    const values = (v.arrayValue as { values?: FsValue[] }).values ?? [];
    return values.map(decodeValue);
  }
  if ('mapValue' in v) return decodeFields((v.mapValue as { fields?: Record<string, FsValue> }).fields ?? {});
  return null;
}

export function decodeFields(fields: Record<string, FsValue> | undefined): Plain {
  return Object.fromEntries(Object.entries(fields ?? {}).map(([k, v]) => [k, decodeValue(v)]));
}

export interface Doc {
  id: string;
  data: Plain;
}

function toDoc(raw: { name: string; fields?: Record<string, FsValue> }): Doc {
  return { id: raw.name.slice(raw.name.lastIndexOf('/') + 1), data: decodeFields(raw.fields) };
}

// ───────── service-account auth ─────────

const SCOPE = 'https://www.googleapis.com/auth/datastore';

function b64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToDer(pem: string): ArrayBuffer {
  const body = pem.replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(body);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

export async function signJwt(sa: ServiceAccount, nowSec: number): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: SCOPE,
      aud: sa.token_uri ?? 'https://oauth2.googleapis.com/token',
      iat: nowSec,
      exp: nowSec + 3600,
    }),
  );
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(`${header}.${claims}`));
  return `${header}.${claims}.${b64url(sig)}`;
}

// ───────── client ─────────

export class FirestoreClient {
  private token: { value: string; expiresAt: number } | null = null;

  constructor(
    private readonly projectId: string,
    private readonly sa: ServiceAccount,
    private readonly fetchFn: typeof fetch = (...args) => fetch(...args),
    private readonly now: () => number = () => Date.now(),
  ) {}

  private get base() {
    return `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
  }

  private async accessToken(): Promise<string> {
    if (this.token && this.token.expiresAt - 60_000 > this.now()) return this.token.value;
    const jwt = await signJwt(this.sa, Math.floor(this.now() / 1000));
    const res = await this.fetchFn(this.sa.token_uri ?? 'https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
    });
    if (!res.ok) throw new Error(`Google token request failed (${res.status})`);
    const json = (await res.json()) as { access_token: string; expires_in: number };
    this.token = { value: json.access_token, expiresAt: this.now() + json.expires_in * 1000 };
    return this.token.value;
  }

  private async call<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await this.fetchFn(`${this.base}${path}`, {
      ...init,
      headers: { ...(init.headers as Record<string, string>), authorization: `Bearer ${await this.accessToken()}` },
    });
    if (!res.ok) throw new Error(`Firestore ${init.method ?? 'GET'} ${path.split('?')[0]} failed (${res.status})`);
    return (await res.json()) as T;
  }

  async listDocs(collectionPath: string, max = 2000): Promise<Doc[]> {
    const out: Doc[] = [];
    let pageToken = '';
    do {
      const q = `?pageSize=300${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
      const page = await this.call<{
        documents?: { name: string; fields?: Record<string, FsValue> }[];
        nextPageToken?: string;
      }>(`/${collectionPath}${q}`);
      out.push(...(page.documents ?? []).map(toDoc));
      pageToken = page.nextPageToken ?? '';
    } while (pageToken && out.length < max);
    return out;
  }

  async getDoc(docPath: string): Promise<Doc | null> {
    const res = await this.fetchFn(`${this.base}/${docPath}`, {
      headers: { authorization: `Bearer ${await this.accessToken()}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Firestore GET ${docPath} failed (${res.status})`);
    return toDoc((await res.json()) as { name: string; fields?: Record<string, FsValue> });
  }

  async createDoc(collectionPath: string, data: Plain): Promise<string> {
    const raw = await this.call<{ name: string }>(`/${collectionPath}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fields: encodeFields(data) }),
    });
    return raw.name.slice(raw.name.lastIndexOf('/') + 1);
  }

  /** Updates only the given fields; fails (404) if the document does not exist. */
  async patchDoc(docPath: string, data: Plain): Promise<void> {
    const mask = Object.keys(data)
      .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join('&');
    await this.call(`/${docPath}?${mask}&currentDocument.exists=true`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fields: encodeFields(data) }),
    });
  }
}
