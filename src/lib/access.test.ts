import { describe, expect, it } from 'vitest';
import rules from '../../firestore.rules?raw';
import { ALLOWED_EMAILS, isAllowedEmail } from './access';

describe('access allowlist', () => {
  it('allows exactly the couple’s accounts, ignoring case and spaces', () => {
    expect(ALLOWED_EMAILS).toHaveLength(3);
    expect(isAllowedEmail('yishai.k@gmail.com')).toBe(true);
    expect(isAllowedEmail(' YishaiK@Gmail.com ')).toBe(true);
    expect(isAllowedEmail('lisya.abulafya@gmail.com')).toBe(true);
  });

  it('rejects everyone else', () => {
    expect(isAllowedEmail('someone@gmail.com')).toBe(false);
    expect(isAllowedEmail('yishai.k@gmail.com.evil.com')).toBe(false);
    expect(isAllowedEmail('')).toBe(false);
    expect(isAllowedEmail(null)).toBe(false);
  });

  it('matches the allowlist in firestore.rules', () => {
    const m = rules.match(/function allowlist\(\)\s*{\s*return\s*\[([^\]]*)\]/);
    expect(m).not.toBeNull();
    const fromRules = [...m![1].matchAll(/'([^']+)'/g)].map((x) => x[1]).sort();
    expect(fromRules).toEqual([...ALLOWED_EMAILS].sort());
  });
});

describe('suggestedPartnerEmail', () => {
  it('suggests the other person', async () => {
    const { suggestedPartnerEmail } = await import('./access');
    expect(suggestedPartnerEmail('YishaiK@gmail.com')).toBe('lisya.abulafya@gmail.com');
    expect(suggestedPartnerEmail('lisya.abulafya@gmail.com')).toBe('yishai.k@gmail.com');
    expect(suggestedPartnerEmail('demo@kinun.local')).toBe('');
  });
});
