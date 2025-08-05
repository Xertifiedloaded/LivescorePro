import { body, validationResult } from "express-validator"
import { pool } from "../../../lib/database"
import { comparePassword, generateTokens } from "../../../lib/auth"
import { errorHandler } from "../../../lib/middleware"

const validateLogin = [body("username").notEmpty().trim(), body("password").notEmpty()]

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
  try {

    await Promise.all(validateLogin.map((validation) => validation.run(req)))
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const { username, password } = req.body
    const result = await pool.query(
      "SELECT id, username, email, password_hash, is_active FROM users WHERE username = $1 OR email = $1",
      [username],
    )
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }
    const user = result.rows[0]
    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" })
    }
    const isValidPassword = await comparePassword(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }
    const { accessToken, refreshToken } = generateTokens(user.id)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await pool.query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)", [
      user.id,
      refreshToken,
      expiresAt,
    ])
    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}
