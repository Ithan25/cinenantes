"use client";

import { useMemo } from "react";
import { Film } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MovieCard from "@/components/MovieCard";
import FilterBar from "@/components/FilterBar";
import { useShowtimes } from "@/hooks/useShowtimes";
import { usePersistedFilters } from "@/hooks/usePersistedFilters";
import { ShowtimeGroup, Movie, Showtime } from "@/lib/types";

export default function FilmsPage() {
    const {
        selectedDate, setSelectedDate,
        searchQuery, setSearchQuery,
        selectedCinema, setSelectedCinema,
        isInitialized,
    } = usePersistedFilters("films");

    const { groups, isLoading } = useShowtimes({
        date: selectedDate,
        cinemaId: selectedCinema || undefined,
    });



    // Aggregate movies across cinemas
    const movies = useMemo(() => {
        const movieMap = new Map<
            string,
            { movie: Movie; allShowtimes: Showtime[]; cinemaNames: string[] }
        >();

        groups.forEach((g: ShowtimeGroup) => {
            const existing = movieMap.get(g.movie.id);
            if (existing) {
                existing.allShowtimes.push(...g.showtimes);
                if (!existing.cinemaNames.includes(g.cinema.name)) {
                    existing.cinemaNames.push(g.cinema.name);
                }
            } else {
                movieMap.set(g.movie.id, {
                    movie: g.movie,
                    allShowtimes: [...g.showtimes],
                    cinemaNames: [g.cinema.name],
                });
            }
        });

        return Array.from(movieMap.values());
    }, [groups]);

    // Filter
    const filtered = useMemo(() => {
        if (!searchQuery) return movies;
        const q = searchQuery.toLowerCase();
        return movies.filter((m) =>
            m.movie.title.toLowerCase().includes(q) ||
            m.cinemaNames.some((n) => n.toLowerCase().includes(q))
        );
    }, [movies, searchQuery]);

    if (!isInitialized) return null;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Film className="h-8 w-8 text-primary" />
                    <span className="gradient-text">Films à l&apos;affiche</span>
                </h1>
                <p className="text-muted-foreground">
                    Tous les films diffusés dans les cinémas de Nantes et périphérie
                </p>
            </div>

            {/* Filters */}
            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCinema={selectedCinema}
                onCinemaChange={setSelectedCinema}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
            />

            {/* Results count */}
            {!isLoading && (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                        {filtered.length} film{filtered.length > 1 ? "s" : ""}
                    </Badge>
                    {selectedCinema && (
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                            Filtré par cinéma
                        </Badge>
                    )}
                </div>
            )}

            {/* Movies Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 15 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden border-border/50 bg-card/80">
                            <Skeleton className="aspect-[2/3] w-full shimmer" />
                            <CardContent className="p-3 space-y-2">
                                <Skeleton className="h-4 w-3/4 shimmer" />
                                <Skeleton className="h-3 w-1/2 shimmer" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <span className="text-5xl mb-4">🎬</span>
                        <h3 className="font-semibold text-lg mb-1">
                            Aucun film trouvé
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            {searchQuery
                                ? `Aucun résultat pour "${searchQuery}".`
                                : "Les films ne sont pas encore disponibles pour cette date."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map(({ movie, allShowtimes, cinemaNames }) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            showtimes={allShowtimes}
                            cinemaName={
                                cinemaNames.length === 1
                                    ? cinemaNames[0]
                                    : `${cinemaNames.length} cinémas`
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
