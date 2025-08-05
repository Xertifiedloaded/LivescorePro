import jwt from "jsonwebtoken"
import { prisma } from "./database.js"

const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
const ACCESS_TOKEN_EXPIRES = "15m"
const REFRESH_TOKEN_EXPIRES = "7d"

export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES,
  })

  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES,
  })

  return { accessToken, refreshToken }
}

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET)
  } catch (error) {
    return null
  }
}

export const generateEmailVerifyToken = () => {
  return jwt.sign({ purpose: "email_verify" }, JWT_SECRET, { expiresIn: "24h" })
}

export const generateResetPasswordToken = () => {
  return jwt.sign({ purpose: "reset_password" }, JWT_SECRET, { expiresIn: "1h" })
}

export const storeRefreshToken = async (userId, refreshToken) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken },
  })
}

export const removeRefreshToken = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  })
}
