import { body, validationResult } from "express-validator"
import { pool } from "../../../lib/database.js"
import { hashPassword, generateTokens } from "../../../lib/auth.js"

const validateRegister = [
  body("username").isLength({ min: 3, max: 50 }).trim(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("firstName").optional().isLength({ max: 50 }).trim(),
  body("lastName").optional().isLength({ max: 50 }).trim(),
]

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    await Promise.all(validateRegister.map((validation) => validation.run(req)))
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { username, email, password, firstName, lastName } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" })
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: "Username must be between 3 and 50 characters" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" })
    }

    const existingUser = await pool.query("SELECT id FROM users WHERE username = $1 OR email = $2", [username, email])

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Username or email already exists" })
    }

    const passwordHash = await hashPassword(password)

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email`,
      [username, email, passwordHash, firstName || null, lastName || null],
    )

    const user = result.rows[0]
    const { accessToken, refreshToken } = generateTokens(user.id)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await pool.query("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)", [
      user.id,
      refreshToken,
      expiresAt,
    ])

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
