"use client"

import Head from "next/head"
import { useState } from "react"

export default function Home() {
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const testEndpoint = async (endpoint, options = {}) => {
    setLoading(true)
    try {
      const res = await fetch(endpoint, {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Football Betting API - Next.js</title>
        <meta name="description" content="Football Betting API Documentation" />
      </Head>

      <div className="api-container">
        <div className="api-header">
          <h1>🏈 Football Betting API</h1>
          <p>Next.js-powered backend for real-time football predictions and betting data</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
          <div>
            <h3>API Endpoints</h3>

            <div className="api-endpoint">
              <button onClick={() => testEndpoint("/api/health")}>
                <span className="api-method method-get">GET</span>
                Health Check
              </button>
            </div>

            <div className="api-endpoint">
              <button onClick={() => testEndpoint("/api")}>
                <span className="api-method method-get">GET</span>
                API Info
              </button>
            </div>

            <div className="api-endpoint">
              <button onClick={() => testEndpoint("/api/matches")}>
                <span className="api-method method-get">GET</span>
                Matches
              </button>
            </div>

            <div className="api-endpoint">
              <button onClick={() => testEndpoint("/api/matches/live")}>
                <span className="api-method method-get">GET</span>
                Live Matches
              </button>
            </div>

            <div className="api-endpoint">
              <button onClick={() => testEndpoint("/api/matches/leagues")}>
                <span className="api-method method-get">GET</span>
                Leagues
              </button>
            </div>

            <div className="api-endpoint">
              <button
                onClick={() =>
                  testEndpoint("/api/auth/register", {
                    method: "POST",
                    body: {
                      username: `testuser_${Date.now()}`,
                      email: `test${Date.now()}@example.com`,
                      password: "TestPass123",
                      firstName: "Test",
                      lastName: "User",
                    },
                  })
                }
              >
                <span className="api-method method-post">POST</span>
                Register User
              </button>
            </div>
          </div>

          <div>
            <h3>API Response</h3>
            <div
              style={{
                background: "#f5f5f5",
                padding: "20px",
                borderRadius: "8px",
                minHeight: "400px",
                fontFamily: "monospace",
                fontSize: "14px",
                overflow: "auto",
              }}
            >
              {loading ? "Loading..." : response || "Click an endpoint to see the response..."}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "40px", textAlign: "center", color: "#666" }}>
          <p>&copy; 2024 Football Betting API. Built with Next.js</p>
        </div>
      </div>
    </>
  )
}
