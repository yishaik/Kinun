import { describe, expect, it } from 'vitest';
import { buildAgentPrompt, normalizeMcpBase, TOKEN_PLACEHOLDER } from './agentPrompt';

describe('normalizeMcpBase', () => {
  it('keeps only the origin and requires https (or localhost)', () => {
    expect(normalizeMcpBase(' https://kinun-mcp.me.workers.dev/mcp/ ')).toBe('https://kinun-mcp.me.workers.dev');
    expect(normalizeMcpBase('http://localhost:8787/x')).toBe('http://localhost:8787');
    expect(normalizeMcpBase('http://example.com')).toBeNull();
    expect(normalizeMcpBase('javascript:alert(1)')).toBeNull();
    expect(normalizeMcpBase('')).toBeNull();
    expect(normalizeMcpBase('not a url')).toBeNull();
  });
});

describe('buildAgentPrompt', () => {
  it('puts the endpoint and token in every connection form', () => {
    const p = buildAgentPrompt({ baseUrl: 'https://k.example.dev/', token: ' s3cret ' });
    expect(p).toContain('https://k.example.dev/mcp');
    expect(p).toContain('Authorization: Bearer s3cret');
    expect(p).toContain('https://k.example.dev/mcp/s3cret');
    expect(p).toContain('claude mcp add --transport http kinun https://k.example.dev/mcp');
    expect(p).not.toContain(TOKEN_PLACEHOLDER);
  });
  it('uses placeholders until the fields are filled in, and says there is no delete', () => {
    const p = buildAgentPrompt({ baseUrl: '' });
    expect(p).toContain(TOKEN_PLACEHOLDER);
    expect(p).toContain('https://<כתובת-השרת>/mcp');
    expect(p).toContain('אי אפשר למחוק');
  });
});
