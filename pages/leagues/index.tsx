'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { matchesApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Globe, Users, Calendar, Loader2 } from 'lucide-react'
import type { League } from '@/types/matches'

export default function LeaguesPage() {
  const { data: leaguesData, isLoading } = useQuery({
    queryKey: ['leagues'],
    queryFn: () => matchesApi.getLeagues(),
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Football Leagues
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Explore leagues from around the world
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
            <Button className="bg-primary text-white hover:bg-primary/90 text-sm px-4 py-2">
              <Link href="/matches">View Matches</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {leaguesData?.data?.leagues?.length || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Leagues</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {new Set(leaguesData?.data?.leagues?.map((l: League) => l.country)).size || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Countries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(leaguesData?.data?.leagues?.length || 0) * 20}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Est. Teams</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">365</div>
                  <div className="text-sm font-medium text-gray-600">Days Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leagues Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="animate-pulse border-0 shadow-lg">
                <CardHeader className="h-20 bg-gray-100 rounded-t-lg" />
                <CardContent className="h-32 bg-gray-50 rounded-b-lg" />
              </Card>
            ))}
          </div>
        ) : leaguesData?.data?.leagues && leaguesData.data.leagues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaguesData.data.leagues.map((league: League) => (
              <LeagueCard key={league.id} league={league} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-20 border-0 shadow-lg">
            <CardContent>
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No leagues found</h3>
              <p className="text-gray-600 mb-6">Unable to load leagues at this time</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function LeagueCard({ league }: { league: League }) {
  const placeholderImage = `/placeholder.svg?height=80&width=80&text=${league.name.charAt(0)}`

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-white">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
        <CardTitle className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden border">
            <img
              src={league.emblem || placeholderImage}
              alt={league.name}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = placeholderImage
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xl text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
              {league.name}
            </div>
            <div className="text-gray-600 text-sm font-medium flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {league.country}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 font-semibold"
          >
            {league.code}
          </Badge>
          <div className="text-sm text-gray-500">Season 2024/25</div>
        </div>
        <Button className="w-full flex items-center bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-lg">
          <Link className="flex items-center" href={`/matches?league=${league.code}`}>
            <Trophy className="mr-2 h-4 w-4" />
            View Matches
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
