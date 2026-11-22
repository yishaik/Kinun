import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';

// Some suites (mcp-worker/) run in the node environment, where there is no `window`.
const hasDom = typeof window !== 'undefined';

beforeEach(() => {
  if (hasDom) window.localStorage.clear();
});

afterEach(() => {
  if (hasDom) cleanup();
});
if (hasDom) window.scrollTo = () => {};
