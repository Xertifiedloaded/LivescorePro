const express = require('express')
const { body, validationResult } = require('express-validator')
const { pool } = require('../config/database')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT balance FROM users WHERE id = $1', [req.user.id])

    res.json({ balance: Number.parseFloat(result.rows[0].balance) })
  } catch (error) {
    console.error('Fetch balance error:', error)
    res.status(500).json({ error: 'Failed to fetch balance' })
  }
})

// Add funds to user account (simulation - in real app this would integrate with payment gateway)
router.post(
  '/add-funds',
  authenticateToken,
  [body('amount').isFloat({ min: 1, max: 10000 })],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { amount } = req.body
      const userId = req.user.id

      const result = await pool.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
        [amount, userId]
      )

      res.json({
        message: 'Funds added successfully',
        new_balance: Number.parseFloat(result.rows[0].balance),
      })
    } catch (error) {
      console.error('Add funds error:', error)
      res.status(500).json({ error: 'Failed to add funds' })
    }
  }
)

router.put(
  '/profile',
  authenticateToken,
  [
    body('firstName').optional().isLength({ max: 50 }).trim(),
    body('lastName').optional().isLength({ max: 50 }).trim(),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { firstName, lastName, email } = req.body
      const userId = req.user.id
      if (email) {
        const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [
          email,
          userId,
        ])

        if (emailCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Email already in use' })
        }
      }

      const updateFields = []
      const values = []
      let paramCount = 1

      if (firstName !== undefined) {
        updateFields.push(`first_name = $${paramCount}`)
        values.push(firstName)
        paramCount++
      }

      if (lastName !== undefined) {
        updateFields.push(`last_name = $${paramCount}`)
        values.push(lastName)
        paramCount++
      }

      if (email !== undefined) {
        updateFields.push(`email = $${paramCount}`)
        values.push(email)
        paramCount++
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' })
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
      values.push(userId)

      const query = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING id, username, email, first_name, last_name, balance
    `

      const result = await pool.query(query, values)

      res.json({
        message: 'Profile updated successfully',
        user: result.rows[0],
      })
    } catch (error) {
      console.error('Update profile error:', error)
      res.status(500).json({ error: 'Failed to update profile' })
    }
  }
)

module.exports = router
