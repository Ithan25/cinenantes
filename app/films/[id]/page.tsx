"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    Star,
    Calendar,
    Users,
    Clapperboard,
    Building2,
    ExternalLink,
    MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import FavoriteButton from "@/components/FavoriteButton";
import ShowtimesList from "@/components/ShowtimesList";
import { useShowtimes } from "@/hooks/useShowtimes";
import { ShowtimeGroup, Movie } from "@/lib/types";

import { getTodayDate, formatDate } from "@/lib/utils";

// Generate date options (today + 6 days)
function getDateOptions() {
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const value = formatDate(d);
        const label =
            i === 0
                ? "Aujourd'hui"
                : i === 1
                    ? "Demain"
                    : d.toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                    });
        return { value, label };
    });
}

export default function FilmDetailPage() {
    const params = useParams();
    const movieId = params.id as string;
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(getTodayDate());

    // Fetch showtimes for the selected date
    const { groups, isLoading } = useShowtimes({ date: selectedDate });

    // Find movie in groups for the selected date
    const movieGroups = groups.filter(
        (g: ShowtimeGroup) => g.movie.id === movieId
    );
    const movieFromSelectedDate = movieGroups.length > 0 ? movieGroups[0].movie : null;

    // Track the best known movie data across date changes
    const [movieData, setMovieData] = useState<Movie | null>(null);
    const [searchingDates, setSearchingDates] = useState(false);
    const searchedRef = useRef(false);

    // Update movieData whenever we find the movie on the selected date
    useEffect(() => {
        if (movieFromSelectedDate) {
            setMovieData(movieFromSelectedDate);
            setSearchingDates(false);
        }
    }, [movieFromSelectedDate]);

    // If movie not found after loading today, search other dates
    useEffect(() => {
        if (isLoading || movieData || searchedRef.current) return;

        // If we have loaded the data for the selected date, but the movie isn't there
        // We should search other dates. We remove the groups.length check because 
        // groups could be empty if no movies are playing at all today.
        if (!movieFromSelectedDate) {
            // Movie wasn't found on selected date, search other dates
            searchedRef.current = true;
            setSearchingDates(true);

            const dateOptions = getDateOptions();
            const otherDates = dateOptions
                .map((d) => d.value)
                .filter((d) => d !== selectedDate);

            // Search remaining dates sequentially until we find the movie
            (async () => {
                for (const date of otherDates) {
                    try {
                        const params = new URLSearchParams({ date });
                        const res = await fetch(`/api/showtimes?${params.toString()}`);
                        if (!res.ok) continue;
                        const data = await res.json();
                        const found = (data.groups || []).find(
                            (g: ShowtimeGroup) => g.movie.id === movieId
                        );
                        if (found) {
                            setMovieData(found.movie);
                            setSelectedDate(date); // Switch to the date where we found the movie
                            setSearchingDates(false);
                            return;
                        }
                    } catch {
                        // continue
                    }
                }
                setSearchingDates(false);
            })();
        }
    }, [isLoading, groups, movieFromSelectedDate, movieData, movieId, selectedDate]);

    const dateOptions = getDateOptions();
    const movie = movieData;

    if (isLoading && !movie) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                <Skeleton className="h-8 w-40 shimmer" />
                <div className="flex flex-col md:flex-row gap-8">
                    <Skeleton className="w-64 h-96 rounded-xl shimmer shrink-0" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-10 w-3/4 shimmer" />
                        <Skeleton className="h-5 w-1/2 shimmer" />
                        <Skeleton className="h-20 w-full shimmer" />
                    </div>
                </div>
            </div>
        );
    }

    if (!movie && !searchingDates) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 text-center">
                <span className="text-5xl">🎬</span>
                <h1 className="text-2xl font-bold mt-4">Film non trouvé</h1>
                <p className="text-muted-foreground mt-2">
                    Ce film n&apos;est actuellement pas à l&apos;affiche.
                </p>
                <Button onClick={() => router.back()} variant="outline" className="mt-4 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                </Button>
            </div>
        );
    }

    if (!movie && searchingDates) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
                <Skeleton className="h-8 w-40 shimmer" />
                <div className="flex flex-col md:flex-row gap-8">
                    <Skeleton className="w-64 h-96 rounded-xl shimmer shrink-0" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-10 w-3/4 shimmer" />
                        <Skeleton className="h-5 w-1/2 shimmer" />
                        <Skeleton className="h-20 w-full shimmer" />
                    </div>
                </div>
            </div>
        );
    }

    // At this point, movie is guaranteed to be non-null
    const m = movie!;

    return (
        <div className="min-h-screen bg-background">
            {/* Full Width Backdrop */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                {m.backdropUrl || m.posterUrl ? (
                    <img
                        src={m.backdropUrl || m.posterUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-30 select-none"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-background opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent " />

                <div className="absolute top-6 left-4 md:left-8 z-20">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => router.back()}
                        className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/10 gap-2 rounded-full px-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Retour
                    </Button>
                </div>
            </div>

            {/* Content Container - Overlapping Backdrop */}
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 pb-20 z-10">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                    {/* Left Column: Poster & Quick Actions */}
                    <div className="w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl neon-glow-strong ring-1 ring-white/10 group">
                            {m.posterUrl ? (
                                <img
                                    src={m.posterUrl}
                                    alt={m.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                    <span className="text-6xl">🎬</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <FavoriteButton
                                id={m.id}
                                type="movie"
                                name={m.title}
                                size="default"
                                metadata={{
                                    posterUrl: m.posterUrl,
                                    rating: m.rating,
                                    genres: m.genres,
                                    duration: m.duration,
                                    releaseDate: m.releaseDate
                                }}
                                className="flex-1 justify-center h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12] backdrop-blur-sm"
                            />
                            {m.rating && (
                                <div className="flex h-11 items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.08] px-4 font-semibold text-amber-400">
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    <span className="text-sm">{m.rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Title, Details, Showtimes */}
                    <div className="flex-1 min-w-0 pt-4 md:pt-12 space-y-8">
                        {/* Header Info */}
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground drop-shadow-xl loading-tight">
                                {m.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm md:text-base text-muted-foreground font-medium">
                                {m.duration && (
                                    <span className="flex items-center gap-2 text-foreground/90">
                                        <Clock className="h-4 w-4 text-primary" />
                                        {m.duration}
                                    </span>
                                )}
                                {m.genres && m.genres.length > 0 && (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                                        <span className="text-foreground/80">{m.genres.join(" · ")}</span>
                                    </>
                                )}
                                {m.releaseDate && (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
                                        <span className="text-foreground/80">
                                            {new Date(m.releaseDate).getFullYear()}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 pb-8 border-b border-black/5 dark:border-white/5">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    Synopsis
                                </h3>
                                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                                    {m.synopsis || "Aucun résumé disponible."}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {m.director && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Clapperboard className="h-4 w-4 text-primary" />
                                            Réalisation
                                        </h3>
                                        <p className="font-medium text-lg text-foreground pl-6 border-l-2 border-primary/50">
                                            {m.director}
                                        </p>
                                    </div>
                                )}
                                {m.cast && m.cast.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Users className="h-4 w-4 text-primary" />
                                            Casting
                                        </h3>
                                        <div className="flex flex-wrap gap-2 pl-6 border-l-2 border-black/5 dark:border-white/10">
                                            {m.cast.map(actor => (
                                                <span key={actor} className="inline-block bg-black/5 dark:bg-white/5 px-3 py-1 rounded-md text-sm border border-black/5 dark:border-white/5 text-foreground/90">
                                                    {actor}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Showtimes Section with Date Selector */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <span className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Building2 className="h-6 w-6" />
                                    </span>
                                    Séances
                                    {movieGroups.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {movieGroups.length} cinéma{movieGroups.length > 1 ? "s" : ""}
                                        </Badge>
                                    )}
                                </h2>
                            </div>

                            {/* Date selector */}
                            <div className="flex gap-1.5 overflow-x-auto pb-1">
                                {dateOptions.map((d) => (
                                    <Button
                                        key={d.value}
                                        variant={selectedDate === d.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedDate(d.value)}
                                        className={`whitespace-nowrap text-xs shrink-0 rounded-full px-4 ${selectedDate === d.value
                                            ? "bg-primary text-primary-foreground font-semibold shadow-[0_0_15px_rgba(251,191,36,0.25)] hover:bg-primary/90"
                                            : "border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/5 text-muted-foreground hover:text-foreground hover:border-primary/30"
                                            }`}
                                    >
                                        {d.label}
                                    </Button>
                                ))}
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {[1, 2].map((i) => (
                                        <Skeleton key={i} className="h-32 w-full rounded-xl shimmer" />
                                    ))}
                                </div>
                            ) : movieGroups.length === 0 ? (
                                <Card className="border-border/50 bg-card/30 p-8 text-center backdrop-blur-sm">
                                    <span className="text-4xl block mb-4">🗓️</span>
                                    <h3 className="text-lg font-semibold">Aucune séance ce jour</h3>
                                    <p className="text-muted-foreground">Essayez une autre date pour trouver des séances.</p>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {movieGroups.map((group) => (
                                        <Card
                                            key={group.cinema.id}
                                            className="group border-border/50 bg-card/40 hover:bg-card/60 hover:border-primary/20 transition-all duration-300"
                                        >
                                            <CardContent className="p-5 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <Link
                                                        href={`/cinemas/${group.cinema.id}`}
                                                        className="flex-1"
                                                    >
                                                        <div>
                                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                                                                {group.cinema.name}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                {group.cinema.city}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                    <a
                                                        href={group.cinema.websiteUrl || group.cinema.allocineUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="shrink-0 ml-2"
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs border-primary/30 text-primary/80 hover:bg-primary/10 hover:text-primary gap-1.5"
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                            Site
                                                        </Button>
                                                    </a>
                                                </div>
                                                <Separator className="bg-black/5 dark:bg-white/5" />
                                                <ShowtimesList showtimes={group.showtimes} />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
