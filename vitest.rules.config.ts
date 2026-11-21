import { defineConfig } from 'vitest/config';

/** Firestore security-rules tests. Needs the Firestore emulator — run via `npm run test:rules`. */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['firestore-tests/**/*.test.ts'],
    testTimeout: 20_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
