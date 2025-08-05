const jwt = require("jsonwebtoken")
const { pool } = require("../config/database")


const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] 

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const result = await pool.query("SELECT id, username, email, is_active FROM users WHERE id = $1", [decoded.userId])

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ error: "Invalid token or user not found" })
    }

    req.user = result.rows[0]
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    }
    return res.status(403).json({ error: "Invalid token" })
  }
}

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    req.user = null
    return next()
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const result = await pool.query("SELECT id, username, email, is_active FROM users WHERE id = $1", [decoded.userId])

    req.user = result.rows.length > 0 && result.rows[0].is_active ? result.rows[0] : null
  } catch (error) {
    req.user = null
  }

  next()
}

module.exports = {
  authenticateToken,
  optionalAuth,
}
