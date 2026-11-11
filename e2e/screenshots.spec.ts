/**
 * Captures the documentation screenshots into docs/screenshots/.
 * Run on a machine with a GPU:  SHOTS=1 npx playwright test e2e/screenshots.spec.ts
 */
import { expect, test } from '@playwright/test'

const SHOTS: { file: string; hash: string }[] = [
  { file: '01-overview-isometric.png', hash: '#m=iso' },
  { file: '02-academic-building-piazza.png', hash: '#m=orbit&c=-272,-157,-1.35,1.12,150' },
  { file: '03-shaw-auditorium.png', hash: '#m=orbit&c=-160,240,0.9,1.05,260' },
  { file: '04-seafront-and-halls.png', hash: '#m=orbit&c=250,0,1.4,1.1,620' },
  { file: '05-campus-from-the-sea.png', hash: '#m=orbit&c=-20,-60,1.57,1.25,900' },
  { file: '06-street-level-piazza.png', hash: '#m=explore&c=-299,129,-157,-1.57,0.05' },
  { file: '07-night.png', hash: '#m=orbit&c=-160,240,0.9,1.05,300&t=night' },
  { file: '08-confidence-overlay.png', hash: '#m=iso&c=-60,0,1.15,0.9,620&l=1111111001' },
  { file: '09-campus-zones.png', hash: '#m=iso&l=1111111010' },
]

test.describe('documentation screenshots', () => {
  test.skip(!process.env.SHOTS, 'set SHOTS=1 to regenerate docs/screenshots')
  for (const s of SHOTS) {
    test(s.file, async ({ page }) => {
      await page.goto('/' + s.hash)
      const explore = page.getByRole('button', { name: 'Explore campus' })
      await expect(explore).toBeEnabled({ timeout: 90_000 })
      await explore.click()
      await expect.poll(() => page.evaluate(() => (window as any).__hkust?.store.getState().loaded), { timeout: 120_000 }).toBe(true)
      await page.waitForTimeout(6000)
      await page.screenshot({ path: `docs/screenshots/${s.file}` })
    })
  }
})
