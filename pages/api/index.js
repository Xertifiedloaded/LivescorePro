
import React from "react"
import { renderToString } from "react-dom/server"
function APIDocumentation() {
  const externalApiEndpoints = [
    {
      title: "Team Matches",
      method: "GET",
      endpoint: "/v4/teams/{id}/matches",
      description: "Show all matches for a particular team",
      params: [
        "dateFrom={DATE}",
        "dateTo={DATE}",
        "season={YEAR}",
        "competitions={competitionIds}",
        "status={STATUS}",
        "venue={VENUE}",
        "limit={LIMIT}",
      ],
    },
    {
      title: "Team List",
      method: "GET",
      endpoint: "/v4/teams/",
      description: "List teams",
      params: ["limit={LIMIT}", "offset={OFFSET}"],
    },
    {
      title: "Competition Top Scorers",
      method: "GET",
      endpoint: "/v4/competitions/{id}/scorers",
      description: "List top scorers for a particular competition",
      params: ["limit={LIMIT}", "season={YEAR}"],
    },
    {
      title: "Person Matches",
      method: "GET",
      endpoint: "/v4/persons/{id}/matches",
      description: "Show all matches for a particular person",
      params: [
        "dateFrom={DATE}",
        "dateTo={DATE}",
        "status={STATUS}",
        "competitions={competitionIds}",
        "limit={LIMIT}",
        "offset={OFFSET}",
      ],
    },
    {
      title: "Single Match",
      method: "GET",
      endpoint: "/v4/matches/{id}",
      description: "Show one particular match",
      params: [],
    },
    {
      title: "Match List",
      method: "GET",
      endpoint: "/v4/matches",
      description: "List matches across competitions",
      params: [
        "competitions={competitionIds}",
        "ids={matchIds}",
        "dateFrom={DATE}",
        "dateTo={DATE}",
        "status={STATUS}",
      ],
    },
    {
      title: "Head to Head",
      method: "GET",
      endpoint: "/v4/matches/{id}/head2head",
      description: "List previous encounters for the teams of a match",
      params: ["limit={LIMIT}", "dateFrom={DATE}", "dateTo={DATE}", "competitions={competitionIds}"],
    },
  ]

  const publicEndpoints = [
    { name: "Health Check", endpoint: "/api/health", description: "API health status" },
    { name: "All Matches", endpoint: "/api/matches", description: "Get all matches" },
    { name: "Live Matches", endpoint: "/api/matches/live", description: "Get currently live matches" },
    { name: "Leagues", endpoint: "/api/matches/leagues", description: "Get available leagues" },
    { name: "All Leagues", endpoint: "/api/matches/leagues/all", description: "Get all leagues data" },
    { name: "Popular Matches", endpoint: "/api/matches/popular", description: "Get popular matches" },
    {
      name: "Competition Matches",
      endpoint: "/api/matches/competition/[code]",
      description: "Get matches by competition code",
    },
    { name: "Match by ID", endpoint: "/api/matches/[id]", description: "Get specific match by ID" },
    { name: "Today's Matches", endpoint: "/api/today", description: "Get today's matches" },
    {
      name: "Public Today Matches",
      endpoint: "/api/public/matches/today",
      description: "Public endpoint for today's matches",
    },
    { name: "Week Matches", endpoint: "/api/public/matches/week", description: "Get this week's matches" },
    { name: "Public Popular Matches", endpoint: "/api/public/matches/popular", description: "Public popular matches" },
    { name: "Match Statistics", endpoint: "/api/public/matches/stats", description: "Get match statistics" },
  ]

  const protectedEndpoints = [
    { name: "Register", endpoint: "/api/auth/register", description: "User registration" },
    { name: "Login", endpoint: "/api/auth/login", description: "User authentication" },
    { name: "Logout", endpoint: "/api/auth/logout", description: "User logout" },
    { name: "Profile", endpoint: "/api/auth/profile", description: "Get user profile" },
    { name: "Predictions", endpoint: "/api/predictions", description: "Manage predictions" },
    { name: "My Predictions", endpoint: "/api/predictions/my", description: "Get user's predictions" },
    { name: "Prediction Stats", endpoint: "/api/predictions/stats", description: "Get prediction statistics" },
    { name: "User Balance", endpoint: "/api/users/balance", description: "Get user balance" },
    { name: "Add Funds", endpoint: "/api/users/add-funds", description: "Add funds to account" },
    { name: "User Profile", endpoint: "/api/users/profile", description: "Manage user profile" },
  ]

  function showTab(tabName) {
    // Hide all tab panels
    const panels = document.querySelectorAll(".tab-panel")
    panels.forEach((panel) => {
      panel.classList.add("hidden")
    })

    // Remove active styles from all buttons
    const buttons = document.querySelectorAll("#external-tab-btn, #public-tab-btn, #protected-tab-btn")
    buttons.forEach((button) => {
      button.classList.remove("bg-white", "border-b-2", "border-primary")
      button.classList.add("hover:bg-gray-100")
    })

    // Show selected panel and activate button
    document.getElementById(tabName).classList.remove("hidden")
    const activeButton = document.getElementById(tabName + "-tab-btn")
    activeButton.classList.add("bg-white", "border-b-2", "border-primary")
    activeButton.classList.remove("hover:bg-gray-100")
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      // Show feedback
      const button = event.target
      const originalText = button.textContent
      button.textContent = "Copied!"
      button.classList.add("bg-green-500")
      button.classList.remove("bg-primary", "hover:bg-blue-600")

      setTimeout(() => {
        button.textContent = originalText
        button.classList.remove("bg-green-500")
        button.classList.add("bg-primary", "hover:bg-blue-600")
      }, 2000)
    })
  }

  return React.createElement("html", { lang: "en" }, [
    React.createElement("head", { key: "head" }, [
      React.createElement("meta", { key: "charset", charSet: "UTF-8" }),
      React.createElement("meta", {
        key: "viewport",
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      }),
      React.createElement("title", { key: "title" }, "Football Betting API Documentation"),
      React.createElement("script", { key: "tailwind", src: "https://cdn.tailwindcss.com" }),
      React.createElement(
        "script",
        { key: "tailwind-config" },
        `
        tailwind.config = {
          theme: {
            extend: {
              colors: {
                primary: '#667eea',
                secondary: '#764ba2'
              }
            }
          }
        }
      `,
      ),
    ]),
    React.createElement(
      "body",
      { key: "body", className: "bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen" },
      [
        React.createElement("div", { key: "container", className: "max-w-6xl mx-auto p-6" }, [
          // Header
          React.createElement(
            "div",
            { key: "header", className: "bg-white rounded-xl p-8 mb-8 shadow-xl text-center" },
            [
              React.createElement(
                "h1",
                {
                  key: "title",
                  className:
                    "text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
                },
                "Football Betting API",
              ),
              React.createElement(
                "p",
                { key: "description", className: "text-lg text-gray-600 mb-6" },
                "Complete API documentation for football match data, user management, and betting predictions",
              ),
              React.createElement("div", { key: "badges", className: "flex justify-center gap-3 flex-wrap" }, [
                React.createElement(
                  "span",
                  { key: "version", className: "bg-gray-100 px-3 py-1 rounded-full text-sm font-medium" },
                  "Version 1.0.0",
                ),
                React.createElement(
                  "span",
                  { key: "framework", className: "bg-gray-100 px-3 py-1 rounded-full text-sm font-medium" },
                  "Next.js",
                ),
                React.createElement(
                  "span",
                  { key: "database", className: "bg-gray-100 px-3 py-1 rounded-full text-sm font-medium" },
                  "PostgreSQL",
                ),
              ]),
            ],
          ),

          // Tabs
          React.createElement("div", { key: "tabs", className: "bg-white rounded-xl overflow-hidden shadow-xl" }, [
            React.createElement("div", { key: "tab-buttons", className: "flex bg-gray-50 border-b" }, [
              React.createElement(
                "button",
                {
                  key: "external-tab",
                  className:
                    "flex-1 px-6 py-4 font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 border-b-2 border-primary bg-white",
                  id: "external-tab-btn",
                  onClick: () => showTab("external"),
                },
                "External API",
              ),
              React.createElement(
                "button",
                {
                  key: "public-tab",
                  className:
                    "flex-1 px-6 py-4 font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200",
                  id: "public-tab-btn",
                  onClick: () => showTab("public"),
                },
                "Public Endpoints",
              ),
              React.createElement(
                "button",
                {
                  key: "protected-tab",
                  className:
                    "flex-1 px-6 py-4 font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200",
                  id: "protected-tab-btn",
                  onClick: () => showTab("protected"),
                },
                "Protected Endpoints",
              ),
            ]),

            React.createElement("div", { key: "tab-content", className: "p-8" }, [
              // External API Tab
              React.createElement("div", { key: "external-panel", id: "external", className: "tab-panel" }, [
                React.createElement(
                  "h2",
                  { key: "external-title", className: "text-2xl font-bold mb-6 flex items-center gap-3" },
                  [
                    React.createElement("span", { key: "icon", className: "text-blue-500" }, "🌐"),
                    "External Football Data API",
                  ],
                ),
                React.createElement(
                  "div",
                  { key: "external-grid", className: "space-y-6" },
                  externalApiEndpoints.map((endpoint, index) =>
                    React.createElement(
                      "div",
                      {
                        key: `external-${index}`,
                        className:
                          "border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500",
                      },
                      [
                        React.createElement(
                          "div",
                          { key: "header", className: "flex justify-between items-start mb-3" },
                          [
                            React.createElement(
                              "h3",
                              { key: "title", className: "text-xl font-semibold text-gray-800" },
                              endpoint.title,
                            ),
                            React.createElement(
                              "span",
                              {
                                key: "method",
                                className: "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold",
                              },
                              endpoint.method,
                            ),
                          ],
                        ),
                        React.createElement(
                          "p",
                          { key: "description", className: "text-gray-600 mb-4" },
                          endpoint.description,
                        ),
                        React.createElement(
                          "div",
                          { key: "path", className: "bg-gray-50 p-4 rounded-lg border-l-4 border-l-primary mb-4" },
                          [
                            React.createElement(
                              "code",
                              { key: "code", className: "font-mono text-sm" },
                              endpoint.endpoint,
                            ),
                            React.createElement(
                              "button",
                              {
                                key: "copy",
                                className:
                                  "ml-3 bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors duration-200",
                                onClick: () => copyToClipboard(endpoint.endpoint),
                              },
                              "Copy",
                            ),
                          ],
                        ),
                        endpoint.params.length > 0 &&
                          React.createElement("div", { key: "params", className: "mt-4" }, [
                            React.createElement(
                              "strong",
                              { key: "params-title", className: "text-sm text-gray-700 block mb-2" },
                              "Parameters:",
                            ),
                            React.createElement(
                              "div",
                              { key: "params-list", className: "flex flex-wrap gap-2" },
                              endpoint.params.map((param, paramIndex) =>
                                React.createElement(
                                  "span",
                                  {
                                    key: `param-${paramIndex}`,
                                    className: "bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs",
                                  },
                                  param,
                                ),
                              ),
                            ),
                          ]),
                      ],
                    ),
                  ),
                ),
              ]),

              // Public Endpoints Tab
              React.createElement("div", { key: "public-panel", id: "public", className: "tab-panel hidden" }, [
                React.createElement(
                  "h2",
                  { key: "public-title", className: "text-2xl font-bold mb-6 flex items-center gap-3" },
                  [React.createElement("span", { key: "icon", className: "text-green-500" }, "🌍"), "Public Endpoints"],
                ),
                React.createElement(
                  "div",
                  { key: "public-grid", className: "space-y-4" },
                  publicEndpoints.map((endpoint, index) =>
                    React.createElement(
                      "div",
                      {
                        key: `public-${index}`,
                        className:
                          "border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200",
                      },
                      [
                        React.createElement(
                          "h3",
                          { key: "title", className: "text-lg font-semibold text-gray-800 mb-2" },
                          endpoint.name,
                        ),
                        React.createElement(
                          "p",
                          { key: "description", className: "text-gray-600 mb-4" },
                          endpoint.description,
                        ),
                        React.createElement(
                          "div",
                          { key: "path", className: "bg-gray-50 p-3 rounded-lg flex justify-between items-center" },
                          [
                            React.createElement(
                              "code",
                              { key: "code", className: "font-mono text-sm" },
                              endpoint.endpoint,
                            ),
                            React.createElement(
                              "button",
                              {
                                key: "copy",
                                className:
                                  "bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors duration-200",
                                onClick: () => copyToClipboard(endpoint.endpoint),
                              },
                              "Copy",
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ]),

              React.createElement("div", { key: "protected-panel", id: "protected", className: "tab-panel hidden" }, [
                React.createElement(
                  "h2",
                  { key: "protected-title", className: "text-2xl font-bold mb-6 flex items-center gap-3" },
                  [
                    React.createElement("span", { key: "icon", className: "text-orange-500" }, "🔒"),
                    "Protected Endpoints",
                  ],
                ),
                React.createElement(
                  "div",
                  { key: "protected-grid", className: "space-y-4" },
                  protectedEndpoints.map((endpoint, index) =>
                    React.createElement(
                      "div",
                      {
                        key: `protected-${index}`,
                        className:
                          "border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500",
                      },
                      [
                        React.createElement(
                          "h3",
                          { key: "title", className: "text-lg font-semibold text-gray-800 mb-2" },
                          endpoint.name,
                        ),
                        React.createElement(
                          "p",
                          { key: "description", className: "text-gray-600 mb-4" },
                          endpoint.description,
                        ),
                        React.createElement(
                          "div",
                          { key: "path", className: "bg-gray-50 p-3 rounded-lg flex justify-between items-center" },
                          [
                            React.createElement(
                              "code",
                              { key: "code", className: "font-mono text-sm" },
                              endpoint.endpoint,
                            ),
                            React.createElement(
                              "button",
                              {
                                key: "copy",
                                className:
                                  "bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors duration-200",
                                onClick: () => copyToClipboard(endpoint.endpoint),
                              },
                              "Copy",
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ]),
            ]),
          ]),

          // Database Section
          React.createElement("div", { key: "database", className: "bg-white rounded-xl p-8 mt-8 shadow-xl" }, [
            React.createElement(
              "h2",
              { key: "db-title", className: "text-2xl font-bold mb-4 flex items-center gap-3" },
              [React.createElement("span", { key: "icon", className: "text-purple-500" }, "🗄️"), "Database Schema"],
            ),
            React.createElement(
              "p",
              { key: "db-description", className: "text-gray-600 mb-6" },
              "PostgreSQL database tables used by the API",
            ),
            React.createElement(
              "div",
              { key: "table-grid", className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" },
              ["areas", "teams", "users", "leagues", "matches", "predictions", "refresh_tokens"].map((table, index) =>
                React.createElement(
                  "div",
                  { key: `table-${index}`, className: "bg-gray-50 p-4 rounded-lg border-l-4 border-l-gray-400" },
                  [
                    React.createElement(
                      "h4",
                      { key: "table-name", className: "font-semibold text-gray-800 capitalize" },
                      table,
                    ),
                    React.createElement(
                      "p",
                      { key: "table-desc", className: "text-sm text-gray-600" },
                      "Database table",
                    ),
                  ],
                ),
              ),
            ),
          ]),
        ]),
      ],
    ),
  ])
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const html = renderToString(React.createElement(APIDocumentation))

  res.setHeader("Content-Type", "text/html")
  res.status(200).send(`<!DOCTYPE html>${html}`)
}
