'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react'
import { format, isToday, isTomorrow, parseISO, isValid } from 'date-fns'
import { matchesApi } from '@/lib/api'
import Link from 'next/link'
import { Button } from '../ui/button'
interface Match {
  id: number
  home_team: string
  away_team: string
  match_date: string
  match_time: string
  venue: string
  status: string
  league_name: string
  country: string
  league_code: string
  league_emblem: string
  league_type: string
}

export default function MatchesDailyWeekly() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await matchesApi.getWeekMatches()
      setMatches(response.data.matches)
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupMatchesByDate = (matches: Match[]) => {
    const grouped: { [key: string]: Match[] } = {}
    matches.forEach((match) => {
      const dateKey = match.match_date.split('T')[0]
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(match)
    })
    return grouped
  }

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEEE, MMM d')
  }

  const formatMatchDateTime = (dateStr: string, timeStr: string) => {
    try {
      const combined = `${dateStr}T${timeStr}`
      const parsed = parseISO(combined)
      return isValid(parsed) ? format(parsed, 'MMM dd, HH:mm') : 'TBD'
    } catch {
      return 'TBD'
    }
  }

  const groupedMatches = groupMatchesByDate(matches)
  const dates = Object.keys(groupedMatches).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-sm">Loading matches...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col mb-8">
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Live Football Matches
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm">Upcoming matches for the next 7 days</p>
        </div>
      </header>

      <div className="container mx-auto  py-6">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 bg-gray-900 border border-gray-700 rounded-lg p-4">
          {dates.map((date) => {
            const dateObj = parseISO(date)
            const dayName = format(dateObj, 'EEE')
            const dayNumber = format(dateObj, 'd')
            const isSelected = selectedDate === date

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(isSelected ? '' : date)}
                className={`text-center rounded-lg py-2 text-xs sm:text-sm ${
                  isSelected ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div>{dayName}</div>
                <div className="font-bold text-base">{dayNumber}</div>
              </button>
            )
          })}
        </div>
      </div>

      <main className="container mx-auto  space-y-6 flex-grow">
        {dates
          .filter((date) => !selectedDate || selectedDate === date)
          .map((date) => (
            <div
              key={date}
              className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="bg-gray-800 px-4 py-3">
                <h2 className="text-white text-sm sm:text-base font-semibold">
                  <Calendar className="inline w-4 h-4 mr-2" />
                  {formatDateHeader(date)}
                </h2>
              </div>

              <div className="divide-y divide-gray-700">
                {groupedMatches[date].map((match) => (
                  <div
                    key={match.id}
                    className="p-4 hover:bg-gray-800 transition grid grid-cols-1 sm:grid-cols-12 gap-4"
                  >
                    <div className="sm:col-span-2 text-xs sm:text-sm font-medium text-white flex items-center sm:justify-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatMatchDateTime(match.match_date, match.match_time)}
                    </div>

                    <div className="sm:col-span-6 space-y-1">
                      <div className="text-sm sm:text-base font-medium text-white">
                        {match.home_team} vs {match.away_team}
                      </div>
                      {match.venue && (
                        <div className="text-xs sm:text-sm text-gray-400 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {match.venue}
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-3 text-right sm:text-left space-y-1">
                      <div className="text-sm sm:text-base font-medium text-white">
                        <Trophy className="inline w-4 h-4 mr-1" />
                        {match.league_name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        {match.country} • {match.league_code}
                      </div>
                    </div>

                    <div className="sm:col-span-1 flex flex-col items-end sm:items-center justify-between space-y-2">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {match.status}
                      </span>
                      <Link href={`/matches/${match.id}`} passHref>
                        <Button className="w-full flex items-center bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg group-hover:shadow-xl transition-all">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {matches.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            No matches scheduled for the next 7 days
          </div>
        )}
      </main>
    </div>
  )
}
