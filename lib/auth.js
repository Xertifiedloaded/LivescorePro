const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  })

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  })

  return { accessToken, refreshToken }
}

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch (error) {
    return null
  }
}

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12)
}

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateEmailToken = () => {
  return jwt.sign({ purpose: 'email_verify' }, process.env.JWT_SECRET, { expiresIn: '24h' })
}

export const generateResetToken = () => {
  return jwt.sign({ purpose: 'password_reset' }, process.env.JWT_SECRET, { expiresIn: '1h' })
}
