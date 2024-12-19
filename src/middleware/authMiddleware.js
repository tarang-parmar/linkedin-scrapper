import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import {sendResponse} from '../utils/response.js'

export const authMiddleware = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (error) {
      sendResponse(res, 401, false, 'Not authorized, token expired')
    }
  }

  if (!token) {
    sendResponse(res, 401, false, 'Not authorized, no token')
  }
}
