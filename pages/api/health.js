import { testConnection } from "../../lib/database"

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const dbConnected = await testConnection()

    res.status(200).json({
      message: "Welcome to Football Betting API",
      version: "1.0.0",
      status: "OK",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbConnected ? "Connected" : "Disconnected",
      services: {
        database: dbConnected ? "healthy" : "unhealthy",
        api: "healthy",
      },
    })
  } catch (error) {
    res.status(500).json({
      message: "Health check failed",
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message,
    })
  }
}
