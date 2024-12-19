import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import {sendResponse} from '../utils/response.js'
import {sendEmail} from '../utils/email.js'

const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

const generateHashedToken = (length) => {
  const token = crypto.randomBytes(length).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  return {token, hashedToken}
}

export const signUp = async (req, res) => {
  const {email, password} = req.body

  try {
    const userExists = await User.findOne({email})

    if (userExists) {
      return sendResponse(res, 400, true, 'User already exists')
    }

    const {token, hashedToken} = generateHashedToken(32)

    const user = await User.create({
      email,
      password,
      emailVerificationToken: hashedToken,
      isVerified: false,
    })

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/verify-email/${token}`
    console.log(`⚡ > signUp > verificationUrl--->`, verificationUrl)

    await sendEmail({
      to: user.email,
      subject: 'Email Verification',
      html: `<p>Verify your email by clicking on the following link:</p>
             <a href="${verificationUrl}" target="_blank">Click Here To Verify</a>`,
    })

    sendResponse(res, 201, true, 'User regisered successfully. Please check your email to verify your account.', {
      _id: user._id,
      email: user.email,
    })
  } catch (err) {
    return sendResponse(res, 500, false, 'Internal server error')
  }
}

export const mail = async (req, res) => {
  const {email} = req.body

  let data = await sendEmail({
    to: email,
    subject: 'Email Verification',
    text: `Verify your email by clicking on the following link: `,
  })
  console.log(`data`, data)

  sendResponse(res, 200, true, 'Mail sent successfully', {data})
}

export const verifyEmail = async (req, res) => {
  const {token} = req.params

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      isVerified: false,
    })

    if (!user) {
      return sendResponse(res, 400, false, 'Invalid or expired token')
    }

    user.isVerified = true
    user.emailVerificationToken = undefined

    await user.save()

    sendResponse(res, 200, true, 'Email verified successfully')
  } catch (err) {
    return sendResponse(res, 500, false, 'Internal server error')
  }
}

export const signIn = async (req, res) => {
  const {email, password} = req.body

  try {
    const user = await User.findOne({email})

    if (!user) {
      return sendResponse(res, 401, false, 'Invalid email or password')
    }

    if (!user.isVerified) {
      return sendResponse(res, 401, false, 'Please verify your email before logging in')
    }

    if (user && (await user.matchPassword(password))) {
      sendResponse(res, 200, true, 'User logged in successfully', {
        _id: user._id,
        email: user.email,
        token: generateToken(user._id),
      })
    } else {
      sendResponse(res, 401, false, 'Invalid email or password')
    }
  } catch (err) {
    return sendResponse(res, 500, false, 'Internal server error')
  }
}

export const forgotPassword = async (req, res) => {
  const {email} = req.body

  try {
    const user = await User.findOne({email})

    if (!user) {
      return sendResponse(res, 404, false, 'User not found')
    }

    const {token, hashedToken} = generateHashedToken(32)
    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000 // 10 minutes expiry
    await user.save()

    const resetUrl = `${req.protocol}://${req.get('host')}/api/reset-password/${token}`
    // await sendEmail({
    //   to: user.email,
    //   subject: "Password Reset",
    //   text: `Reset your password by clicking on the following link: ${resetUrl}`,
    // });

    sendResponse(res, 200, true, 'Password reset email sent')
  } catch (err) {
    return sendResponse(res, 500, false, 'Internal server error')
  }
}

export const resetPassword = async (req, res) => {
  const {token} = req.params
  const {password} = req.body

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {$gt: Date.now()},
    })
    if (!user) {
      return sendResponse(res, 400, false, 'Invalid or expired token')
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    sendResponse(res, 200, true, 'Password reset successfully')
  } catch (err) {
    return sendResponse(res, 500, false, 'Internal server error')
  }
}
