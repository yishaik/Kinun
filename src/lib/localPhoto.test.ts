import { describe, expect, it } from 'vitest';
import { MAX_PHOTO_BYTES, MAX_PHOTO_EDGE, PHOTO_DB, SIGNIN_PHOTO_KEY } from './localPhoto';

describe('local photo constraints', () => {
  it('keeps the portrait on this device, with a tight size budget', () => {
    expect(PHOTO_DB).toBe('kinun-local');
    expect(SIGNIN_PHOTO_KEY).toBe('signin-portrait');
    expect(MAX_PHOTO_EDGE).toBe(1280);
    expect(MAX_PHOTO_BYTES).toBeLessThanOrEqual(2 * 1024 * 1024);
  });
});
