import type { Page } from 'playwright'

export interface TestRunResult {
  status: 'PASS' | 'FAIL'
  log: string
}

export type TestRunner = (page: Page) => Promise<TestRunResult>
