import {loadCookies} from '../utils/cookiesManager.js'
import {waitForTimeout} from '../utils/wait.js'
import {initializeBrowser} from '../utils/browser.js'

export async function login(page) {
  await page.goto('https://www.linkedin.com/login')
  await page.type('#username', process.env.EMAIL)
  await page.type('#password', process.env.PASSWORD)
  await page.click('[type="submit"]')

  console.log('Complete 2FA...')

  while (true) {
    try {
      const isLoggedIn = await page.evaluate(() => !!document.querySelector('.feed-identity-module__actor-meta'))

      if (isLoggedIn) {
        console.log('Login successful.')
        break
      } else {
        console.log('Still waiting for login completion...')
        await waitForTimeout(5000)
      }
    } catch (error) {
      console.error('Error during login check:', error)
      await waitForTimeout(5000)
    }
  }
}

async function searchProfiles(page, keyword, locations = [], connectionLevels = [], currentCompanies = []) {
  if (keyword) {
    // global search
    try {
      await page.waitForSelector('.search-global-typeahead__input', {
        visible: true,
        timeout: 30000,
      })
      await page.type('.search-global-typeahead__input', keyword)
      await page.keyboard.press('Enter')
      await waitForTimeout(3000)
    } catch (error) {
      console.log(`⚡ > error--->`, error)
    }

    // people button filter
    const peopleButtonSelector = 'button.artdeco-pill'
    try {
      await page.waitForSelector(peopleButtonSelector, {
        visible: true,
        timeout: 30000,
      })
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button.artdeco-pill'))
        const button = buttons.find((btn) => btn.textContent.trim() === 'People')
        if (button) button.click()
      })
    } catch (error) {
      console.error("Error finding 'People' button:", error)
      return
    }
    await waitForTimeout(1500)

    // connection level filter
    for (const connectionLevel of connectionLevels) {
      try {
        await page.waitForSelector(`[aria-label="${connectionLevel?.trim()}"]`, {
          visible: true,
          timeout: 10000,
        })
        await page.click(`[aria-label="${connectionLevel?.trim()}"]`)
        await waitForTimeout(2000)
      } catch (error) {
        console.error(`Error applying connection level "${connectionLevel}":`, error)
      }
    }

    // locations filter
    try {
      if (locations.length > 0) {
        await page.waitForSelector(`#searchFilter_geoUrn`, {
          visible: true,
          timeout: 10000,
        })
        await page.click('#searchFilter_geoUrn')
        await waitForTimeout(1000)

        for (let i = 0; i < locations.length; i++) {
          const location = locations[i]

          try {
            await page.type('[placeholder="Add a location"]', location.trim())
            await waitForTimeout(1000)

            await page.keyboard.press('ArrowDown')
            await waitForTimeout(1000)
            await page.keyboard.press('Enter')
            await waitForTimeout(1000)

            await page.focus('[placeholder="Add a location"]')
            await page.keyboard.down('Shift')
            await page.keyboard.press('Home')
            await page.keyboard.up('Shift')
            await page.keyboard.press('Backspace')
            await waitForTimeout(200)
          } catch (error) {
            console.error(`Error applying location "${location}":`, error)
          }
        }

        await page.waitForSelector('[aria-label="Apply current filter to show results"]', {
          visible: true,
          timeout: 10000,
        })
        await page.click('[aria-label="Apply current filter to show results"]')
        await waitForTimeout(2000)
      }
    } catch (error) {
      console.error('Error with location filtering:', error)
    }

    // currentCompany filter
    try {
      if (currentCompanies.length > 0) {
        await page.waitForSelector(`#searchFilter_currentCompany`, {
          visible: true,
          timeout: 10000,
        })
        await page.click('#searchFilter_currentCompany')
        await waitForTimeout(1000)

        for (let i = 0; i < currentCompanies.length; i++) {
          const currentCompany = currentCompanies[i]

          try {
            await page.type('[placeholder="Add a company"]', currentCompany.trim())
            await waitForTimeout(1000)

            await page.keyboard.press('ArrowDown')
            await waitForTimeout(1000)
            await page.keyboard.press('Enter')
            await waitForTimeout(1000)

            await page.focus('[placeholder="Add a company"]')
            await page.keyboard.down('Shift')
            await page.keyboard.press('Home')
            await page.keyboard.up('Shift')
            await page.keyboard.press('Backspace')
            await waitForTimeout(200)
          } catch (error) {
            console.error(`Error applying currentCompany "${currentCompany}":`, error)
          }
        }

        await waitForTimeout(1000)
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        // await page.keyboard.press("Tab");
        await page.keyboard.press('Enter')
        await waitForTimeout(1000)
      }
    } catch (error) {
      console.error('Error with currentCompany filtering:', error)
    }
  }
}

async function scrapeProfiles(page, maxPages = 1) {
  const profiles = []

  for (let i = 0; i < maxPages; i++) {
    await page.waitForSelector('ul.reusable-search__entity-result-list li.reusable-search__result-container', {
      timeout: 60000,
    })

    const profileElements = await page.$$(
      'ul.reusable-search__entity-result-list li.reusable-search__result-container'
    )

    for (const profile of profileElements) {
      try {
        const name = await profile.$eval('a.app-aware-link span[aria-hidden="true"]', (el) =>
          el.textContent.trim()
        )
        const link = await profile.$eval('a.app-aware-link', (el) => el.href)

        const headline = await profile.$eval(
          'div.entity-result__primary-subtitle',
          (el) => el.textContent.trim() || ''
        )

        const location = await profile.$eval(
          'div.entity-result__secondary-subtitle',
          (el) => el.textContent.trim() || ''
        )

        profiles.push({name, link, headline, location})
      } catch (error) {
        console.error('Error extracting profile details:', error)
      }
    }

    try {
      const nextButtonSelector = 'button[aria-label="Next"]'

      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight)
        await new Promise((resolve) => setTimeout(resolve, 3000))
      })

      await page.waitForSelector(nextButtonSelector, {
        visible: true,
        timeout: 30000,
      })

      const nextButton = await page.$(nextButtonSelector)
      if (nextButton) {
        await nextButton.click()
      } else {
        console.error('Next button is either not found or disabled.')
        break
      }

      await waitForTimeout(3000)
    } catch (error) {
      console.error('Error navigating to next page:', error)
      break
    }
  }

  return profiles
}

export async function runScraper(keyword, locations, connectionLevels, currentCompanies, searchUrl, userId) {
  const {browser, page} = await initializeBrowser({
    headless: false,
    maximized: true,
  })

  await loadCookies(page, userId)

  const allProfiles = []
  if (searchUrl) {
    await page.goto(searchUrl)
    const profiles = await scrapeProfiles(page)
    allProfiles.push(...profiles)
  } else {
    await page.goto('https://www.linkedin.com/feed/')

    await searchProfiles(page, keyword, locations, connectionLevels, currentCompanies)
    const profiles = await scrapeProfiles(page)
    allProfiles.push(...profiles)
  }

  await browser.close()

  return allProfiles
}
