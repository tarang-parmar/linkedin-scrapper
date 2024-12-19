import {loadCookies} from '../utils/cookiesManager.js'
import {initializeBrowser} from '../utils/browser.js'
import Profile from '../models/Profile.js'

async function connectProfiles(page, profiles, connectMsz) {
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i]
    try {
      console.log(`Navigating to profile link: ${profile.link}`)
      await page.goto(profile.link)

      const connectButtonSelector = `button[aria-label="Invite ${profile.name} to connect"]`

      await page.evaluate((selector) => {
        const button = document.querySelector(selector)
        console.log(`⚡ > awaitpage.evaluate > button--->`, button)
        if (button) {
          button.click()
        } else {
          console.error(`Button with aria-label "${selector}" not found.`)
        }
      }, connectButtonSelector)

      console.log(`Clicked connect button for ${profile.name}`)

      await page.waitForSelector('.artdeco-modal', {
        visible: true,
        timeout: 30000,
      })

      await page.waitForFunction(
        () =>
          document.querySelector('.artdeco-modal') && document.querySelector('.artdeco-modal').offsetHeight > 0,
        {timeout: 30000}
      )

      if (connectMsz && connectMsz.trim() !== '') {
        console.log(`Waiting for "Add a note" button for ${profile.name}`)
        await page.waitForSelector('button[aria-label="Add a note"]', {
          visible: true,
          timeout: 30000,
        })
        console.log(`Clicking "Add a note" button for ${profile.name}`)
        await page.click('button[aria-label="Add a note"]')

        console.log(`Waiting for textarea for ${profile.name}`)
        await page.waitForSelector('#custom-message', {
          visible: true,
          timeout: 30000,
        })
        console.log(`Typing message for ${profile.name}`)
        await page.type('#custom-message', connectMsz.replace('USERNAME', profile?.name?.split(' ')[0]))

        console.log(`Waiting for "Send invitation" button for ${profile.name}`)
        await page.waitForSelector('button[aria-label="Send invitation"]', {
          visible: true,
          timeout: 30000,
        })
        console.log(`Clicking "Send invitation" button for ${profile.name}`)
        await page.click('button[aria-label="Send invitation"]')
      } else {
        console.log(`Waiting for "Send without a note" button for ${profile.name}`)
        await page.waitForSelector('button[aria-label="Send without a note"]', {
          visible: true,
          timeout: 30000,
        })
        console.log(`Clicking "Send without a note" button for ${profile.name}`)
        await page.click('button[aria-label="Send without a note"]')
      }

      console.log(`Waiting for modal to close for ${profile.name}`)
      await page.waitForSelector('.artdeco-modal', {
        hidden: true,
        timeout: 30000,
      })
    } catch (error) {
      console.error(`Error connecting to ${profile.name}:`, error)
    }

    if ((i + 1) % 100 === 0) {
      console.log('Breaking loop after 100 profiles')
      break
    }
  }
}

export async function runConnectProfiles(userId) {
  const {browser, page} = await initializeBrowser({
    headless: false,
    maximized: true,
  })

  await loadCookies(page, userId)

  const connectMsz = ''

  const profiles = await Profile.find({userId}).exec()

  await connectProfiles(page, profiles.slice(0, 2), connectMsz)

  await browser.close()
}
