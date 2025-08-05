import { pool } from "../../../lib/database"
import { authenticateToken, errorHandler } from "../../../lib/middleware"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const user = await authenticateToken(req)

    const result = await pool.query(
      "SELECT id, username, email, first_name, last_name, balance, created_at FROM users WHERE id = $1",
      [user.id],
    )

    res.status(200).json({ user: result.rows[0] })
  } catch (error) {
    errorHandler(error, req, res)
  }
}
