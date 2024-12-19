import jwt from 'jsonwebtoken'
import {runScraper} from '../scrapers/scraper.js'
import Profile from '../models/Profile.js'
import {sendResponse} from '../utils/response.js'
import {runConnectProfiles} from '../scrapers/connectProfiles.js'

export const scrapeLinkedInProfiles = async (req, res) => {
  console.log(`reqqqqq`)

  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, 401, false, 'Authorization header missing or malformed')
    }

    const token = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return sendResponse(res, 401, false, 'Invalid token')
    }

    const {keyword, locations, connectionLevels, currentCompanies, searchUrl} = req.body

    const allProfiles = await runScraper(
      keyword,
      locations,
      connectionLevels,
      currentCompanies,
      searchUrl,
      decoded?.id
    )

    const savedProfiles = allProfiles.map((profile) => ({
      ...profile,
      userId: decoded?.id,
    }))
    console.log(`💥 > savedProfiles > savedProfiles--->`, savedProfiles)
    // const savedProfiles = await Profile.insertMany(
    //   allProfiles?.map((profile) => ({
    //     ...profile,
    //     userId: decoded?.id,
    //   }))
    // );

    sendResponse(res, 200, true, 'Request successful', {savedProfiles})
  } catch (error) {
    console.error('Error in scrapeLinkedInProfiles:', error)
    sendResponse(res, 500, false, 'Internal server error')
  }
}

export const connectLinkedInProfiles = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, 401, false, 'Authorization header missing or malformed')
    }

    const token = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return sendResponse(res, 401, false, 'Invalid token')
    }

    await runConnectProfiles(decoded.id)

    sendResponse(res, 200, true, 'Request successful')
  } catch (error) {
    console.error('Error in connectLinkedInProfiles:', error)
    sendResponse(res, 500, false, 'Error in connectLinkedInProfiles')
  }
}
