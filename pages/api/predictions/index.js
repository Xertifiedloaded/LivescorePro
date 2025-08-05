import { body, validationResult } from 'express-validator'
import { pool } from '../../../lib/database'
import { authenticateToken, errorHandler } from '../../../lib/middleware'

const validatePrediction = [
  body('matchId').isInt({ min: 1 }).withMessage('Match ID must be a positive integer'),
  body('predictionType')
    .isIn(['HOME', 'DRAW', 'AWAY'])
    .withMessage('Prediction type must be HOME, DRAW, or AWAY'),
  body('stakeAmount')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Stake amount must be between 0.01 and 10000'),
]

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return createPrediction(req, res)
  } else if (req.method === 'GET') {
    return getUserPredictions(req, res)
  } else {
    return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function createPrediction(req, res) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const user = await authenticateToken(req)
    if (!user) {
      await client.query('ROLLBACK')
      console.log('❌ Authentication failed')
      return res.status(401).json({ error: 'Authentication required' })
    }

    await Promise.all(validatePrediction.map((validation) => validation.run(req)))
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      await client.query('ROLLBACK')
      console.log('❌ Validation errors:', errors.array())
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
          .array()
          .map((err) => `${err.param}: ${err.msg}`)
          .join(', '),
        errors: errors.array(),
      })
    }

    const { matchId, predictionType, stakeAmount } = req.body
    const userId = user.id
    const matchIdInt = Number.parseInt(matchId, 10)
    const stakeAmountFloat = Number.parseFloat(stakeAmount)

    console.log('✅ Processed values:', { matchIdInt, predictionType, stakeAmountFloat, userId })
    const matchResult = await client.query(
      `SELECT id, match_date, status, odds_home, odds_draw, odds_away 
       FROM matches 
       WHERE id = $1 AND status = 'SCHEDULED' AND match_date > NOW()`,
      [matchIdInt]
    )

    if (matchResult.rows.length === 0) {
      await client.query('ROLLBACK')
      console.log('❌ Match not found or not available for betting:', matchIdInt)
      return res.status(400).json({ error: 'Match not available for betting' })
    }

    const match = matchResult.rows[0]

    // Check for existing prediction - this is the key fix
    const existingPrediction = await client.query(
      'SELECT id FROM predictions WHERE user_id = $1 AND match_id = $2',
      [userId, matchIdInt]
    )

    console.log('🔍 Existing prediction query result:', existingPrediction.rows)

    if (existingPrediction.rows.length > 0) {
      await client.query('ROLLBACK')
      console.log('❌ User already has a prediction for this match')
      return res.status(400).json({
        error: 'You already have a prediction for this match',
        code: 'DUPLICATE_PREDICTION',
        existingPredictionId: existingPrediction.rows[0].id,
      })
    }

    console.log('✅ No existing prediction found')

    // Check user balance
    const userResult = await client.query('SELECT balance FROM users WHERE id = $1', [userId])
    console.log('🔍 User balance query result:', userResult.rows)

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK')
      console.log('❌ User not found in database')
      return res.status(400).json({ error: 'User not found' })
    }

    const userBalance = Number.parseFloat(userResult.rows[0].balance)
    console.log('✅ User balance:', userBalance, 'Stake amount:', stakeAmountFloat)

    if (userBalance < stakeAmountFloat) {
      await client.query('ROLLBACK')
      console.log('❌ Insufficient balance')
      return res.status(400).json({ error: 'Insufficient balance' })
    }

    console.log('✅ Balance check passed')

    // Get odds
    console.log('🔍 Getting odds for prediction type:', predictionType)
    let odds
    switch (predictionType) {
      case 'HOME':
        odds = match.odds_home
        break
      case 'DRAW':
        odds = match.odds_draw
        break
      case 'AWAY':
        odds = match.odds_away
        break
      default:
        await client.query('ROLLBACK')
        console.log('❌ Invalid prediction type:', predictionType)
        return res.status(400).json({ error: 'Invalid prediction type' })
    }

    console.log('✅ Odds found:', odds)

    if (!odds || Number.parseFloat(odds) <= 0) {
      await client.query('ROLLBACK')
      console.log('❌ Odds not available or invalid:', odds)
      return res.status(400).json({ error: 'Odds not available for this prediction type' })
    }

    const potentialWinnings = stakeAmountFloat * Number.parseFloat(odds)

    // Create prediction
    const predictionResult = await client.query(
      `INSERT INTO predictions (user_id, match_id, prediction_type, stake_amount, potential_winnings, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING *`,
      [userId, matchIdInt, predictionType, stakeAmountFloat, potentialWinnings]
    )

    console.log('✅ Prediction created:', predictionResult.rows[0])

    // Update user balance
    console.log('🔍 Updating user balance...')
    const balanceUpdateResult = await client.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING balance',
      [stakeAmountFloat, userId]
    )

    console.log('✅ Balance updated:', balanceUpdateResult.rows[0])

    await client.query('COMMIT')
    console.log('✅ Transaction committed successfully')

    res.status(201).json({
      message: 'Prediction created successfully',
      prediction: predictionResult.rows[0],
    })
  } catch (error) {
    await client.query('ROLLBACK')

    // Enhanced error handling
    if (error.code === '23505') {
      console.log('❌ Database error: Unique constraint violation')
      return res.status(400).json({
        error: 'You already have a prediction for this match',
        code: 'DUPLICATE_PREDICTION',
      })
    } else if (error.code === '23503') {
      console.log('❌ Database error: Foreign key constraint violation')
      return res.status(400).json({ error: 'Invalid match or user reference' })
    } else if (error.code === '23514') {
      console.log('❌ Database error: Check constraint violation')
      return res.status(400).json({ error: 'Data violates database constraints' })
    }

    console.error('❌ Unexpected error:', error)
    errorHandler(error, req, res)
  } finally {
    client.release()
  }
}

async function getUserPredictions(req, res) {
  try {
    const user = await authenticateToken(req)
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { status, limit = 20, offset = 0 } = req.query
    const userId = user.id

    let query = `
      SELECT p.*, m.home_team, m.away_team, m.match_date, m.status as match_status,
             l.name as league_name, l.country
      FROM predictions p
      JOIN matches m ON p.match_id = m.id
      LEFT JOIN leagues l ON m.league_id = l.id
      WHERE p.user_id = $1
    `
    const params = [userId]

    if (status) {
      query += ` AND p.status = $${params.length + 1}`
      params.push(status)
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(Number.parseInt(limit), Number.parseInt(offset))

    const result = await pool.query(query, params)

    res.status(200).json({
      predictions: result.rows,
      pagination: {
        limit: Number.parseInt(limit),
        offset: Number.parseInt(offset),
      },
    })
  } catch (error) {
    console.error('Error getting user predictions:', error)
    errorHandler(error, req, res)
  }
}
