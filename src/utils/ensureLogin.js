import {login} from '../scrapers/scraper.js'
import {saveCookies} from './cookiesManager.js'

export async function ensureLoggedIn(page, userId) {
  const MAX_RETRIES = 3
  let attempt = 0
  while (attempt < MAX_RETRIES) {
    try {
      await page.goto('https://www.linkedin.com', {timeout: 60000})
      break
    } catch (error) {
      attempt++
      console.log(`Retrying navigation, attempt ${attempt}`)
      if (attempt >= MAX_RETRIES) throw error
    }
  }

  const isLoggedIn = await page.evaluate(() => !!document.querySelector('.feed-identity-module__actor-meta'))

  if (!isLoggedIn) {
    await login(page)
    await saveCookies(page, userId)
  }
}
