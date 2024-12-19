import express from 'express'
import {connectLinkedInProfiles, scrapeLinkedInProfiles} from '../controllers/scraperController.js'
import {authMiddleware} from '../middleware/authMiddleware.js'
import {sendResponse} from '../utils/response.js'

const scrapRoutes = express.Router()

scrapRoutes.post('/scrape', authMiddleware, scrapeLinkedInProfiles)
scrapRoutes.get('/connect', authMiddleware, connectLinkedInProfiles)

scrapRoutes.get('/data', authMiddleware, async (req, res) => {
  sendResponse(res, 200, true, 'Request successful', [{name: 'tarang', age: 25, no: 999848780}])
})

export default scrapRoutes
