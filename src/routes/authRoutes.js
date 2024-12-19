import express from 'express'
import {signUp, signIn, verifyEmail, forgotPassword, resetPassword, mail} from '../controllers/authController.js'

const authRoutes = express.Router()

authRoutes.post('/signup', signUp)
authRoutes.post('/mail', mail)
authRoutes.post('/signin', signIn)
authRoutes.get('/verify-email/:token', verifyEmail)
authRoutes.post('/forgot-password', forgotPassword)
authRoutes.post('/reset-password/:token', resetPassword)

export default authRoutes
