"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Film, Building2, ArrowRight, Sparkles, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MovieCard from "@/components/MovieCard";
import CinemaCard from "@/components/CinemaCard";
import FilterBar from "@/components/FilterBar";
import { useShowtimes } from "@/hooks/useShowtimes";
import { usePersistedFilters } from "@/hooks/usePersistedFilters";
import { CINEMAS } from "@/lib/cinemas";
import { Movie, Showtime } from "@/lib/types";

import { getTodayDate } from "@/lib/utils";

interface AggregatedMovie {
  movie: Movie;
  allShowtimes: Showtime[];
  cinemaCount: number;
}

import { Suspense } from "react";

function HomeContent() {
  const {
    selectedDate, setSelectedDate,
    searchQuery, setSearchQuery,
    selectedCinema, setSelectedCinema,
    isInitialized,
  } = usePersistedFilters("home");

  const { groups, isLoading } = useShowtimes({
    date: selectedDate,
    cinemaId: selectedCinema || undefined,
  });

  // Aggregate all showtimes per unique movie
  const aggregatedMovies = useMemo(() => {
    const movieMap = new Map<string, AggregatedMovie>();
    groups.forEach((g) => {
      const existing = movieMap.get(g.movie.id);
      if (existing) {
        existing.allShowtimes.push(...g.showtimes);
        existing.cinemaCount++;
        if (!existing.movie.posterUrl && g.movie.posterUrl) {
          existing.movie = g.movie;
        }
      } else {
        movieMap.set(g.movie.id, {
          movie: { ...g.movie },
          allShowtimes: [...g.showtimes],
          cinemaCount: 1,
        });
      }
    });
    return Array.from(movieMap.values()).map((am) => ({
      ...am,
      allShowtimes: am.allShowtimes.sort((a, b) => a.time.localeCompare(b.time)),
    }));
  }, [groups]);

  // Filter by search
  const filteredMovies = useMemo(() => {
    if (!searchQuery) return aggregatedMovies;
    const q = searchQuery.toLowerCase();
    return aggregatedMovies.filter((am) =>
      am.movie.title.toLowerCase().includes(q)
    );
  }, [aggregatedMovies, searchQuery]);

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 dark:border-white/5">
        <div className="absolute inset-0 bg-background">
          <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/5 via-primary/5 to-transparent opacity-40 mix-blend-screen pointer-events-none" />
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-20 animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] mix-blend-screen opacity-20" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/30 bg-primary/10 text-primary backdrop-blur-md rounded-full text-sm font-medium shadow-[0_0_15px_rgba(251,191,36,0.1)]">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            Toutes les séances en temps réel
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 drop-shadow-lg">
            <span className="gradient-text">CinéNantes</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed mb-10">
            L'expérience cinéma ultime à Nantes.
            <br className="hidden sm:block" />
            Toutes les salles, tous les films, une seule app.
          </p>

          <div className="grid grid-cols-3 gap-8 md:gap-16 border-t border-black/10 dark:border-white/10 pt-8 px-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">{CINEMAS.length}</span>
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Cinémas</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">{aggregatedMovies.length}</span>
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Films à l&apos;affiche</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-foreground">{aggregatedMovies.reduce((sum, m) => sum + m.allShowtimes.length, 0)}</span>
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Séances</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        <div>
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCinema={selectedCinema}
            onCinemaChange={setSelectedCinema}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="p-2 rounded-lg bg-primary/10 text-primary"><Clock className="h-6 w-6" /></span>
              {selectedDate === getTodayDate() ? "Séances du jour" : `Séances du ${new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
              {!isLoading && (
                <span className="text-base font-normal text-muted-foreground ml-2">
                  ({filteredMovies.length} film{filteredMovies.length > 1 ? "s" : ""})
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl shimmer" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4 shimmer" />
                    <Skeleton className="h-3 w-1/2 shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMovies.length === 0 ? (
            <Card className="border-border/50 bg-card/30 backdrop-blur-sm p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-2">
                  <span className="text-5xl grayscale opacity-50">🎬</span>
                </div>
                <h3 className="font-bold text-xl">Aucune séance trouvée</h3>
                <p className="text-muted-foreground max-w-md">
                  {searchQuery
                    ? `Aucun résultat pour "${searchQuery}". Essayez un autre terme.`
                    : "Les séances ne sont pas encore disponibles pour cette date."}
                </p>
                {searchQuery && (
                  <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4">
                    Effacer la recherche
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredMovies.map((am) => (
                <MovieCard
                  key={am.movie.id}
                  movie={am.movie}
                  showtimes={am.allShowtimes}
                  cinemaName={am.cinemaCount > 1 ? `${am.cinemaCount} cinémas` : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cinemas section */}
        <div className="space-y-6 pt-8 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="p-2 rounded-lg bg-secondary/10 text-secondary-foreground"><Building2 className="h-6 w-6" /></span>
              Nos cinémas partenaires
            </h2>
            <Link href="/cinemas">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5">
                Voir la liste complète
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CINEMAS.slice(0, 6).map((cinema) => {
              const cinemaGroups = groups.filter((g) => g.cinema.id === cinema.id);
              return (
                <CinemaCard
                  key={cinema.id}
                  cinema={cinema}
                  movieCount={cinemaGroups.length}
                  showtimeCount={cinemaGroups.reduce((sum, g) => sum + g.showtimes.length, 0)}
                />
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/5 dark:border-white/5">
        <div className="relative mx-auto max-w-7xl px-4 py-20 flex flex-col items-center">
          <Skeleton className="h-8 w-64 mb-6 rounded-full shimmer" />
          <Skeleton className="h-20 w-3/4 mb-6 shimmer" />
          <Skeleton className="h-16 w-1/2 mb-10 shimmer" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 space-y-12">
        <Skeleton className="h-14 w-full shimmer" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[2/3] w-full rounded-xl shimmer" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 shimmer" />
                <Skeleton className="h-3 w-1/2 shimmer" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
