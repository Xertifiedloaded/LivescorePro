"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { predictionsApi, usersApi } from "@/lib/api"
import { Target, TrendingUp, DollarSign, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface DashboardStats {
  totalPredictions: number
  wonPredictions: number
  lostPredictions: number
  pendingPredictions: number
  totalStaked: number
  totalWinnings: number
  winRate: number
  balance: number
}

interface RecentPrediction {
  id: number
  home_team: string
  away_team: string
  league_name: string
  prediction_type: string
  stake_amount: string
  potential_winnings: string
  status: string
  created_at: string
  match_date: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalPredictions: 0,
    wonPredictions: 0,
    lostPredictions: 0,
    pendingPredictions: 0,
    totalStaked: 0,
    totalWinnings: 0,
    winRate: 0,
    balance: 0,
  })
  const [recentPredictions, setRecentPredictions] = useState<RecentPrediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, predictionsResponse, balanceResponse] = await Promise.all([
          predictionsApi.getMyStats().catch(() => ({ data: {} })),
          predictionsApi.getMyPredictions({ limit: 5 }).catch(() => ({ data: { predictions: [] } })),
          usersApi.getBalance().catch(() => ({ data: { balance: 0 } })),
        ])

        const statsData = statsResponse.data
        setStats({
          totalPredictions: statsData.total_predictions || 0,
          wonPredictions: statsData.won_predictions || 0,
          lostPredictions: statsData.lost_predictions || 0,
          pendingPredictions: statsData.pending_predictions || 0,
          totalStaked: Number.parseFloat(statsData.total_staked || "0"),
          totalWinnings: Number.parseFloat(statsData.total_winnings || "0"),
          winRate: statsData.win_rate || 0,
          balance: balanceResponse.data.balance || 0,
        })

        setRecentPredictions(predictionsResponse.data.predictions || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPredictionTypeLabel = (type: string) => {
    switch (type) {
      case "HOME":
        return "Home Win"
      case "AWAY":
        return "Away Win"
      case "DRAW":
        return "Draw"
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WON":
        return "default"
      case "LOST":
        return "destructive"
      case "PENDING":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.username}!</h1>
          <p className="text-gray-600">Here's your betting performance overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${stats.balance.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Available to bet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPredictions}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.winRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.wonPredictions} won, {stats.lostPredictions} lost
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  stats.totalWinnings - stats.totalStaked >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${(stats.totalWinnings - stats.totalStaked).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Winnings - Stakes</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Predictions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Predictions
                </CardTitle>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/predictions">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentPredictions.length > 0 ? (
                <div className="space-y-4">
                  {recentPredictions.map((prediction) => (
                    <div key={prediction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">
                          {prediction.home_team} vs {prediction.away_team}
                        </div>
                        <div className="text-sm text-gray-600">
                          {prediction.league_name} • {getPredictionTypeLabel(prediction.prediction_type)}
                        </div>
                        <div className="text-xs text-gray-500">{formatDate(prediction.created_at)}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getStatusColor(prediction.status)}>{prediction.status}</Badge>
                        <div className="text-sm text-gray-600 mt-1">${prediction.stake_amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No predictions yet</p>
                  <Button asChild>
                    <Link href="/matches">Make Your First Prediction</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button  className="w-full">
                <Link className="flex items-center" href="/matches">
                  <Target className="h-4 w-4 mr-2" />
                  Make Prediction
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/live">
                  <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                  Live Matches
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/profile">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funds
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard/predictions">
                  <Calendar className="h-4 w-4 mr-2" />
                  View History
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
