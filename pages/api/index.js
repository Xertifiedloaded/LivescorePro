export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const baseUrl = `${protocol}://${host}`;
  res.status(200).json({
    name: "Football Betting API",
    version: "1.0.0",
    framework: "Next.js",
    techStack: {
      backend: "Node.js",
      frontend: "Next.js",
      database: "PostgreSQL",
      auth: "JWT",
      runtime: "Vercel / Node.js",
      api: "REST",
      css: "Tailwind CSS",
      query: "Raw SQL via pg (node-postgres)",
    },
    endpoints: {
      public: {
        health: "/api/health",
        matches: "/api/matches",
        live_matches: "/api/matches/live",
        leagues: "/api/matches/leagues",
        all_leagues: "/api/matches/leagues/all",
        popular_matches: "/api/matches/popular",
        competition_matches: "/api/matches/competition/[code]",
        match_by_id: "/api/matches/[id]",
        today_matches: "/api/today",
        public_today_matches: "/api/public/matches/today",
        week_matches: "/api/public/matches/week",
        public_popular_matches: "/api/public/matches/popular",
        match_stats: "/api/public/matches/stats",
      },
      protected: {
        auth_register: "/api/auth/register",
        auth_login: "/api/auth/login",
        auth_logout: "/api/auth/logout",
        auth_profile: "/api/auth/profile",
        predictions: "/api/predictions",
        my_predictions: "/api/predictions/my",
        prediction_stats: "/api/predictions/stats",
        user_balance: "/api/users/balance",
        add_funds: "/api/users/add-funds",
        user_profile: "/api/users/profile",
      },
    },
    documentation: `${baseUrl}/documentation`,
    timestamp: new Date().toISOString(),
  });
}
