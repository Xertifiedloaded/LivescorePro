const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const { pool } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')
const router = express.Router()
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  })
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  })
  return { accessToken, refreshToken }
}
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 50 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').optional().isLength({ max: 50 }).trim(),
    body('lastName').optional().isLength({ max: 50 }).trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { username, email, password, firstName, lastName } = req.body
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [username, email]
      )

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Username or email already exists' })
      }

      const saltRounds = 12
      const passwordHash = await bcrypt.hash(password, saltRounds)

      const result = await pool.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email`,
        [username, email, passwordHash, firstName, lastName]
      )

      const user = result.rows[0]
      const { accessToken, refreshToken } = generateTokens(user.id)

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiresAt]
      )

      res.status(201).json({
        message: 'User registered successfully',
        user: { id: user.id, username: user.username, email: user.email },
        accessToken,
        refreshToken,
      })
    } catch (error) {
      console.error('Registration error:', error)
      res.status(500).json({ error: 'Registration failed' })
    }
  }
)

router.post(
  '/login',
  [body('username').notEmpty().trim(), body('password').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { username, password } = req.body
      const result = await pool.query(
        'SELECT id, username, email, password_hash, is_active FROM users WHERE username = $1 OR email = $1',
        [username]
      )

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const user = result.rows[0]

      if (!user.is_active) {
        return res.status(401).json({ error: 'Account is deactivated' })
      }
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }
      const { accessToken, refreshToken } = generateTokens(user.id)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      await pool.query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, refreshToken, expiresAt]
      )

      res.json({
        message: 'Login successful',
        user: { id: user.id, username: user.username, email: user.email },
        accessToken,
        refreshToken,
      })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ error: 'Login failed' })
    }
  }
)

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' })
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

    const tokenResult = await pool.query(
      'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
      [refreshToken]
    )

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' })
    }
    const userResult = await pool.query(
      'SELECT id, username, email, is_active FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    const user = userResult.rows[0]
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id)
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, newRefreshToken, expiresAt]
    )

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: { id: user.id, username: user.username, email: user.email },
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({ error: 'Token refresh failed' })
  }
})

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken])
    }
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id])
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name, balance, created_at FROM users WHERE id = $1',
      [req.user.id]
    )

    res.json({ user: result.rows[0] })
  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

module.exports = router
