# E2E Tests (Playwright)

This directory will contain Playwright end-to-end tests.

Current setup:

- Config: `playwright.config.ts`
- Base URL: `http://localhost:3000` (override with `PLAYWRIGHT_BASE_URL` env var)
- Projects: Chromium, Firefox, WebKit, plus two mobile viewports
- Output (artifacts): `playwright-results/`
- Commands:
  - `npm run e2e` headless run
  - `npm run e2e:headed` headed debug
  - `npm run e2e:open` UI mode
  - `npm run e2e:report` open last HTML report

Add test files with `*.spec.ts` suffix here (e.g. `home.spec.ts`).
