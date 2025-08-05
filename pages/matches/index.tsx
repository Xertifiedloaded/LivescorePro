"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { matchesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Search, Filter, Loader2 } from "lucide-react";
import { MatchCard } from "@/components/matches/MatchCard";
import type { Match, League } from "@/types/matches";

export default function MatchesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const league = (router.query.league as string) || "";
  const status = (router.query.status as string) || "SCHEDULED";
  const limit = 20;
  const offset = Number.parseInt((router.query.offset as string) || "0");

  const { data: matchesData, isLoading } = useQuery({
    queryKey: ["matches", league, status, offset],
    queryFn: () =>
      matchesApi.getMatches({
        league,
        status,
        limit,
        offset,
      }),
  });

  const { data: leaguesData } = useQuery({
    queryKey: ["leagues"],
    queryFn: () => matchesApi.getLeagues(),
  });

  const handleFilterChange = (key: string, value: string) => {
    const query = { ...router.query };
    if (value) {
      query[key] = value;
    } else {
      delete query[key];
    }
    delete query.offset;
    router.push({ pathname: router.pathname, query });
  };

  const handlePageChange = (newOffset: number) => {
    const query = { ...router.query, offset: newOffset.toString() };
    router.push({ pathname: router.pathname, query });
  };

  const filteredMatches: Match[] =
    matchesData?.data?.matches?.filter(
      (match: Match) =>
        searchTerm === "" ||
        match.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.away_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.league_name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PLAY">In Play</option>
                <option value="FINISHED">Finished</option>
                <option value="POSTPONED">Postponed</option>
              </select>

              <select
                value={league}
                onChange={(e) => handleFilterChange("league", e.target.value)}
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
                  router.push({ pathname: router.pathname });
                  setSearchTerm("");
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match: Match) => (
                // @ts-ignore
                <MatchCard key={match.id} match={match} />
              ))}
            </div>

            {filteredMatches.length === 0 && (
              <Card className="text-center py-20 border-0 shadow-lg">
                <CardContent>
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No matches found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button
                    onClick={() => {
                      router.push({ pathname: router.pathname });
                      setSearchTerm("");
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
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(offset + limit)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
