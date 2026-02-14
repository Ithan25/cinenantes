"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import { Movie, Showtime } from "@/lib/types";

interface MovieCardProps {
    movie: Movie;
    showtimes?: Showtime[];
    cinemaName?: string;
    showShowtimes?: boolean;
}

export default function MovieCard({
    movie,
    showtimes,
    cinemaName,
    showShowtimes = true,
}: MovieCardProps) {
    return (
        <Link href={`/films/${movie.id}`}>
            <Card className="group card-hover overflow-hidden border-border/50 bg-card/80 hover:border-primary/30 cursor-pointer">
                <div className="relative">
                    {/* Poster */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted group-hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all duration-300">
                        {movie.posterUrl ? (
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
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
                        {movie.rating && (
                            <div className="absolute top-2 left-2 z-10">
                                <Badge
                                    variant="secondary"
                                    className="bg-black/60 backdrop-blur-md text-primary border-primary/20 gap-1 text-[10px] sm:text-xs font-semibold px-1.5 py-0.5"
                                >
                                    <Star className="h-3 w-3 fill-primary text-primary" />
                                    {movie.rating.toFixed(1)}
                                </Badge>
                            </div>
                        )}

                        {/* Favorite button */}
                        <div className="absolute top-2 right-2 z-10">
                            <FavoriteButton
                                id={movie.id}
                                type="movie"
                                name={movie.title}
                                metadata={{
                                    posterUrl: movie.posterUrl,
                                    rating: movie.rating,
                                    genres: movie.genres,
                                    duration: movie.duration,
                                    releaseDate: movie.releaseDate
                                }}
                                className="bg-black/40 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground h-8 w-8"
                            />
                        </div>

                        {/* Title overlay at bottom of poster */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/90 to-transparent">
                            <h3 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-tight drop-shadow-lg">
                                {movie.title}
                            </h3>
                            {movie.genres && movie.genres.length > 0 && (
                                <p className="mt-1 text-xs text-white/70 line-clamp-1 font-medium">
                                    {movie.genres.slice(0, 2).join(" · ")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <CardContent className="p-3 space-y-2">
                    {/* Duration */}
                    {movie.duration && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{movie.duration}</span>
                            {cinemaName && (
                                <span className="hidden sm:inline">
                                    <span className="mx-1">·</span>
                                    <span className="text-primary/80 truncate">{cinemaName}</span>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Showtimes */}
                    {showShowtimes && showtimes && showtimes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {showtimes.slice(0, 3).map((st) => (
                                <Badge
                                    key={st.id}
                                    variant="outline"
                                    className="text-xs px-2 py-0.5 border-primary/30 text-primary/90 hover:bg-primary/10 transition-colors"
                                >
                                    {st.time}
                                    <span className="ml-1 text-[10px] text-muted-foreground font-bold uppercase">
                                        {st.version && st.version.includes("VO") ? st.version : "VF"}
                                    </span>
                                </Badge>
                            ))}
                            {showtimes.length > 3 && (
                                <Badge
                                    variant="outline"
                                    className="text-xs px-2 py-0.5 border-muted-foreground/30 text-muted-foreground"
                                >
                                    +{showtimes.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
