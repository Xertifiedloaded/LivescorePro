import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { LiveIndicator } from '@/components/ui/live-indicator'

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

interface MatchListItemProps {
  match: Match
  isLive?: boolean
}

export function MatchCard({ match, isLive = false }: MatchListItemProps) {
  const isFinished = match.status === 'FINISHED'
  const isScheduled = match.status === 'SCHEDULED'

  const getStatusDisplay = () => {
    if (isLive) {
      return (
        <div className="flex items-center gap-1 text-red-600 font-semibold text-sm">
          <LiveIndicator />
          <span>LIVE</span>
        </div>
      )
    }
    if (isFinished) {
      return <span className="text-gray-500 text-sm font-medium">FT</span>
    }
    if (isScheduled) {
      return (
        <span className="text-gray-700 font-medium text-sm">
          {format(new Date(match.match_date), 'HH:mm')}
        </span>
      )
    }
    return <span className="text-gray-500 text-sm">{match.status}</span>
  }

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="group hover:bg-gray-50 border-b border-gray-100 transition-colors">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              {match.league_name}
            </span>
            {match.venue && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                {match.venue}
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {match.home_team.charAt(0)}
                </div>
                <span className="font-semibold text-gray-900 truncate">{match.home_team}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mx-4">
              {match.home_score !== undefined && match.away_score !== undefined ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{match.home_score}</span>
                  <span className="text-gray-400">-</span>
                  <span className="text-2xl font-bold text-gray-900">{match.away_score}</span>
                </div>
              ) : (
                <div className="text-center">{getStatusDisplay()}</div>
              )}
            </div>

            {/* Away team */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 justify-end">
                <span className="font-semibold text-gray-900 truncate">{match.away_team}</span>
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {match.away_team.charAt(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Additional info row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {!isFinished && match.match_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(match.match_date), 'MMM dd')}</span>
                </div>
              )}
              {match.prediction_count && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{match.prediction_count}</span>
                </div>
              )}
            </div>

            {match.odds_home && !isFinished && !isLive && (
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                  {match.odds_home}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded font-medium">
                  {match.odds_draw}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                  {match.odds_away}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {isLive && (
                <Badge variant="destructive" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Watch
                </Badge>
              )}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-400">View details →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
