import { chromium, type Page } from 'playwright'

// The dashboard triggers a run from a server-side API route (this app's own
// server), so the target is always this same running instance — never a
// separate deployment. Bypasses the login form by setting the session
// cookie directly (see app/api/auth/route.ts / proxy.ts), the same value
// the real login flow would set, rather than re-typing the password through
// the UI on every run.
const BASE_URL = process.env.TEST_RUNNER_BASE_URL ?? 'http://localhost:3000'

export async function withAuthedPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
  // Uses the system-installed Chrome (channel: 'chrome') rather than
  // Playwright's bundled Chromium — this machine's network intercepts the
  // TLS connection Playwright's browser downloader needs, but a real
  // browser is already installed and works fine as a driver target.
  const browser = await chromium.launch({ channel: 'chrome' })
  try {
    // Dialogs in this app (e.g. New Case) are position:fixed and centered on
    // the viewport — if the dialog is taller than the viewport, Playwright
    // can't scroll it into view (page scrolling doesn't move fixed
    // elements), so footer buttons like "Create Case" become unclickable.
    // A tall viewport sidesteps that instead of fighting real dialog layout.
    const context = await browser.newContext({ baseURL: BASE_URL, viewport: { width: 1440, height: 1600 } })
    await context.addCookies([
      {
        name: 'br_session',
        value: process.env.AUTH_SECRET!,
        url: BASE_URL,
      },
    ])
    const page = await context.newPage()
    return await fn(page)
  } finally {
    await browser.close()
  }
}
