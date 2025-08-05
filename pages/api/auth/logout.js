import { pool } from "../../../lib/database"
import { authenticateToken, errorHandler } from "../../../lib/middleware"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const user = await authenticateToken(req)
    const { refreshToken } = req.body

    if (refreshToken) {
      await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [refreshToken])
    }

    // Delete all refresh tokens for user
    await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [user.id])

    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    errorHandler(error, req, res)
  }
}
