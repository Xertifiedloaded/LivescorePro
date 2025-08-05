'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { matchesApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Search, Filter, Loader2 } from 'lucide-react'
import { MatchCard } from '@/components/matches/MatchCard'
import type { Match, League } from '@/types/matches'

export default function MatchesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  const league =
    router.query.league === undefined ? 'Premier League' : (router.query.league as string) || ''
  const status = (router.query.status as string) || 'SCHEDULED'
  const limit = 20
  const offset = Number.parseInt((router.query.offset as string) || '0')

  useEffect(() => {
    if (!router.isReady) return

    if (router.query.league === undefined) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, league: 'Premier League' },
        },
        undefined,
        { shallow: true }
      )
    }
  }, [router.isReady])

  const { data: matchesData, isLoading } = useQuery({
    queryKey: ['matches', league, status, offset],
    queryFn: () =>
      matchesApi.getMatches({
        league,
        status,
        limit,
        offset,
      }),
  })

  const { data: leaguesData } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => matchesApi.getLeagues(),
  })

  const handleFilterChange = (key: string, value: string) => {
    const query = { ...router.query }
    if (value) {
      query[key] = value
    } else {
      delete query[key]
    }
    delete query.offset
    router.push({ pathname: router.pathname, query })
  }

  const handlePageChange = (newOffset: number) => {
    const query = { ...router.query, offset: newOffset.toString() }
    router.push({ pathname: router.pathname, query })
  }

  const filteredMatches: Match[] =
    matchesData?.data?.matches?.filter(
      (match: Match) =>
        searchTerm === '' ||
        match.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.away_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.league_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  const groupedMatches =
    league === ''
      ? filteredMatches.reduce((groups: { [key: string]: { [key: string]: Match[] } }, match) => {
          const leagueName = match.league_name || 'Unknown League'
          const matchDate = new Date(match.match_date).toDateString()

          if (!groups[leagueName]) {
            groups[leagueName] = {}
          }
          if (!groups[leagueName][matchDate]) {
            groups[leagueName][matchDate] = []
          }
          groups[leagueName][matchDate].push(match)
          return groups
        }, {})
      : null

  const renderMatches = () => {
    if (league === '' && groupedMatches) {
      return (
        <div className="space-y-10">
          {Object.entries(groupedMatches)
            .sort(([leagueA], [leagueB]) => {
              if (leagueA === 'Premier League') return -1
              if (leagueB === 'Premier League') return 1
              return leagueA.localeCompare(leagueB)
            })
            .map(([leagueName, dateGroups]) => {
              const totalMatches = Object.values(dateGroups).flat().length
              return (
                <div key={leagueName} className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pb-3 border-b-2 border-primary/20">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                      {leagueName}
                    </h2>

                    <Button className="bg-primary/10 text-primary px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      <span className="inline sm:hidden">
                        {totalMatches} {totalMatches === 1 ? 'game' : 'games'}
                      </span>
                      <span className="hidden text sm:inline">
                        {totalMatches} {totalMatches === 1 ? 'match' : 'matches'}
                      </span>
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(dateGroups)
                      .sort(
                        ([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime()
                      )
                      .map(([dateString, matches]) => {
                        const date = new Date(dateString)
                        const isToday = date.toDateString() === new Date().toDateString()
                        const isTomorrow =
                          date.toDateString() === new Date(Date.now() + 86400000).toDateString()

                        let displayDate = dateString
                        if (isToday) displayDate = 'Today'
                        else if (isTomorrow) displayDate = 'Tomorrow'
                        else
                          displayDate = date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })

                        return (
                          <div key={dateString} className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <Calendar className="h-4 w-4 text-gray-500" />

                              <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                                {displayDate}
                              </h3>

                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs sm:text-sm font-medium">
                                <span className="inline sm:hidden">
                                  {matches.length} {matches.length === 1 ? 'game' : 'games'}
                                </span>
                                <span className="hidden sm:inline">
                                  {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                                </span>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-6">
                              {matches
                                .sort(
                                  (a, b) =>
                                    new Date(a.match_date).getTime() -
                                    new Date(b.match_date).getTime()
                                )
                                .map((match: Match) => (
                                  // @ts-ignore
                                  <MatchCard key={match.id} match={match} />
                                ))}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )
            })}
        </div>
      )
    } else {
      if (league !== '') {
        const matchesByDate = filteredMatches.reduce(
          (groups: { [key: string]: Match[] }, match) => {
            const matchDate = new Date(match.match_date).toDateString()
            if (!groups[matchDate]) {
              groups[matchDate] = []
            }
            groups[matchDate].push(match)
            return groups
          },
          {}
        )

        return (
          <div className="space-y-8">
            {Object.entries(matchesByDate)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([dateString, matches]) => {
                const date = new Date(dateString)
                const isToday = date.toDateString() === new Date().toDateString()
                const isTomorrow =
                  date.toDateString() === new Date(Date.now() + 86400000).toDateString()

                let displayDate = dateString
                if (isToday) displayDate = 'Today'
                else if (isTomorrow) displayDate = 'Tomorrow'
                else
                  displayDate = date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })

                return (
                  <div key={dateString} className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <h2 className="text-xl font-semibold text-gray-900">{displayDate}</h2>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm font-medium">
                        {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {matches
                        .sort(
                          (a, b) =>
                            new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
                        )
                        .map((match: Match) => (
                          // @ts-ignore
                          <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                  </div>
                )
              })}
          </div>
        )
      } else {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match: Match) => (
              // @ts-ignore
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Football Matches
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Live scores, fixtures, and betting odds
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
            <Button className="bg-primary hover:bg-primary/90 px-4 py-2 text-sm">
              <Link href="/live">Live Matches</Link>
            </Button>
          </div>
        </div>

        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teams or leagues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <select
                value={status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PLAY">In Play</option>
                <option value="FINISHED">Finished</option>
                <option value="POSTPONED">Postponed</option>
              </select>
              <select
                value={league}
                onChange={(e) => handleFilterChange('league', e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Leagues</option>
                {leaguesData?.data?.leagues?.map((leagueItem: League) => (
                  <option key={leagueItem.id} value={leagueItem.name}>
                    {leagueItem.name}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  router.push({ pathname: router.pathname })
                  setSearchTerm('')
                }}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <CardHeader className="h-20 bg-gray-100 rounded-t-lg" />
                <CardContent className="h-32 bg-gray-50 rounded-b-lg" />
              </Card>
            ))}
          </div>
        ) : (
          <>
            {renderMatches()}
            {filteredMatches.length === 0 && (
              <Card className="text-center py-20 border-0 shadow-lg">
                <CardContent>
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No matches found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                  <Button
                    onClick={() => {
                      router.push({
                        pathname: router.pathname,
                        query: { league: 'Premier League' },
                      })
                      setSearchTerm('')
                    }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
            {matchesData?.data?.matches?.length === limit && (
              <div className="flex justify-center mt-10 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  Previous
                </Button>
                <Button variant="outline" onClick={() => handlePageChange(offset + limit)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
