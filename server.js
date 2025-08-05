const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const matchRoutes = require("./routes/matches");
const publicMatchRoutes = require("./routes/public-matches");
const predictionRoutes = require("./routes/predictions");
const userRoutes = require("./routes/users");

const { initializeDatabase, testConnection } = require("./config/database");
const { startFixtureSync } = require("./services/fixtureService");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(morgan("combined"));
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
        imgSrc: ["'self'", "https://img.icons8.com", "data:"],
        connectSrc: ["'self'"],
      },
    },
  })
);

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.get("/api", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use("/api/matches", matchRoutes);
app.use("/api/public/matches", publicMatchRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/users", userRoutes);
app.get("/api/health", (req, res) => {
  res.json({
    message: "Welcome to Football Betting API",
    version: "1.0.0",
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: process.env.DB_NAME,
  });
});
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: "The requested resource does not exist",
    availableEndpoints: [
      "/api/health",
      "/api/matches",
      "/api/public/matches",
      "/api/auth",
      "/api/predictions",
      "/api/users",
    ],
  });
});
app.get("/api", (req, res) => {
  res.json({
    name: "Football Betting API",
    version: "1.0.0",
    endpoints: {
      public: {
        matches: "/api/matches",
        live_matches: "/api/matches/live",
        leagues: "/api/matches/leagues/all",
        today_matches: "/api/public/matches/today",
        week_matches: "/api/public/matches/week",
        popular_matches: "/api/public/matches/popular",
        match_stats: "/api/public/matches/stats",
      },
      protected: {
        auth: "/api/auth",
        predictions: "/api/predictions",
        users: "/api/users",
      },
    },
    documentation: "See README.md for detailed API documentation",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

async function startServer() {
  try {
    console.log("Initializing database...");
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error(
        "Cannot connect to database. Please check your configuration."
      );
    }

    await initializeDatabase();
    console.log("Database initialized successfully");
    if (
      process.env.FOOTBALL_API_KEY &&
      process.env.FOOTBALL_API_KEY !== "your_football_data_org_api_key_here"
    ) {
      startFixtureSync();
      console.log("Fixture synchronization started");
    } else {
      console.log("FOOTBALL_API_KEY not configured, skipping fixture sync");
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🏈 Public API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    console.error(
      "Please check your database configuration and ensure PostgreSQL is running"
    );
    process.exit(1);
  }
}

startServer();
