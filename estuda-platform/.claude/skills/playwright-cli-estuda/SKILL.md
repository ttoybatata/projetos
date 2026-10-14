---
name: playwright-cli-estuda
description: Explore and validate the Estuda web interface with Microsoft's official Playwright CLI, then turn findings into repeatable E2E tests.
---

# Playwright CLI — Estuda

## Install and confirm
- Check Node.js 20+ and project root.
- Install project dependencies with npm install.
- The official npm package is @playwright/cli; its executable is playwright-cli.
- Run playwright-cli --help and follow the installed version's syntax.
- Install browser binaries for E2E with npx playwright install chromium.

## Workflow
1. Read AGENTS.md, the relevant GitHub Issue, and the feature's acceptance criteria.
2. Start the web app and required API/database services; verify health before browser exploration.
3. Use playwright-cli to open the local site, snapshot the page, and inspect accessible controls.
4. Test mobile and desktop layouts, form validation, empty states, and errors using synthetic accounts only.
5. Avoid collecting or printing passwords, recovery codes, session cookies, or tokens.
6. Turn reproducible defects into @playwright/test tests in e2e/.
7. Run npm run test:e2e and record the exact command, output, browser, and environment.
8. If dependencies, API, database, or browser are unavailable, report the blocker honestly.
9. Never claim a test passed unless the command ran and the result was observed.

## Important distinction
playwright-cli is for agent-led browser exploration. @playwright/test is the automated E2E test runner. Neither replaces unit tests, API/security tests, or review.
