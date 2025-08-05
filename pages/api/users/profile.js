import { body, validationResult } from 'express-validator'
import { pool } from '../../../lib/database'
import { authenticateToken, errorHandler } from '../../../lib/middleware'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return getUserProfile(req, res)
  } else if (req.method === 'PUT') {
    return updateUserProfile(req, res)
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getUserProfile(req, res) {
  try {
    const user = await authenticateToken(req)

    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name, balance, created_at FROM users WHERE id = $1',
      [user.id]
    )

    res.status(200).json({ user: result.rows[0] })
  } catch (error) {
    errorHandler(error, req, res)
  }
}

async function updateUserProfile(req, res) {
  try {
    const user = await authenticateToken(req)

    // Validate input
    const validateUpdate = [
      body('firstName').optional().isLength({ max: 50 }).trim(),
      body('lastName').optional().isLength({ max: 50 }).trim(),
      body('email').optional().isEmail().normalizeEmail(),
    ]

    await Promise.all(validateUpdate.map((validation) => validation.run(req)))

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { firstName, lastName, email } = req.body
    const userId = user.id

    // Check if email is already in use
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

    res.status(200).json({
      message: 'Profile updated successfully',
      user: result.rows[0],
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}
