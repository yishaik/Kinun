/**
 * Kinun MCP server — Cloudflare Worker entry point.
 *
 *   POST /mcp            with  Authorization: Bearer <MCP_TOKEN>
 *   POST /mcp/<token>    for clients that can only take a URL (e.g. claude.ai custom connectors)
 *
 * Fails closed: with no (or a weak) MCP_TOKEN every request is refused.
 */
import { FirestoreClient, type ServiceAccount } from './firestore';
import { handleRpc } from './mcp';
import { FirestoreRepo, type Repo } from './repo';

export interface Env {
  MCP_TOKEN?: string;
  GOOGLE_SERVICE_ACCOUNT?: string;
  FIREBASE_PROJECT_ID?: string;
  HOUSEHOLD_ID?: string;
}

const MIN_TOKEN_LENGTH = 24;
const MAX_BODY_BYTES = 100_000;

async function sameSecret(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}

export async function isAuthorized(request: Request, token: string, pathToken: string | null): Promise<boolean> {
  const header = request.headers.get('authorization') ?? '';
  const bearer = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : null;
  const given = bearer ?? pathToken;
  return given !== null && (await sameSecret(given, token));
}

let cachedRepo: { key: string; repo: Repo } | null = null;

function repoFor(env: Env): Repo {
  const key = `${env.FIREBASE_PROJECT_ID}|${env.HOUSEHOLD_ID ?? ''}|${env.GOOGLE_SERVICE_ACCOUNT?.length}`;
  if (cachedRepo?.key !== key) {
    const sa = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT ?? '') as ServiceAccount;
    cachedRepo = {
      key,
      repo: new FirestoreRepo(new FirestoreClient(env.FIREBASE_PROJECT_ID ?? '', sa), env.HOUSEHOLD_ID),
    };
  }
  return cachedRepo.repo;
}

export async function handleRequest(request: Request, env: Env, repo?: Repo): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts.length === 0) return new Response('Kinun MCP server. See docs/MCP.md in the repo.\n', { status: 200 });
  if (parts[0] !== 'mcp' || parts.length > 2) return new Response('Not found', { status: 404 });

  const token = env.MCP_TOKEN ?? '';
  if (token.length < MIN_TOKEN_LENGTH) return json({ error: 'Server is not configured' }, 503);
  if (!(await isAuthorized(request, token, parts[1] ?? null))) {
    return json({ error: 'Unauthorized' }, 401, { 'www-authenticate': 'Bearer' });
  }

  if (request.method !== 'POST') return new Response('Use POST', { status: 405, headers: { allow: 'POST' } });

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return json({ error: 'Body too large' }, 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, 400);
  }

  let useRepo: Repo;
  try {
    useRepo = repo ?? repoFor(env);
  } catch {
    return json({ error: 'Server is not configured' }, 503);
  }
  const out = await handleRpc(body, { repo: useRepo, now: () => new Date() });
  return out === null ? new Response(null, { status: 202 }) : json(out);
}

export default {
  fetch: (request: Request, env: Env) => handleRequest(request, env),
};
