"use client"

import type React from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowLeft,
  TrendingUp,
  Wallet,
  RefreshCw,
  DollarSign,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  LogIn,
  UserPlus,
} from "lucide-react"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { matchesApi, predictionsApi, usersApi } from "@/lib/api"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/router"
import { toast } from "@/hooks/use-toast"

type PredictionType = "HOME" | "DRAW" | "AWAY"

interface Match {
  id: string | number
  home_team: string
  away_team: string
  league_name: string
  country?: string
  status: string
  match_date: string
  venue?: string
  referee?: string
  prediction_count?: number
  home_score?: number
  away_score?: number
  odds_home?: string
  odds_draw?: string
  odds_away?: string
  matchday?: number
  stage?: string
  attendance?: number
}

interface MatchResponse {
  data: {
    match: Match
  }
}

interface Prediction {
  id: number
  match_id: number
  prediction_type: PredictionType
  stake_amount: number
  potential_winnings: number
  status: "PENDING" | "WON" | "LOST" | "CANCELLED"
  created_at: string
  updated_at: string
}

interface CreatePredictionData {
  matchId: number
  predictionType: PredictionType
  stakeAmount: number
}

export default function MatchDetailsPage() {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()
  const [predictionType, setPredictionType] = useState<PredictionType>("HOME")
  const [stakeAmount, setStakeAmount] = useState("")
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("token")
    return !!(user && token)
  }

  // Handle authentication errors (only for expired sessions, not missing auth)
  const handleAuthError = (error: any) => {
    if (error?.response?.status === 401 || error?.status === 401) {
      // Only set session expired if user was previously authenticated
      if (user || localStorage.getItem("token")) {
        setSessionExpired(true)
        toast({
          title: "Session Expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        })
        // Clear auth state
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        return true
      }
    }
    return false
  }

  useEffect(() => {
    const fetchBalance = async () => {
      if (!isAuthenticated()) {
        setLoading(false)
        return
      }

      try {
        setSessionExpired(false)
        const response = await usersApi.getBalance()
        setBalance(response.data.balance || 0)
      } catch (error: any) {
        console.error("Error fetching balance:", error)
        // Handle 401 specifically
        if (handleAuthError(error)) {
          return
        }
        setBalance(0)
        toast({
          title: "Error Loading Balance",
          description: "Failed to load your account balance. Please try refreshing.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [user, router])

  // Fetch match details - allow unauthenticated access
  const {
    data: matchData,
    isLoading,
    error,
  } = useQuery<MatchResponse>({
    queryKey: ["match", id],
    queryFn: async () => {
      try {
        return await matchesApi.getMatchById(id as string)
      } catch (error: any) {
        // Only handle auth errors if user was authenticated
        if (isAuthenticated() && handleAuthError(error)) {
          throw new Error("Authentication required")
        }
        throw error
      }
    },
    enabled: !!id && !sessionExpired,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors for authenticated users
      if (isAuthenticated() && (error?.response?.status === 401 || error?.status === 401)) {
        return false
      }
      return failureCount < 3
    },
  })

  // Fetch existing prediction for this match (only for authenticated users)
  const {
    data: existingPrediction,
    isLoading: isPredictionLoading,
    refetch: refetchPrediction,
  } = useQuery<Prediction | null>({
    queryKey: ["existing-prediction", id, user?.id],
    queryFn: async () => {
      if (!isAuthenticated() || !id) return null
      try {
        const response = await predictionsApi.getMatchPrediction(Number(id))
        return response.data.prediction || null
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null
        }
        if (handleAuthError(error)) {
          throw new Error("Authentication required")
        }
        throw error
      }
    },
    enabled: !!id && !!user && isAuthenticated() && !sessionExpired,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })

  const match = matchData?.data?.match

  const refreshBalance = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your balance.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      setSessionExpired(false)
      const response = await usersApi.getBalance()
      setBalance(response.data.balance || 0)
      toast({
        title: "Balance Updated",
        description: "Your balance has been refreshed.",
      })
    } catch (error: any) {
      console.error("Error fetching balance:", error)
      if (handleAuthError(error)) {
        return
      }
      toast({
        title: "Error",
        description: "Failed to refresh balance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceBet = async () => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place a bet.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Stake",
        description: "Please enter a valid stake amount.",
        variant: "destructive",
      })
      return
    }

    const stake = Number.parseFloat(stakeAmount)
    if (stake > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this bet.",
        variant: "destructive",
      })
      return
    }

    // Validate match ID
    if (!id || !match) {
      toast({
        title: "Invalid Match",
        description: "Match information is not available.",
        variant: "destructive",
      })
      return
    }

    // Validate stake amount range
    if (stake < 0.01 || stake > 10000) {
      toast({
        title: "Invalid Stake Amount",
        description: "Stake amount must be between $0.01 and $10,000.",
        variant: "destructive",
      })
      return
    }

    setIsPlacingBet(true)
    try {
      const matchId = typeof match.id === "string" ? Number.parseInt(match.id, 10) : Number(match.id)
      if (isNaN(matchId) || matchId <= 0) {
        throw new Error("Invalid match ID")
      }

      if (!["HOME", "DRAW", "AWAY"].includes(predictionType)) {
        throw new Error("Invalid prediction type")
      }

      const predictionData: CreatePredictionData = {
        matchId: matchId,
        predictionType: predictionType,
        stakeAmount: stake,
      }

      console.log("🚀 Frontend: Sending prediction data:", predictionData)
      const response = await predictionsApi.createPrediction(predictionData)
      console.log("✅ Frontend: Prediction response:", response)

      // Refresh balance and prediction data after successful bet
      await Promise.all([refreshBalance(), refetchPrediction()])

      setStakeAmount("")
      toast({
        title: "Bet Placed Successfully!",
        description: `Your ${predictionType.toLowerCase()} bet of $${stake.toFixed(2)} has been placed.`,
      })
    } catch (error: any) {
      console.error("❌ Frontend: Error placing bet:", error)
      if (handleAuthError(error)) {
        return
      }

      // Handle specific error messages
      let errorMessage = "There was an error placing your bet. Please try again."
      if (error?.response?.status === 400) {
        if (error?.response?.data?.error === "You already have a prediction for this match") {
          errorMessage = "You have already placed a bet on this match. Check your existing prediction below."
          // Refetch the prediction to show it
          refetchPrediction()
        } else if (error?.response?.data?.details) {
          errorMessage = error.response.data.details
        } else if (error?.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.response?.data?.errors) {
          const validationErrors = error.response.data.errors
          errorMessage = validationErrors.map((err: any) => `${err.param}: ${err.msg}`).join(", ")
        } else {
          errorMessage = "Invalid request. Please check your bet details and try again."
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.message) {
        errorMessage = error.message
      }

      toast({
        title: "Bet Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsPlacingBet(false)
    }
  }

  const calculatePotentialWinnings = (): number => {
    if (!match || !stakeAmount) return 0
    const stake = Number.parseFloat(stakeAmount)
    let odds = 0

    switch (predictionType) {
      case "HOME":
        odds = Number.parseFloat(match.odds_home || "0")
        break
      case "DRAW":
        odds = Number.parseFloat(match.odds_draw || "0")
        break
      case "AWAY":
        odds = Number.parseFloat(match.odds_away || "0")
        break
    }

    return stake * odds
  }

  const handlePredictionTypeChange = (value: string) => {
    setPredictionType(value as PredictionType)
  }

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow empty string or valid decimal numbers with up to 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setStakeAmount(value)
    }
  }

  const getPredictionStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "WON":
        return "bg-green-100 text-green-800 border-green-200"
      case "LOST":
        return "bg-red-100 text-red-800 border-red-200"
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPredictionStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "WON":
        return <CheckCircle className="h-4 w-4" />
      case "LOST":
        return <XCircle className="h-4 w-4" />
      case "CANCELLED":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getPredictionTypeDisplay = (type: PredictionType) => {
    switch (type) {
      case "HOME":
        return { label: `${match?.home_team} Win`, color: "text-blue-600" }
      case "DRAW":
        return { label: "Draw", color: "text-yellow-600" }
      case "AWAY":
        return { label: `${match?.away_team} Win`, color: "text-red-600" }
      default:
        return { label: type, color: "text-gray-600" }
    }
  }

  // Show session expired error (only for previously authenticated users)
  if (sessionExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Session Expired</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your session has expired. Please log in again to continue.
            </p>
            <div className="flex gap-4 justify-center">
              <Button className="bg-red-600 hover:bg-red-700" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/matches">Browse Matches</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse mx-auto mb-4"></div>
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 absolute top-4 left-1/2 transform -translate-x-1/2" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Match Details</h3>
              <p className="text-gray-600">Please wait while we fetch the match information...</p>
              <p className="text-sm text-gray-500 mt-2">Match ID: {id}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {error instanceof Error ? error.message : "We couldn't load the match details. Please try again."}
            </p>
            <p className="text-sm text-gray-500 mb-6">Match ID: {id}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" asChild>
                <Link href="/matches">Back to Matches</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-10 w-10 text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Match Not Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The match you're looking for doesn't exist or may have been removed.
            </p>
            <p className="text-sm text-gray-500 mb-6">Match ID: {id}</p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/matches">Browse All Matches</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isLive = match.status === "IN_PLAY"
  const isFinished = match.status === "FINISHED"
  const canBet = match.status === "SCHEDULED" && new Date(match.match_date) > new Date()
  const hasExistingPrediction = existingPrediction !== null

  const formatMatchDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Date TBD"
      }
      return format(date, "PPP 'at' HH:mm")
    } catch {
      return "Date TBD"
    }
  }

  const getStatusColor = () => {
    if (isLive) return "bg-red-500 text-white"
    if (isFinished) return "bg-gray-500 text-white"
    return "bg-green-500 text-white"
  }

  const getPredictionTypeColor = (type: PredictionType) => {
    switch (type) {
      case "HOME":
        return "bg-blue-500 hover:bg-blue-600"
      case "DRAW":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "AWAY":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 hover:bg-white/50" asChild>
            <Link href="/matches">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Matches
            </Link>
          </Button>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <Badge className={`${getStatusColor()} px-3 py-1 text-sm font-medium`}>
                {isLive && <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />}
                {match.status}
              </Badge>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{match.league_name}</p>
                {match.country && <p className="text-sm text-gray-600">{match.country}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3 space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="font-bold text-2xl text-white">{match.home_team?.charAt(0) || "H"}</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{match.home_team || "Home Team"}</h2>
                          <p className="text-blue-600 font-medium">Home</p>
                        </div>
                      </div>
                      {match.home_score !== undefined && (
                        <div className="text-6xl font-bold text-blue-600">{match.home_score}</div>
                      )}
                    </div>

                    {/* VS Divider */}
                    <div className="flex items-center justify-center py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-px bg-gradient-to-r from-transparent to-gray-300" />
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
                          VS
                        </div>
                        <div className="w-20 h-px bg-gradient-to-l from-transparent to-gray-300" />
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="font-bold text-2xl text-white">{match.away_team?.charAt(0) || "A"}</span>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{match.away_team || "Away Team"}</h2>
                          <p className="text-red-600 font-medium">Away</p>
                        </div>
                      </div>
                      {match.away_score !== undefined && (
                        <div className="text-6xl font-bold text-red-600">{match.away_score}</div>
                      )}
                    </div>
                  </div>

                  {/* Match Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Match Date</p>
                        <p className="font-semibold text-gray-900">{formatMatchDate(match.match_date)}</p>
                      </div>
                    </div>

                    {match.venue && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Venue</p>
                          <p className="font-semibold text-gray-900">{match.venue}</p>
                        </div>
                      </div>
                    )}

                    {match.referee && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Users className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Referee</p>
                          <p className="font-semibold text-gray-900">{match.referee}</p>
                        </div>
                      </div>
                    )}

                    {match.prediction_count && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm text-gray-600">Predictions</p>
                          <p className="font-semibold text-gray-900">{match.prediction_count} bets placed</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {(match.odds_home || match.odds_draw || match.odds_away) && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                    Betting Odds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                      <p className="text-sm font-medium text-blue-600 mb-2">Home Win</p>
                      <p className="text-3xl font-bold text-blue-700 mb-1">{match.odds_home || "N/A"}</p>
                      <p className="text-sm text-blue-600 truncate">{match.home_team}</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-600 mb-2">Draw</p>
                      <p className="text-3xl font-bold text-yellow-700 mb-1">{match.odds_draw || "N/A"}</p>
                      <p className="text-sm text-yellow-600">Tie Game</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200">
                      <p className="text-sm font-medium text-red-600 mb-2">Away Win</p>
                      <p className="text-3xl font-bold text-red-700 mb-1">{match.odds_away || "N/A"}</p>
                      <p className="text-sm text-red-600 truncate">{match.away_team}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {hasExistingPrediction && existingPrediction && user && isAuthenticated() && (
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Eye className="h-5 w-5 text-purple-600" />
                    Your Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white/70 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">Prediction:</span>
                      <Badge className={`${getPredictionStatusColor(existingPrediction.status)} border`}>
                        <div className="flex items-center gap-1">
                          {getPredictionStatusIcon(existingPrediction.status)}
                          {existingPrediction.status}
                        </div>
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Bet Type:</span>
                        <span
                          className={`font-semibold ${
                            getPredictionTypeDisplay(existingPrediction.prediction_type).color
                          }`}
                        >
                          {getPredictionTypeDisplay(existingPrediction.prediction_type).label}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Stake Amount:</span>
                        <span className="font-semibold text-gray-900">
                          ${Number(existingPrediction.stake_amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Potential Winnings:</span>
                        <span className="font-semibold text-green-600">
                          ${Number(existingPrediction.potential_winnings).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                        <span className="text-sm font-medium text-gray-700">Total Return:</span>
                        <span className="font-bold text-lg text-purple-700">
                          $
                          {(
                            Number(existingPrediction.potential_winnings) + Number(existingPrediction.stake_amount)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    <p>Placed on {format(new Date(existingPrediction.created_at), "PPP 'at' HH:mm")}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-purple-200 hover:bg-purple-50 bg-transparent"
                    asChild
                  >
                    <Link href="/predictions">View All Predictions</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {canBet && user && isAuthenticated() && !hasExistingPrediction && !isPredictionLoading && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="h-5 w-5 text-green-600" />
                    Place Your Bet
                  </CardTitle>
                  <div className="flex items-center justify-between p-4 bg-white/70 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Balance:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                      ) : (
                        <>
                          <p className="font-bold text-2xl text-green-600">${balance.toFixed(2)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={refreshBalance}
                            className="h-8 w-8 p-0 hover:bg-green-100"
                            disabled={loading}
                          >
                            <RefreshCw className={`h-4 w-4 text-green-600 ${loading ? "animate-spin" : ""}`} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="prediction-type" className="text-base font-semibold text-gray-700 mb-3 block">
                      Choose Your Prediction
                    </Label>
                    <Select value={predictionType} onValueChange={handlePredictionTypeChange}>
                      <SelectTrigger className="h-12 bg-white/70 border-2 border-green-200 focus:border-green-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOME" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            {match.home_team} Win
                          </div>
                        </SelectItem>
                        <SelectItem value="DRAW" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            Draw
                          </div>
                        </SelectItem>
                        <SelectItem value="AWAY" className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            {match.away_team} Win
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="stake-amount" className="text-base font-semibold text-gray-700 mb-3 block">
                      Stake Amount ($0.01 - $10,000)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        id="stake-amount"
                        type="text"
                        value={stakeAmount}
                        onChange={handleStakeChange}
                        placeholder="0.00"
                        className="h-12 pl-10 bg-white/70 border-2 border-green-200 focus:border-green-400 text-lg font-semibold"
                        max={Math.min(balance, 10000)}
                        min={0.01}
                      />
                    </div>
                    {stakeAmount && Number.parseFloat(stakeAmount) > balance && (
                      <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Insufficient balance
                      </p>
                    )}
                    {stakeAmount &&
                      (Number.parseFloat(stakeAmount) < 0.01 || Number.parseFloat(stakeAmount) > 10000) && (
                        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Amount must be between $0.01 and $10,000
                        </p>
                      )}
                  </div>

                  {stakeAmount &&
                    Number.parseFloat(stakeAmount) > 0 &&
                    Number.parseFloat(stakeAmount) >= 0.01 &&
                    Number.parseFloat(stakeAmount) <= 10000 && (
                      <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Potential Winnings:</span>
                          <span className="font-bold text-xl text-green-700">
                            ${calculatePotentialWinnings().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                          <span>Total Return:</span>
                          <span className="font-semibold">
                            ${(calculatePotentialWinnings() + Number.parseFloat(stakeAmount)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                  <Button
                    className={`w-full h-12 text-lg font-semibold ${getPredictionTypeColor(
                      predictionType,
                    )} text-white shadow-lg hover:shadow-xl transition-all duration-200`}
                    onClick={handlePlaceBet}
                    disabled={
                      isPlacingBet ||
                      !stakeAmount ||
                      Number.parseFloat(stakeAmount) <= 0 ||
                      Number.parseFloat(stakeAmount) < 0.01 ||
                      Number.parseFloat(stakeAmount) > 10000 ||
                      Number.parseFloat(stakeAmount) > balance ||
                      loading
                    }
                  >
                    {isPlacingBet ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Placing Bet...
                      </>
                    ) : (
                      <>
                        <Target className="mr-2 h-5 w-5" />
                        Place Bet
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading existing prediction */}
            {canBet && user && isAuthenticated() && isPredictionLoading && (
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                    <span className="ml-2 text-gray-600">Checking existing predictions...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Login prompt for unauthenticated users */}
            {canBet && (!user || !isAuthenticated()) && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
                    <LogIn className="h-5 w-5 text-blue-600" />
                    Ready to Bet?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-gray-600">
                    Join thousands of users and start placing your predictions!
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold" asChild>
                      <Link href="/auth/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login to Bet
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 border-2 border-blue-200 hover:bg-blue-50 bg-transparent"
                      asChild
                    >
                      <Link href="/auth/register">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!canBet && (
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="h-5 w-5 text-gray-600" />
                    Betting Closed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {isFinished
                      ? "This match has finished. Check out upcoming matches to place new bets."
                      : isLive
                        ? "This match is currently live. Betting is closed."
                        : "Betting is no longer available for this match."}
                  </p>
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                    asChild
                  >
                    <Link href="/matches">Browse Other Matches</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Match Stats */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Match Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">League:</span>
                  <span className="font-semibold text-gray-900">{match.league_name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Match ID:</span>
                  <span className="font-semibold text-gray-900">#{match.id}</span>
                </div>
                {match.matchday && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Matchday:</span>
                    <span className="font-semibold text-gray-900">{match.matchday}</span>
                  </div>
                )}
                {match.stage && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Stage:</span>
                    <span className="font-semibold text-gray-900">{match.stage}</span>
                  </div>
                )}
                {match.attendance && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Attendance:</span>
                    <span className="font-semibold text-gray-900">{match.attendance.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
