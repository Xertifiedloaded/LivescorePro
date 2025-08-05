import { body, validationResult } from 'express-validator'
import { pool } from '../../../lib/database'
import { authenticateToken, errorHandler } from '../../../lib/middleware'

const validateAddFunds = [body('amount').isFloat({ min: 1, max: 10000 })]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = await authenticateToken(req)

    // Run validations
    await Promise.all(validateAddFunds.map((validation) => validation.run(req)))

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { amount } = req.body
    const userId = user.id

    const result = await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance',
      [amount, userId]
    )

    res.status(200).json({
      message: 'Funds added successfully',
      new_balance: Number.parseFloat(result.rows[0].balance),
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}
