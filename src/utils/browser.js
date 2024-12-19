import puppeteer from 'puppeteer'

export async function initializeBrowser({headless = true, maximized = true} = {}) {
  const args = maximized ? ['--start-maximized'] : []
  const browser = await puppeteer.launch({headless, args})
  const page = await browser.newPage()

  await page.setRequestInterception(true)
  const blockedResources = new Set(['image', 'video', 'media', 'font', 'fetch'])
  page.on('request', (request) => {
    if (blockedResources.has(request.resourceType())) {
      request.abort()
    } else {
      request.continue()
    }
  })

  const viewport = maximized
    ? await page.evaluate(() => ({
        width: window.screen.width,
        height: window.screen.height,
      }))
    : {width: 1366, height: 768}

  await page.setViewport(viewport)

  return {browser, page}
}
