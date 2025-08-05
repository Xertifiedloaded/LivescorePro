import { pool } from "../../../lib/database"
import { authenticateToken, errorHandler } from "../../../lib/middleware"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const user = await authenticateToken(req)
    const userId = user.id

    const statsResult = await pool.query(
      `
      SELECT 
        COUNT(*) as total_predictions,
        COUNT(CASE WHEN status = 'WON' THEN 1 END) as won_predictions,
        COUNT(CASE WHEN status = 'LOST' THEN 1 END) as lost_predictions,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_predictions,
        COALESCE(SUM(CASE WHEN status = 'WON' THEN potential_winnings ELSE 0 END), 0) as total_winnings,
        COALESCE(SUM(stake_amount), 0) as total_staked
      FROM predictions 
      WHERE user_id = $1
    `,
      [userId],
    )

    const stats = statsResult.rows[0]
    const winRate =
      stats.total_predictions > 0
        ? ((stats.won_predictions / (stats.won_predictions + stats.lost_predictions)) * 100).toFixed(2)
        : 0

    res.status(200).json({
      stats: {
        ...stats,
        win_rate: Number.parseFloat(winRate),
        profit_loss: Number.parseFloat(stats.total_winnings) - Number.parseFloat(stats.total_staked),
      },
    })
  } catch (error) {
    errorHandler(error, req, res)
  }
}
