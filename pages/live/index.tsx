import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { matchesApi } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Loader2, Play, Users } from 'lucide-react'
import { LiveIndicator } from '@/components/ui/live-indicator'
import { MatchCard } from '@/components/matches/MatchCard'
import type { Match } from '@/types/matches'

export default function LiveMatchesPage() {
  const { data: liveMatches, isLoading } = useQuery({
    queryKey: ['liveMatches'],
    queryFn: () => matchesApi.getLiveMatches(),
    refetchInterval: 10000,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <LiveIndicator />
              <span className="text-red-500 font-bold text-xs sm:text-sm uppercase tracking-wider">
                Live Now
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Live Matches
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Real-time football scores and live updates
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
            <Button variant="outline" className="text-sm px-4 py-2">
              <Link href="/matches">All Matches</Link>
            </Button>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {liveMatches?.data?.matches?.length || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Live Matches</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {(liveMatches?.data?.matches?.length || 0) * 2}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Teams Playing</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(liveMatches?.data?.matches?.map((m: Match) => m.league_name)).size ||
                      0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Active Leagues</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Matches Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <CardHeader className="h-20 bg-gray-100 rounded-t-lg" />
                <CardContent className="h-32 bg-gray-50 rounded-b-lg" />
              </Card>
            ))}
          </div>
        ) : liveMatches?.data?.matches && liveMatches.data.matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveMatches.data.matches.map((match: Match) => (
              // @ts-ignore
              <MatchCard key={match.id} match={match} isLive />
            ))}
          </div>
        ) : (
          <Card className="text-center py-20 border-0 shadow-lg">
            <CardContent>
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No live matches</h3>
              <p className="text-gray-600 mb-6">There are currently no matches being played live</p>
              <Button>
                <Link href="/matches">Browse All Matches</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>Live scores update automatically every 10 seconds</span>
          </div>
        </div>
      </div>
    </div>
  )
}
