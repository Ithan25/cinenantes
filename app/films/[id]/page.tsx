"use client";

import { useParams } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import FavoriteButton from "@/components/FavoriteButton";
import ShowtimesList from "@/components/ShowtimesList";
import { useShowtimes } from "@/hooks/useShowtimes";
import { ShowtimeGroup } from "@/lib/types";

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

export default function FilmDetailPage() {
    const params = useParams();
    const movieId = params.id as string;

    const { groups, isLoading } = useShowtimes({ date: getToday() });

    // Find movie in groups
    const movieGroups = groups.filter(
        (g: ShowtimeGroup) => g.movie.id === movieId
    );
    const movie = movieGroups.length > 0 ? movieGroups[0].movie : null;

    if (isLoading) {
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

    if (!movie) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 text-center">
                <span className="text-5xl">🎬</span>
                <h1 className="text-2xl font-bold mt-4">Film non trouvé</h1>
                <p className="text-muted-foreground mt-2">
                    Ce film n&apos;est actuellement pas à l&apos;affiche.
                </p>
                <Link href="/films" className="mt-4 inline-block">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux films
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Full Width Backdrop */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                {movie.backdropUrl || movie.posterUrl ? (
                    <img
                        src={movie.backdropUrl || movie.posterUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-30 select-none"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-background to-background opacity-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent " />

                <div className="absolute top-6 left-4 md:left-8 z-20">
                    <Link href="/films">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-md border border-white/10 gap-2 rounded-full px-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Retour
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content Container - Overlapping Backdrop */}
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-48 pb-20 z-10">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                    {/* Left Column: Poster & Quick Actions */}
                    <div className="w-full md:w-72 lg:w-80 flex-shrink-0 flex flex-col gap-4">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl neon-glow-strong ring-1 ring-white/10 group">
                            {movie.posterUrl ? (
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                    <span className="text-6xl">🎬</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <FavoriteButton
                                id={movie.id}
                                type="movie"
                                name={movie.title}
                                size="default"
                                className="w-full justify-center bg-card/50 backdrop-blur border border-white/10 hover:bg-white/5"
                            />
                            {movie.rating && (
                                <div className="flex h-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-4 font-bold text-primary shadow-sm min-w-[4rem]">
                                    <Star className="h-4 w-4 fill-primary mr-1.5" />
                                    {movie.rating.toFixed(1)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Title, Details, Showtimes */}
                    <div className="flex-1 min-w-0 pt-4 md:pt-12 space-y-8">
                        {/* Header Info */}
                        <div className="space-y-4">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-xl loading-tight">
                                {movie.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm md:text-base text-muted-foreground font-medium">
                                {movie.duration && (
                                    <span className="flex items-center gap-2 text-white/90">
                                        <Clock className="h-4 w-4 text-primary" />
                                        {movie.duration}
                                    </span>
                                )}
                                {movie.genres && movie.genres.length > 0 && (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span className="text-white/80">{movie.genres.join(" · ")}</span>
                                    </>
                                )}
                                {movie.releaseDate && (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                        <span className="text-white/80">
                                            {new Date(movie.releaseDate).getFullYear()}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 pb-8 border-b border-white/5">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    Synopsis
                                </h3>
                                <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                                    {movie.synopsis || "Aucun résumé disponible."}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {movie.director && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Clapperboard className="h-4 w-4 text-primary" />
                                            Réalisation
                                        </h3>
                                        <p className="font-medium text-lg text-foreground pl-6 border-l-2 border-primary/50">
                                            {movie.director}
                                        </p>
                                    </div>
                                )}
                                {movie.cast && movie.cast.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <Users className="h-4 w-4 text-primary" />
                                            Casting
                                        </h3>
                                        <div className="flex flex-wrap gap-2 pl-6 border-l-2 border-white/10">
                                            {movie.cast.map(actor => (
                                                <span key={actor} className="inline-block bg-white/5 px-3 py-1 rounded-md text-sm border border-white/5 text-foreground/90">
                                                    {actor}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Showtimes Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <span className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Building2 className="h-6 w-6" />
                                    </span>
                                    Séances
                                    <Badge variant="secondary" className="ml-2">
                                        {movieGroups.length}
                                    </Badge>
                                </h2>
                            </div>

                            {movieGroups.length === 0 ? (
                                <Card className="border-border/50 bg-card/30 p-8 text-center backdrop-blur-sm">
                                    <span className="text-4xl block mb-4">🗓️</span>
                                    <h3 className="text-lg font-semibold">Aucune séance aujourd'hui</h3>
                                    <p className="text-muted-foreground">Essayez une autre date ou un autre cinéma.</p>
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
                                                        href={group.cinema.allocineUrl}
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
                                                <Separator className="bg-white/5" />
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

function MapPin({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}
