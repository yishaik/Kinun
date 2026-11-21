# CLAUDE.md

All project instructions live in **AGENTS.md** (shared by every coding agent):

@AGENTS.md

Claude-specific notes:

- Prefer `npm run dev:demo` and the Playwright smoke test for checking UI — no Firebase project is needed.
- In sandboxed environments without Playwright browsers but with Chrome installed, run e2e with `PW_CHANNEL=chrome`.
- When editing default content, re-run `npx vitest run src/content` — it enforces sources, ids and categories.
