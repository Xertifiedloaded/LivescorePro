import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Calendar,
  Clock,
  Trophy,
  Play,
  Users,
  Star,
  Zap,
  Shield,
  Target,
  ArrowRight,
  BarChart3,
  Globe,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "../components/ui/button";
import { matchesApi } from "../lib/api";
import { Badge } from "../components/ui/badge";
import Link from "next/link";

// Define proper types
interface Match {
  id: string | number;
  home_team: string;
  away_team: string;
  league_name: string;
  status: string;
  match_date: string;
  home_score?: number;
  away_score?: number;
  odds_home?: string;
  odds_draw?: string;
  odds_away?: string;
}

interface League {
  code: string;
  name: string;
  country: string;
  emblem?: string;
}

interface LeagueWithMatches {
  league: League;
  matches: Match[];
}

interface MatchesResponse {
  data: {
    matches: Match[];
  };
}

interface PopularMatchesResponse {
  data: {
    leagues: LeagueWithMatches[];
  };
}

export default function HomePage() {
  const { data: todayMatches } = useQuery<MatchesResponse>({
    queryKey: ["todayMatches"],
    queryFn: () => matchesApi.getTodayMatches(),
  });

  const { data: liveMatches } = useQuery<MatchesResponse>({
    queryKey: ["liveMatches"],
    queryFn: () => matchesApi.getLiveMatches(),
  });

  const { data: popularMatches } = useQuery<PopularMatchesResponse>({
    queryKey: ["popularMatches"],
    queryFn: () => matchesApi.getPopularMatches(),
  });

  const heroStats = {
    totalMatches:
      (todayMatches?.data?.matches?.length || 0) +
      (liveMatches?.data?.matches?.length || 0),
    liveMatches: liveMatches?.data?.matches?.length || 0,
    leagues: popularMatches?.data?.leagues?.length || 0,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20 pb-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 rounded-full px-5 py-2 mb-8 border border-yellow-500/30 backdrop-blur-sm">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-semibold">
                Live Scores & Smart Betting Tips
              </span>
            </div>

            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your Ultimate{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Football Companion
              </span>
            </h1>

            <p className="text-sm text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Stay ahead with real-time football scores, expert match
              predictions, and daily betting tips — all in one sleek and
              reliable platform.
            </p>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {heroStats.totalMatches}
                </div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  Matches Today
                </div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
                <div className="text-4xl font-bold text-emerald-400 mb-2">
                  {heroStats.liveMatches}
                </div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  Live Now
                </div>
              </div>
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {heroStats.leagues}
                </div>
                <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                  Premium Leagues
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 h-14 font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/20 transition-all duration-300"

              >
                <Link className="flex items-center" href="/register">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white px-10 py-4 h-14 font-semibold rounded-xl backdrop-blur-sm"

              >
                <Link className="flex items-center" href="/matches">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Explore Analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-20">
        {/* Live Matches */}
        {liveMatches?.data?.matches && liveMatches.data.matches.length > 0 && (
          <section className="mb-24">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 font-bold text-sm uppercase tracking-wider">
                    Live Now
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  Live Matches
                </h2>
                <p className="text-slate-400 text-lg">
                  Real-time updates and live betting opportunities
                </p>
              </div>
              <Button
                variant="outline"
                className="hidden md:flex border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"

              >
                <Link href="/live">
                  View All Live
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveMatches.data.matches.slice(0, 3).map((match: Match) => (
                <MatchCard key={match.id} match={match} isLive />
              ))}
            </div>
          </section>
        )}

        {/* Today's Matches */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400 font-bold text-sm uppercase tracking-wider">
                  Today
                </span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Today's Fixtures
              </h2>
              <p className="text-slate-400 text-lg">
                Advanced predictions for today's most exciting matches
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden md:flex border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              asChild
            >
              <Link href="/matches">
                View All Matches
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {todayMatches?.data?.matches &&
          todayMatches.data.matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayMatches.data.matches.slice(0, 6).map((match: Match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50">
              <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-3">
                No matches today
              </h3>
              <p className="text-slate-400">
                Check back tomorrow for new fixtures and predictions
              </p>
            </div>
          )}
        </section>

        {/* Popular Leagues */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm uppercase tracking-wider">
                  Premium
                </span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Elite Leagues
              </h2>
              <p className="text-slate-400 text-lg">
                The world's most competitive football competitions
              </p>
            </div>
            <Button
              variant="outline"
              className="hidden md:flex border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              asChild
            >
              <Link href="/leagues">
                View All Leagues
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {popularMatches?.data?.leagues &&
          popularMatches.data.leagues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularMatches.data.leagues
                .slice(0, 6)
                .map((leagueData: LeagueWithMatches) => (
                  <LeagueCard
                    key={leagueData.league.code}
                    leagueData={leagueData}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50">
              <Trophy className="h-16 w-16 text-slate-600 mx-auto mb-6" />
              <p className="text-slate-400 text-lg">
                Loading premium leagues...
              </p>
            </div>
          )}
        </section>

        <section className="py-20 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl border border-slate-700/30 mb-24">
          <div className="px-8 md:px-16">
            <div className="text-center mb-16">
              <h2 className="text-2xl  font-bold text-white mb-6">
                Professional-Grade Features
              </h2>
              <p className="text-slate-300 text-xs lg:text-sm max-w-3xl mx-auto leading-relaxed">
                Advanced tools and insights designed for serious football
                betting professionals and enthusiasts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <FeatureCard
                icon={<Globe className="h-8 w-8" />}
                title="Global Coverage"
                description="Access to 100+ leagues worldwide including Premier League, La Liga, Serie A, Bundesliga, and emerging markets with comprehensive data"
                color="text-blue-400"
                bgColor="bg-blue-500/20"
                borderColor="border-blue-500/30"
              />
              <FeatureCard
                icon={<BarChart3 className="h-8 w-8" />}
                title="Advanced Analytics"
                description="Machine learning algorithms, predictive models, and comprehensive performance tracking to maximize your betting success rate"
                color="text-emerald-400"
                bgColor="bg-emerald-500/20"
                borderColor="border-emerald-500/30"
              />
              <FeatureCard
                icon={<Clock className="h-8 w-8" />}
                title="Real-Time Intelligence"
                description="Live match updates, instant odds movements, injury reports, and real-time notifications for all your active predictions"
                color="text-orange-400"
                bgColor="bg-orange-500/20"
                borderColor="border-orange-500/30"
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8" />}
                title="Enterprise Security"
                description="Bank-grade encryption, secure multi-factor authentication, and complete data protection with 99.9% uptime guarantee"
                color="text-purple-400"
                bgColor="bg-purple-500/20"
                borderColor="border-purple-500/30"
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Expert Network"
                description="Connect with professional tipsters, industry experts, and successful bettors in our exclusive community platform"
                color="text-pink-400"
                bgColor="bg-pink-500/20"
                borderColor="border-pink-500/30"
              />
              <FeatureCard
                icon={<Target className="h-8 w-8" />}
                title="AI Predictions"
                description="Advanced neural networks analyze thousands of data points including team form, player statistics, and historical patterns"
                color="text-cyan-400"
                bgColor="bg-cyan-500/20"
                borderColor="border-cyan-500/30"
              />
            </div>
          </div>
        </section>

<section className="text-center py-16 sm:py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl text-white relative overflow-hidden">
  <div className="absolute inset-0 bg-black/20" />
  <div className="relative max-w-4xl mx-auto px-4 sm:px-8">
    <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
      Ready to Dominate the Game?
    </h2>
    <p className="text-sm sm:text-xl text-blue-100 mb-8 sm:mb-10 leading-relaxed max-w-3xl mx-auto">
      Join the elite circle of professional bettors who rely on
      BetFootball Pro for data-driven predictions. Start your premium
      trial today—no commitment required.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
      <Button
        size="lg"
        className="bg-white text-blue-600 hover:bg-gray-100 px-6 sm:px-10 py-3 sm:py-4 h-12 sm:h-14 font-bold rounded-xl shadow-2xl hover:shadow-white/20 transition-all duration-300"
      >
        <Link className="flex items-center" href="/register">
          <Zap className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-sm sm:text-sm">Start Premium Trial</span>
        </Link>
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm px-6 sm:px-10 py-3 sm:py-4 h-12 sm:h-14 font-bold rounded-xl"
      >
        <Link className="flex items-center" href="/matches">
          <Play className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-sm sm:text-sm">Explore Platform</span>
        </Link>
      </Button>
    </div>
  </div>
</section>

      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  bgColor,
  borderColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div className="text-left group hover:transform hover:scale-105 transition-all duration-500">
      <div
        className={`w-14 h-14 sm:w-16 sm:h-16 ${bgColor} ${borderColor} border rounded-2xl flex items-center justify-center mb-4 sm:mb-6 ${color} group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm shadow-lg`}
      >
        {icon}
      </div>
      <h3 className="font-bold text-lg sm:text-xl mb-2 sm:mb-4 text-white group-hover:text-blue-300 transition-colors">
        {title}
      </h3>
      <p className="text-sm sm:text-sm text-slate-300 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function LeagueCard({ leagueData }: { leagueData: LeagueWithMatches }) {
  const placeholderImage =
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&h=100&fit=crop";

  return (
    <Card className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-slate-700/50 shadow-xl overflow-hidden bg-slate-800/60 backdrop-blur-sm hover:border-blue-500/30">
      <CardHeader className="bg-gradient-to-r from-slate-700/60 to-slate-800/60 border-b border-slate-700/50 backdrop-blur-sm">
        <CardTitle className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-900/60 backdrop-blur-sm shadow-lg flex items-center justify-center overflow-hidden border border-slate-600/50">
            <img
              src={leagueData.league.emblem || placeholderImage}
              alt={leagueData.league.name}
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = placeholderImage;
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-base sm:text-xl text-white group-hover:text-blue-300 transition-colors line-clamp-1">
              {leagueData.league.name}
            </div>
            <div className="text-slate-400 text-xs sm:text-sm font-medium">
              {leagueData.league.country}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <span className="text-slate-400 text-xs sm:text-sm font-medium">
            Upcoming matches
          </span>
          <Badge
            variant="secondary"
            className="bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold"
          >
            {leagueData.matches.length}
          </Badge>
        </div>
        <Button
          className="w-full text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg"
          asChild
        >
          <Link href={`/matches?league=${leagueData.league.code}`}>
            <Trophy className="mr-2 h-4 w-4" />
            View Matches
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}


function MatchCard({
  match,
  isLive = false,
}: {
  match: Match;
  isLive?: boolean;
}) {
  return (
    <Card className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border border-slate-700/50 shadow-xl overflow-hidden bg-slate-800/60 backdrop-blur-sm hover:border-blue-500/30">
      <CardHeader
        className={`pb-4 border-b border-slate-700/50 backdrop-blur-sm ${
          isLive
            ? "bg-gradient-to-r from-red-500/20 to-pink-500/20"
            : "bg-gradient-to-r from-slate-700/40 to-slate-800/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <Badge
            variant={isLive ? "secondary" : "outline"}
            className={
              isLive
                ? "bg-red-500/30 text-red-300 border border-red-500/50 font-semibold"
                : "bg-slate-700/60 text-slate-300 border border-slate-600/50 font-semibold backdrop-blur-sm"
            }
          >
            {isLive && (
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2" />
            )}
            {isLive ? "LIVE" : match.status}
          </Badge>
          <span className="text-xs sm:text-sm text-slate-400 font-medium">
            {match.league_name}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white text-base sm:text-lg">
              {match.home_team}
            </span>
            {match.home_score !== undefined && (
              <span className="font-bold text-2xl sm:text-3xl text-blue-400">
                {match.home_score}
              </span>
            )}
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full h-px bg-slate-600" />
            <span className="px-4 sm:px-6 text-slate-500 font-bold text-xs sm:text-sm">VS</span>
            <div className="w-full h-px bg-slate-600" />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-white text-base sm:text-lg">
              {match.away_team}
            </span>
            {match.away_score !== undefined && (
              <span className="font-bold text-2xl sm:text-3xl text-blue-400">
                {match.away_score}
              </span>
            )}
          </div>

          {!isLive && (
            <div className="text-center text-xs sm:text-sm text-slate-300 bg-slate-700/50 rounded-lg py-2 sm:py-3 border border-slate-600/50 backdrop-blur-sm">
              <Calendar className="h-4 w-4 inline mr-2" />
              {format(new Date(match.match_date), "MMM dd, HH:mm")}
            </div>
          )}

          {match.odds_home && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div className="text-center p-2 sm:p-3 bg-emerald-500/20 rounded-lg border border-emerald-500/30 backdrop-blur-sm">
                <div className="font-bold text-emerald-300 text-base sm:text-lg">
                  {match.odds_home}
                </div>
                <div className="text-emerald-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                  Home
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-slate-700/50 rounded-lg border border-slate-600/50 backdrop-blur-sm">
                <div className="font-bold text-slate-300 text-base sm:text-lg">
                  {match.odds_draw}
                </div>
                <div className="text-slate-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                  Draw
                </div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-blue-500/20 rounded-lg border border-blue-500/30 backdrop-blur-sm">
                <div className="font-bold text-blue-300 text-base sm:text-lg">
                  {match.odds_away}
                </div>
                <div className="text-blue-400 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                  Away
                </div>
              </div>
            </div>
          )}

          <Button
            className="w-full text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg"
            asChild
          >
            <Link href={`/matches/${match.id}`}>
              {isLive ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Watch Live
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analysis
                </>
              )}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
