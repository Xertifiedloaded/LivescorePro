"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Globe, Lock, Database, Play, CheckCircle, ExternalLink, AlertCircle } from "lucide-react"

interface ApiEndpoint {
  title: string
  method: string
  endpoint: string
  description: string
  params: string[]
}

interface PublicEndpoint {
  name: string
  endpoint: string
  description: string
  testable?: boolean
}

interface ProtectedEndpoint {
  name: string
  endpoint: string
  description: string
}

export default function APIDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [loadingTests, setLoadingTests] = useState<Record<string, boolean>>({})

  const externalApiEndpoints: ApiEndpoint[] = [
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

  const publicEndpoints: PublicEndpoint[] = [
    { name: "Health Check", endpoint: "/api/health", description: "API health status", testable: true },
    { name: "All Matches", endpoint: "/api/matches", description: "Get all matches", testable: true },
    { name: "Live Matches", endpoint: "/api/matches/live", description: "Get currently live matches", testable: true },
    { name: "Leagues", endpoint: "/api/matches/leagues", description: "Get available leagues", testable: true },
    { name: "All Leagues", endpoint: "/api/matches/leagues/all", description: "Get all leagues data", testable: true },
    { name: "Popular Matches", endpoint: "/api/matches/popular", description: "Get popular matches", testable: true },
    {
      name: "Competition Matches",
      endpoint: "/api/matches/competition/[code]",
      description: "Get matches by competition code",
      testable: false,
    },
    { name: "Match by ID", endpoint: "/api/matches/[id]", description: "Get specific match by ID", testable: false },
    { name: "Today's Matches", endpoint: "/api/today", description: "Get today's matches", testable: true },
    {
      name: "Public Today Matches",
      endpoint: "/api/public/matches/today",
      description: "Public endpoint for today's matches",
      testable: true,
    },
    {
      name: "Week Matches",
      endpoint: "/api/public/matches/week",
      description: "Get this week's matches",
      testable: true,
    },
    {
      name: "Public Popular Matches",
      endpoint: "/api/public/matches/popular",
      description: "Public popular matches",
      testable: true,
    },
    {
      name: "Match Statistics",
      endpoint: "/api/public/matches/stats",
      description: "Get match statistics",
      testable: true,
    },
  ]

  const protectedEndpoints: ProtectedEndpoint[] = [
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

  const databaseTables = [
    { name: "areas", description: "Geographic areas and regions" },
    { name: "teams", description: "Football teams information" },
    { name: "users", description: "User accounts and profiles" },
    { name: "leagues", description: "Football leagues and competitions" },
    { name: "matches", description: "Match data and results" },
    { name: "predictions", description: "User predictions and bets" },
    { name: "refresh_tokens", description: "Authentication refresh tokens" },
  ]

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedEndpoint(text)
      setTimeout(() => setCopiedEndpoint(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const testEndpoint = async (endpoint: string) => {
    setLoadingTests((prev) => ({ ...prev, [endpoint]: true }))

    try {
      // Try to make actual API call first
      const response = await fetch(endpoint)

      if (response.ok) {
        const data = await response.json()
        setTestResults((prev) => ({ ...prev, [endpoint]: data }))
      } else {
        throw new Error("API not available")
      }
    } catch (error) {
      // Fallback to mock responses
      const mockResponses: Record<string, any> = {
        "/api/health": {
          status: "OK",
          timestamp: new Date().toISOString(),
          version: "1.0.0",
          uptime: "24h 15m 32s",
        },
        "/api/matches": {
          matches: [
            {
              id: 1,
              homeTeam: "Arsenal",
              awayTeam: "Chelsea",
              date: "2024-01-15T15:00:00Z",
              status: "scheduled",
              competition: "Premier League",
              venue: "Emirates Stadium",
            },
            {
              id: 2,
              homeTeam: "Liverpool",
              awayTeam: "Manchester City",
              date: "2024-01-16T17:30:00Z",
              status: "live",
              competition: "Premier League",
              venue: "Anfield",
            },
          ],
          total: 2,
          page: 1,
          limit: 10,
        },
        "/api/matches/live": {
          liveMatches: [
            {
              id: 2,
              homeTeam: "Liverpool",
              awayTeam: "Manchester City",
              score: "1-1",
              minute: 67,
              competition: "Premier League",
              events: [
                { minute: 23, type: "goal", player: "Salah", team: "Liverpool" },
                { minute: 45, type: "goal", player: "Haaland", team: "Manchester City" },
              ],
            },
          ],
          count: 1,
        },
        "/api/matches/leagues": {
          leagues: [
            { id: 1, name: "Premier League", country: "England", code: "PL" },
            { id: 2, name: "La Liga", country: "Spain", code: "PD" },
            { id: 3, name: "Serie A", country: "Italy", code: "SA" },
            { id: 4, name: "Bundesliga", country: "Germany", code: "BL1" },
          ],
          total: 4,
        },
        "/api/matches/leagues/all": {
          leagues: [
            {
              id: 1,
              name: "Premier League",
              country: "England",
              code: "PL",
              teams: 20,
              currentSeason: "2023/24",
              founded: 1992,
            },
            {
              id: 2,
              name: "La Liga",
              country: "Spain",
              code: "PD",
              teams: 20,
              currentSeason: "2023/24",
              founded: 1929,
            },
            {
              id: 3,
              name: "Serie A",
              country: "Italy",
              code: "SA",
              teams: 20,
              currentSeason: "2023/24",
              founded: 1898,
            },
          ],
          total: 3,
        },
        "/api/matches/popular": {
          popularMatches: [
            {
              id: 1,
              homeTeam: "Manchester United",
              awayTeam: "Arsenal",
              popularity: 95,
              views: 250000,
              date: "2024-01-20T16:00:00Z",
            },
            {
              id: 2,
              homeTeam: "Barcelona",
              awayTeam: "Real Madrid",
              popularity: 98,
              views: 500000,
              date: "2024-01-21T20:00:00Z",
            },
          ],
          total: 2,
        },
        "/api/today": {
          todayMatches: [
            {
              id: 3,
              homeTeam: "Barcelona",
              awayTeam: "Real Madrid",
              time: "20:00",
              competition: "La Liga",
              venue: "Camp Nou",
            },
            {
              id: 4,
              homeTeam: "Juventus",
              awayTeam: "AC Milan",
              time: "18:00",
              competition: "Serie A",
              venue: "Allianz Stadium",
            },
          ],
          date: new Date().toISOString().split("T")[0],
          total: 2,
        },
        "/api/public/matches/today": {
          matches: [
            {
              id: 4,
              homeTeam: "Chelsea",
              awayTeam: "Liverpool",
              time: "15:00",
              odds: { home: 2.1, draw: 3.2, away: 3.8 },
            },
            {
              id: 5,
              homeTeam: "Manchester City",
              awayTeam: "Tottenham",
              time: "17:30",
              odds: { home: 1.8, draw: 3.5, away: 4.2 },
            },
          ],
          total: 2,
        },
        "/api/public/matches/week": {
          weekMatches: [
            {
              id: 6,
              homeTeam: "Arsenal",
              awayTeam: "Newcastle",
              date: "2024-01-20",
              dayOfWeek: "Saturday",
            },
            {
              id: 7,
              homeTeam: "Brighton",
              awayTeam: "West Ham",
              date: "2024-01-21",
              dayOfWeek: "Sunday",
            },
          ],
          weekStart: "2024-01-15",
          weekEnd: "2024-01-21",
          total: 2,
        },
        "/api/public/matches/popular": {
          popularMatches: [
            {
              id: 8,
              homeTeam: "Liverpool",
              awayTeam: "Manchester United",
              views: 150000,
              likes: 25000,
              comments: 5000,
            },
          ],
          total: 1,
        },
        "/api/public/matches/stats": {
          totalMatches: 380,
          completedMatches: 200,
          upcomingMatches: 180,
          liveMatches: 3,
          totalGoals: 542,
          averageGoalsPerMatch: 2.71,
          mostPopularLeague: "Premier League",
          lastUpdated: new Date().toISOString(),
        },
      }

      const response = mockResponses[endpoint] || {
        message: "Mock response - API endpoint not available",
        endpoint: endpoint,
        timestamp: new Date().toISOString(),
        note: "This is a mock response for demonstration purposes",
      }

      setTestResults((prev) => ({ ...prev, [endpoint]: response }))
    } finally {
      setLoadingTests((prev) => ({ ...prev, [endpoint]: false }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <Card className="text-center">
          <CardHeader className="pb-6 sm:pb-8">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent px-2">
              XertifiedLoaded Betting API Documentation
            </CardTitle>
            <CardDescription className="text-sm sm:text-base md:text-lg mt-3 sm:mt-4 px-2">
              Complete API documentation for football match data, user management, and betting predictions
            </CardDescription>
            <div className="flex justify-center gap-2 sm:gap-3 flex-wrap mt-4 sm:mt-6 px-2">
              <Badge variant="secondary" className="text-xs">Version 1.0.0</Badge>
              <Badge variant="secondary" className="text-xs">Next.js</Badge>
              <Badge variant="secondary" className="text-xs">PostgreSQL</Badge>
              <Badge variant="secondary" className="text-xs">React Components</Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{externalApiEndpoints.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">External Endpoints</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{publicEndpoints.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Public Endpoints</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{protectedEndpoints.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Protected Endpoints</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{databaseTables.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Database Tables</div>
            </CardContent>
          </Card>
        </div>

        {/* API Documentation Tabs */}
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="external" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12 sm:h-14">
                <TabsTrigger value="external" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">External API</span>
                  <span className="sm:hidden">External</span>
                </TabsTrigger>
                <TabsTrigger value="public" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Public Endpoints</span>
                  <span className="sm:hidden">Public</span>
                </TabsTrigger>
                <TabsTrigger value="protected" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Protected Endpoints</span>
                  <span className="sm:hidden">Protected</span>
                </TabsTrigger>
              </TabsList>

              {/* External API Tab */}
              <TabsContent value="external" className="p-4 sm:p-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                      <h2 className="text-xl sm:text-2xl font-bold">External Football Data API</h2>
                    </div>
                    <Badge variant="outline" className="ml-0 sm:ml-auto text-xs w-fit">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Third-party API
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:gap-6">
                    {externalApiEndpoints.map((endpoint, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3 sm:pb-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <CardTitle className="text-lg sm:text-xl">{endpoint.title}</CardTitle>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 w-fit">{endpoint.method}</Badge>
                          </div>
                          <CardDescription className="text-sm">{endpoint.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-l-4 border-l-blue-500 mb-3 sm:mb-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <code className="font-mono text-xs sm:text-sm break-all">{endpoint.endpoint}</code>
                              <Button size="sm" onClick={() => copyToClipboard(endpoint.endpoint)} className="w-fit self-end sm:self-auto">
                                {copiedEndpoint === endpoint.endpoint ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {endpoint.params.length > 0 && (
                            <div>
                              <strong className="text-sm text-gray-700 block mb-2">Parameters:</strong>
                              <div className="flex flex-wrap gap-2">
                                {endpoint.params.map((param, paramIndex) => (
                                  <Badge key={paramIndex} variant="outline" className="text-xs">
                                    {param}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Public Endpoints Tab */}
              <TabsContent value="public" className="p-4 sm:p-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                      <h2 className="text-xl sm:text-2xl font-bold">Public Endpoints</h2>
                    </div>
                    <Badge variant="outline" className="ml-0 sm:ml-auto text-xs w-fit">
                      No Authentication Required
                    </Badge>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      <strong className="text-green-800 text-sm sm:text-base">Public Access</strong>
                    </div>
                    <p className="text-green-700 text-xs sm:text-sm">
                      These endpoints are publicly accessible and don't require authentication. Perfect for displaying
                      match data, leagues, and statistics on your frontend.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {publicEndpoints.map((endpoint, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base sm:text-lg">{endpoint.name}</CardTitle>
                          <CardDescription className="text-sm">{endpoint.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <div className="flex flex-col gap-2">
                              <code className="font-mono text-xs sm:text-sm break-all">{endpoint.endpoint}</code>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button size="sm" variant="outline" onClick={() => copyToClipboard(endpoint.endpoint)} className="w-fit">
                                  {copiedEndpoint === endpoint.endpoint ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                                {endpoint.testable && (
                                  <Button
                                    size="sm"
                                    onClick={() => testEndpoint(endpoint.endpoint)}
                                    disabled={loadingTests[endpoint.endpoint]}
                                    className="w-fit"
                                  >
                                    <Play className="w-4 h-4 mr-1" />
                                    {loadingTests[endpoint.endpoint] ? "Testing..." : "Test"}
                                  </Button>
                                )}
                                {!endpoint.testable && (
                                  <Badge variant="secondary" className="text-xs w-fit">
                                    Dynamic Route
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {testResults[endpoint.endpoint] && (
                            <div className="mt-4">
                              <strong className="text-sm text-gray-700 block mb-2">Response:</strong>
                              <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto">
                                {JSON.stringify(testResults[endpoint.endpoint], null, 2)}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Protected Endpoints Tab */}
              <TabsContent value="protected" className="p-4 sm:p-8">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                      <h2 className="text-xl sm:text-2xl font-bold">Protected Endpoints</h2>
                    </div>
                    <Badge variant="outline" className="ml-0 sm:ml-auto text-xs w-fit">
                      Authentication Required
                    </Badge>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-yellow-600" />
                      <strong className="text-yellow-800 text-sm sm:text-base">Authentication Required</strong>
                    </div>
                    <p className="text-yellow-700 text-xs sm:text-sm mb-3">
                      These endpoints require a valid JWT token in the Authorization header:
                    </p>
                    <div className="bg-yellow-100 p-2 rounded font-mono text-xs sm:text-sm break-all">
                      Authorization: Bearer {"<your-jwt-token>"}
                    </div>
                  </div>

                  {/* Authentication Flow */}
                  <Card className="mb-4 sm:mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg">Authentication Flow</CardTitle>
                      <CardDescription className="text-sm">How to authenticate and access protected endpoints</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            1
                          </div>
                          <div>
                            <strong className="text-sm sm:text-base">Register or Login</strong>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Use <code className="text-xs">/api/auth/register</code> or <code className="text-xs">/api/auth/login</code> to get a JWT token
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            2
                          </div>
                          <div>
                            <strong className="text-sm sm:text-base">Include Token</strong>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Add the token to the Authorization header in all protected requests
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            3
                          </div>
                          <div>
                            <strong className="text-sm sm:text-base">Access Protected Resources</strong>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Make requests to protected endpoints with your authenticated token
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid gap-4">
                    {protectedEndpoints.map((endpoint, index) => (
                      <Card key={index} className="border-l-4 border-l-orange-500">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2">
                            {endpoint.name}
                            {endpoint.name.toLowerCase().includes("register") ||
                            endpoint.name.toLowerCase().includes("login") ? (
                              <Badge variant="secondary" className="text-xs">
                                Auth
                              </Badge>
                            ) : endpoint.name.toLowerCase().includes("prediction") ? (
                              <Badge variant="secondary" className="text-xs">
                                Betting
                              </Badge>
                            ) : endpoint.name.toLowerCase().includes("user") ||
                              endpoint.name.toLowerCase().includes("profile") ||
                              endpoint.name.toLowerCase().includes("balance") ? (
                              <Badge variant="secondary" className="text-xs">
                                User
                              </Badge>
                            ) : null}
                          </CardTitle>
                          <CardDescription className="text-sm">{endpoint.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <code className="font-mono text-xs sm:text-sm break-all">{endpoint.endpoint}</code>
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(endpoint.endpoint)} className="w-fit self-end sm:self-auto">
                              {copiedEndpoint === endpoint.endpoint ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Database Schema Section */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
              <CardTitle className="text-xl sm:text-2xl">Database Schema</CardTitle>
            </div>
            <CardDescription className="text-sm">PostgreSQL database tables used by the API</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-purple-600" />
                <strong className="text-purple-800 text-sm sm:text-base">Database Information</strong>
              </div>
              <p className="text-purple-700 text-xs sm:text-sm">
                The API uses PostgreSQL as the primary database. Below are the main tables and their purposes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {databaseTables.map((table, index) => (
                <Card key={index} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4 text-purple-600" />
                      <h4 className="font-semibold text-gray-800 capitalize text-sm sm:text-base">{table.name}</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">{table.description}</p>
                    <div>
                      <Badge variant="outline" className="text-xs">
                        PostgreSQL
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Usage Examples */}
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">API Usage Examples</CardTitle>
            <CardDescription className="text-sm">Common patterns and examples for using the API</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4 sm:space-y-6">
              {/* JavaScript Example */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">JavaScript/Fetch Example</h3>
                <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg text-xs sm:text-sm overflow-x-auto">
                  {`// Get today's matches
const response = await fetch('/api/today');
const data = await response.json();
console.log(data.todayMatches);

// Authenticated request
const token = 'your-jwt-token';
const userResponse = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  }
});
const userData = await userResponse.json();`}
                </pre>
              </div>

              {/* cURL Example */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3">cURL Examples</h3>
                <pre className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-lg text-xs sm:text-sm overflow-x-auto">
                  {`# Get health status
curl -X GET "http://localhost:3000/api/health"

# Get matches with authentication
curl -X GET "http://localhost:3000/api/predictions/my" \\
  -H "Authorization: Bearer your-jwt-token" \\
  -H "Content-Type: application/json"

# Login request
curl -X POST "http://localhost:3000/api/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password123"}'`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Built with Next.js & React</span>
              </div>
              <div className="flex items-center gap-1">
                <Database className="w-4 h-4" />
                <span className="text-xs sm:text-sm">PostgreSQL Database</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span className="text-xs sm:text-sm">JWT Authentication</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">Last updated: {new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}