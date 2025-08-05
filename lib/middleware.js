import { pool } from "./database"
import { verifyAccessToken } from "./auth"
import { validationResult } from "express-validator" // Import validationResult

export const authenticateToken = async (req) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    throw new Error("Access token required")
  }

  try {
    const decoded = verifyAccessToken(token)
    if (!decoded) {
      throw new Error("Invalid token")
    }

    const result = await pool.query("SELECT id, username, email, is_active FROM users WHERE id = $1", [decoded.userId])

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      throw new Error("Invalid token or user not found")
    }

    return result.rows[0]
  } catch (error) {
    throw new Error("Authentication failed")
  }
}

export const optionalAuth = async (req) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return null
  }

  try {
    const decoded = verifyAccessToken(token)
    if (!decoded) return null

    const result = await pool.query("SELECT id, username, email, is_active FROM users WHERE id = $1", [decoded.userId])

    return result.rows.length > 0 && result.rows[0].is_active ? result.rows[0] : null
  } catch (error) {
    return null
  }
}

export const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Run validations
    await Promise.all(validations.map((validation) => validation.run(req)))

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    next()
  }
}

export const corsMiddleware = (req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", true)
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT")
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
  )

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  next()
}

export const errorHandler = (error, req, res) => {
  console.error("API Error:", error)

  if (error.message === "Access token required") {
    return res.status(401).json({ error: "Access token required" })
  }

  if (error.message === "Authentication failed" || error.message === "Invalid token") {
    return res.status(401).json({ error: "Authentication failed" })
  }

  return res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  })
}
