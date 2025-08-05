"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { predictionsApi } from "@/lib/api"
import { Target, TrendingUp, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface Prediction {
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

interface PredictionStats {
  total_predictions: number
  won_predictions: number
  lost_predictions: number
  pending_predictions: number
  total_staked: string
  total_winnings: string
  win_rate: number
  profit_loss: number
}

export default function PredictionsPage() {
  const { user } = useAuth()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [stats, setStats] = useState<PredictionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const itemsPerPage = 10

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [predictionsResponse, statsResponse] = await Promise.all([
          predictionsApi
            .getMyPredictions({
              status: filter === "all" ? undefined : filter,
              limit: itemsPerPage,
              offset: (currentPage - 1) * itemsPerPage,
            })
            .catch(() => ({ data: { predictions: [], total: 0 } })),
          predictionsApi.getMyStats().catch(() => ({
            data: {
              total_predictions: 0,
              won_predictions: 0,
              lost_predictions: 0,
              pending_predictions: 0,
              total_staked: "0",
              total_winnings: "0",
              win_rate: 0,
              profit_loss: 0,
            },
          })),
        ])

        setPredictions(predictionsResponse.data.predictions || [])
        setTotalPages(Math.ceil((predictionsResponse.data.total || 0) / itemsPerPage))
        setStats(statsResponse.data)
      } catch (error) {
        console.error("Error fetching predictions:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, filter, currentPage])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
      case "CANCELLED":
        return "outline"
      default:
        return "secondary"
    }
  }

  const filteredPredictions = predictions.filter((prediction) => {
    if (filter === "all") return true
    return prediction.status.toLowerCase() === filter.toLowerCase()
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Predictions</h1>
          <p className="text-gray-600">Track your betting history and performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_predictions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.won_predictions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.win_rate?.toFixed(1) || 0}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${(stats?.profit_loss || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                ${stats?.profit_loss?.toFixed(2) || "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Prediction History
              </CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Predictions</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPredictions.length > 0 ? (
              <div className="space-y-4">
                {filteredPredictions.map((prediction) => (
                  <div key={prediction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-gray-900">
                          {prediction.home_team} vs {prediction.away_team}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {prediction.league_name} • {getPredictionTypeLabel(prediction.prediction_type)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Match: {formatDate(prediction.match_date)}</div>
                        <div className="text-xs text-gray-500">Predicted: {formatDate(prediction.created_at)}</div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-gray-900">Stake: ${prediction.stake_amount}</div>
                        <div className="text-sm text-gray-600">Potential: ${prediction.potential_winnings}</div>
                        <Badge variant={getStatusColor(prediction.status)} className="mt-2">
                          {prediction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  {filter === "all" ? "No predictions yet" : `No ${filter} predictions found`}
                </p>
                <Button >
                  <Link href="/matches">Make Your First Prediction</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
