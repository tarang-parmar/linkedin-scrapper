import fs from 'fs'
import {waitForTimeout} from '../utils/wait.js'
import {ensureLoggedIn} from '../utils/ensureLogin.js'
import {loadCookies} from '../utils/cookiesManager.js'

async function checkPendingRequests(page, profiles) {
  for (const profile of profiles) {
    await page.goto(profile.link)
    await waitForTimeout(3000)

    const requestPending = await page.evaluate(() => {
      const pendingButton = document.querySelector('[aria-label*="Pending, click to withdraw invitation"]')
      return !!pendingButton
    })

    profile.requestPending = requestPending
  }
}

export async function run() {
  const {browser, page} = await initializeBrowser({
    headless: false,
    maximized: true,
  })

  await loadCookies(page)

  await ensureLoggedIn(page)

  const profiles = JSON.parse(fs.readFileSync('data/scraped_profiles.json'))

  await checkPendingRequests(page, profiles)

  fs.writeFileSync('data/scraped_profiles.json', JSON.stringify(profiles, null, 2))

  await browser.close()
}
