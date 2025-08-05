import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, MapPin } from "lucide-react"
import { format } from "date-fns"
import { LiveIndicator } from "@/components/ui/live-indicator"

interface Match {
  id: string | number
  home_team: string
  away_team: string
  league_name: string
  status: string
  match_date: string
  home_score?: number
  away_score?: number
  odds_home?: string
  odds_draw?: string
  odds_away?: string
  venue?: string
  prediction_count?: number
}

interface MatchCardProps {
  match: Match
  isLive?: boolean
}

export function MatchCard({ match, isLive = false }: MatchCardProps) {
  const isFinished = match.status === "FINISHED"
  const isScheduled = match.status === "SCHEDULED"
console.log(match)
  const getStatusBadge = () => {
    if (isLive) {
      return (
        <Badge className="status-live flex items-center gap-1 px-3 py-1">
          <LiveIndicator />
          LIVE
        </Badge>
      )
    }
    if (isFinished) {
      return <Badge className="status-finished">FINISHED</Badge>
    }
    if (isScheduled) {
      return <Badge className="status-scheduled">SCHEDULED</Badge>
    }
    return <Badge variant="secondary">{match.status}</Badge>
  }

  return (
    <Card className="match-card group border-0 shadow-lg hover:shadow-xl bg-white overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white border-b">
        <div className="flex items-center justify-between">
          {getStatusBadge()}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{match.league_name}</p>
            {match.venue && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPin className="h-3 w-3" />
                {match.venue}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  H
                </div>
                <span className="font-semibold text-gray-900 text-lg">{match.home_team}</span>
              </div>
              {match.home_score !== undefined && (
                <span className="score-display text-3xl font-bold text-primary">{match.home_score}</span>
              )}
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full h-px bg-gray-200" />
              <span className="px-4 text-gray-400 font-bold text-sm">VS</span>
              <div className="w-full h-px bg-gray-200" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <span className="font-semibold text-gray-900 text-lg">{match.away_team}</span>
              </div>
              {match.away_score !== undefined && (
                <span className="score-display text-3xl font-bold text-primary">{match.away_score}</span>
              )}
            </div>
          </div>

          {/* Match Info */}
          {!isLive && !isFinished && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg py-3 px-4">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{format(new Date(match.match_date), "MMM dd, HH:mm")}</span>
            </div>
          )}

          {/* Betting Odds */}
          {match.odds_home && !isFinished && (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="font-bold text-green-700 text-lg">{match.odds_home}</div>
                <div className="text-green-600 text-xs font-medium uppercase tracking-wider">Home</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="font-bold text-gray-700 text-lg">{match.odds_draw}</div>
                <div className="text-gray-600 text-xs font-medium uppercase tracking-wider">Draw</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="font-bold text-blue-700 text-lg">{match.odds_away}</div>
                <div className="text-blue-600 text-xs font-medium uppercase tracking-wider">Away</div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {match.prediction_count && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{match.prediction_count} predictions</span>
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full flex items-center bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg group-hover:shadow-xl transition-all"
            
          >
            <Link href={`/matches/${match.id}`}>
              {isLive ? (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Watch Live
                </div>
              ) : (
          <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Details
                </div>
              )}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
