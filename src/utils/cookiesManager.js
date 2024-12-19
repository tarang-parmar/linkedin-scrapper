import User from '../models/User.js'
import {ensureLoggedIn} from './ensureLogin.js'

export async function loadCookies(page, userId) {
  const user = await User.findById(userId)

  if (user && user?.cookies?.length > 0) {
    await page.setCookie(...user?.cookies)
  } else {
    await ensureLoggedIn(page, userId)
  }
}

export async function saveCookies(page, userId) {
  const cookies = await page.cookies()

  await User.findByIdAndUpdate(userId, {cookies}, {new: true})
}
