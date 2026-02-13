"use client";

import { Heart, Film, Building2, Trash2, MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import { useShowtimes } from "@/hooks/useShowtimes";
import { getCinemaById } from "@/lib/cinemas";
import Link from "next/link";
import { Movie, ShowtimeGroup } from "@/lib/types";
import { useState, useEffect, useRef } from "react";

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

const IMAGE_EXTENSIONS = ["webp", "png", "jpg", "jpeg", "avif"];

function CinemaImage({ cinemaId, cinemaName }: { cinemaId: string; cinemaName: string }) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [imgFailed, setImgFailed] = useState(false);
    const extIndexRef = useRef(0);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        extIndexRef.current = 0;
        setImgFailed(false);
        setImgSrc(`/cinemas/${cinemaId}.${IMAGE_EXTENSIONS[0]}`);
    }, [cinemaId]);

    useEffect(() => {
        if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth === 0 && imgSrc) {
            handleImageError();
        }
    });

    const handleImageError = () => {
        const nextIndex = extIndexRef.current + 1;
        if (nextIndex < IMAGE_EXTENSIONS.length) {
            extIndexRef.current = nextIndex;
            setImgSrc(`/cinemas/${cinemaId}.${IMAGE_EXTENSIONS[nextIndex]}`);
        } else {
            setImgFailed(true);
            setImgSrc(null);
        }
    };

    if (!imgSrc || imgFailed) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary/40" />
            </div>
        );
    }

    return (
        <img
            ref={imgRef}
            src={imgSrc}
            alt={cinemaName}
            className="w-full h-full object-cover"
            onError={handleImageError}
        />
    );
}

export default function FavorisPage() {
    const { favorites, isLoaded, removeFavorite, getFavoritesByType } =
        useFavorites();

    // Fetch today's showtimes to get poster URLs for favorite movies
    const { groups } = useShowtimes({ date: getToday() });

    const movieFavorites = getFavoritesByType("movie");
    const cinemaFavorites = getFavoritesByType("cinema");

    // Build a map of movieId -> Movie from showtimes
    const movieDataMap = new Map<string, Movie>();
    groups.forEach((g: ShowtimeGroup) => {
        if (!movieDataMap.has(g.movie.id)) {
            movieDataMap.set(g.movie.id, g.movie);
        }
    });

    // Count showtimes per movie today
    const movieShowtimeCount = new Map<string, number>();
    groups.forEach((g: ShowtimeGroup) => {
        movieShowtimeCount.set(
            g.movie.id,
            (movieShowtimeCount.get(g.movie.id) || 0) + g.showtimes.length
        );
    });

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                    <span className="gradient-text">Mes favoris</span>
                </h1>
                <p className="text-muted-foreground">
                    {isLoaded
                        ? `${favorites.length} favori${favorites.length > 1 ? "s" : ""} enregistré${favorites.length > 1 ? "s" : ""}`
                        : "Chargement..."}
                </p>
            </div>

            {isLoaded && favorites.length === 0 ? (
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Heart className="h-16 w-16 text-muted-foreground/20 mb-4" />
                        <h3 className="font-semibold text-lg mb-1">
                            Aucun favori pour l&apos;instant
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-md mb-6">
                            Ajoutez des films et cinémas à vos favoris en cliquant sur le
                            cœur ❤️ depuis les pages films ou cinémas.
                        </p>
                        <div className="flex gap-3">
                            <Link href="/films">
                                <Button
                                    variant="outline"
                                    className="gap-2 border-border/50 hover:border-primary/30"
                                >
                                    <Film className="h-4 w-4" />
                                    Voir les films
                                </Button>
                            </Link>
                            <Link href="/cinemas">
                                <Button
                                    variant="outline"
                                    className="gap-2 border-border/50 hover:border-primary/30"
                                >
                                    <Building2 className="h-4 w-4" />
                                    Voir les cinémas
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Movie favorites */}
                    {movieFavorites.length > 0 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Film className="h-5 w-5" />
                                </span>
                                Films favoris
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {movieFavorites.length}
                                </Badge>
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                {movieFavorites.map((fav) => {
                                    const movieData = movieDataMap.get(fav.id);
                                    const showtimeCount = movieShowtimeCount.get(fav.id) || 0;
                                    return (
                                        <div key={`movie-${fav.id}`} className="group relative">
                                            <Link href={`/films/${fav.id}`}>
                                                <Card className="overflow-hidden border-border/50 bg-card/80 hover:border-primary/30 transition-all cursor-pointer">
                                                    {/* Poster */}
                                                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                                                        {movieData?.posterUrl ? (
                                                            <img
                                                                src={movieData.posterUrl}
                                                                alt={fav.name}
                                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                                                <span className="text-4xl grayscale opacity-50">🎬</span>
                                                            </div>
                                                        )}
                                                        {/* Gradient overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                                                        {/* Rating badge */}
                                                        {movieData?.rating && (
                                                            <div className="absolute top-2 left-2 z-10">
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-black/60 backdrop-blur-md text-primary border-primary/20 gap-1 text-[10px] sm:text-xs font-semibold px-1.5 py-0.5"
                                                                >
                                                                    <Star className="h-3 w-3 fill-primary text-primary" />
                                                                    {movieData.rating.toFixed(1)}
                                                                </Badge>
                                                            </div>
                                                        )}

                                                        {/* Red heart indicator */}
                                                        <div className="absolute top-2 right-2 z-10">
                                                            <Heart className="h-5 w-5 fill-red-500 text-red-500 drop-shadow-lg" />
                                                        </div>

                                                        {/* Title overlay */}
                                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                                            <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                                                                {fav.name}
                                                            </h3>
                                                            {movieData?.genres && movieData.genres.length > 0 && (
                                                                <p className="mt-0.5 text-[11px] text-white/60 line-clamp-1">
                                                                    {movieData.genres.slice(0, 2).join(" · ")}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Card footer */}
                                                    <CardContent className="p-3 space-y-2">
                                                        {movieData?.duration && (
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{movieData.duration}</span>
                                                            </div>
                                                        )}
                                                        {showtimeCount > 0 && (
                                                            <div className="flex items-center gap-1.5 text-xs text-primary/80">
                                                                <Film className="h-3 w-3" />
                                                                <span>{showtimeCount} séance{showtimeCount > 1 ? "s" : ""} aujourd&apos;hui</span>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    removeFavorite(fav.id, "movie");
                                                }}
                                                className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white/70 hover:text-red-400 hover:bg-black/80"
                                                title="Retirer des favoris"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Cinema favorites */}
                    {cinemaFavorites.length > 0 && (
                        <div className="space-y-5">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="p-2 rounded-lg bg-secondary/10 text-secondary-foreground">
                                    <Building2 className="h-5 w-5" />
                                </span>
                                Cinémas favoris
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {cinemaFavorites.length}
                                </Badge>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {cinemaFavorites.map((fav) => {
                                    const cinema = getCinemaById(fav.id);
                                    // Count today's showtimes for this cinema
                                    const cinemaGroups = groups.filter(
                                        (g: ShowtimeGroup) => g.cinema.id === fav.id
                                    );
                                    const totalShowtimes = cinemaGroups.reduce(
                                        (sum: number, g: ShowtimeGroup) => sum + g.showtimes.length,
                                        0
                                    );

                                    return (
                                        <Card
                                            key={`cinema-${fav.id}`}
                                            className="group overflow-hidden border-border/50 bg-card/80 hover:border-primary/30 transition-all"
                                        >
                                            {/* Cinema image */}
                                            <Link href={`/cinemas/${fav.id}`}>
                                                <div className="relative h-36 overflow-hidden">
                                                    <CinemaImage cinemaId={fav.id} cinemaName={fav.name} />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                                                    {/* Heart indicator */}
                                                    <div className="absolute top-3 right-3">
                                                        <Heart className="h-5 w-5 fill-red-500 text-red-500 drop-shadow-lg" />
                                                    </div>
                                                </div>
                                            </Link>

                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <Link href={`/cinemas/${fav.id}`} className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-base group-hover:text-primary transition-colors truncate">
                                                            {fav.name}
                                                        </h3>
                                                        {cinema && (
                                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                                                <MapPin className="h-3 w-3 shrink-0" />
                                                                <span className="truncate">
                                                                    {cinema.address}, {cinema.city}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </Link>
                                                    <button
                                                        onClick={() => removeFavorite(fav.id, "cinema")}
                                                        className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        title="Retirer des favoris"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-3 pt-1 border-t border-border/50">
                                                    {cinemaGroups.length > 0 ? (
                                                        <>
                                                            <span className="text-xs text-muted-foreground">
                                                                <span className="font-semibold text-foreground">{cinemaGroups.length}</span> film{cinemaGroups.length > 1 ? "s" : ""}
                                                            </span>
                                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                            <span className="text-xs text-muted-foreground">
                                                                <span className="font-semibold text-foreground">{totalShowtimes}</span> séance{totalShowtimes > 1 ? "s" : ""}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">
                                                            Aucune séance aujourd&apos;hui
                                                        </span>
                                                    )}
                                                    <Link href={`/cinemas/${fav.id}`} className="ml-auto">
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary/80 hover:bg-primary/10 gap-1 px-2">
                                                            Voir
                                                            <ArrowRight className="h-3 w-3" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
