"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    MapPin,
    Monitor,
    ArrowLeft,
    ExternalLink,
    Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import MovieCard from "@/components/MovieCard";
import FavoriteButton from "@/components/FavoriteButton";
import ShowtimesList from "@/components/ShowtimesList";
import { useShowtimes } from "@/hooks/useShowtimes";
import { getCinemaById } from "@/lib/cinemas";

const TYPE_LABELS: Record<string, string> = {
    multiplexe: "Multiplexe",
    "art-essai": "Art & Essai",
    independant: "Indépendant",
};

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

export default function CinemaDetailPage() {
    const params = useParams();
    const cinemaId = params.id as string;
    const cinema = getCinemaById(cinemaId);
    const [selectedDate, setSelectedDate] = useState(getToday());

    const { groups, isLoading } = useShowtimes({
        cinemaId,
        date: selectedDate,
    });

    if (!cinema) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 text-center">
                <span className="text-5xl">🎬</span>
                <h1 className="text-2xl font-bold mt-4">Cinéma non trouvé</h1>
                <p className="text-muted-foreground mt-2">
                    Ce cinéma n&apos;existe pas dans notre base de données.
                </p>
                <Link href="/cinemas" className="mt-4 inline-block">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Retour aux cinémas
                    </Button>
                </Link>
            </div>
        );
    }

    // Date options
    const dateOptions = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const value = d.toISOString().split("T")[0];
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

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            {/* Back button */}
            <Link href="/cinemas">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour aux cinémas
                </Button>
            </Link>

            {/* Cinema header */}
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card/80 p-6 sm:p-8">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

                <div className="relative flex flex-col sm:flex-row items-start gap-6">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
                                {cinema.name}
                            </h1>
                            <FavoriteButton
                                id={cinema.id}
                                type="cinema"
                                name={cinema.name}
                                size="default"
                                variant="outline"
                                className="shrink-0"
                            />
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0" />
                            <span>
                                {cinema.address}, {cinema.postalCode} {cinema.city}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Badge
                                variant="outline"
                                className="border-primary/30 text-primary"
                            >
                                {TYPE_LABELS[cinema.type]}
                            </Badge>
                            {cinema.screens && (
                                <Badge variant="outline" className="gap-1">
                                    <Monitor className="h-3 w-3" />
                                    {cinema.screens} salle{cinema.screens > 1 ? "s" : ""}
                                </Badge>
                            )}
                            <a
                                href={cinema.allocineUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Badge
                                    variant="outline"
                                    className="gap-1 cursor-pointer hover:bg-accent/50 text-muted-foreground"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Allociné
                                </Badge>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Date selector */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
                {dateOptions.map((d) => (
                    <Button
                        key={d.value}
                        variant={selectedDate === d.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDate(d.value)}
                        className={`whitespace-nowrap text-xs shrink-0 ${selectedDate === d.value
                                ? "bg-primary/20 text-primary border-primary/40 neon-border hover:bg-primary/30"
                                : "border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
                            }`}
                    >
                        {d.label}
                    </Button>
                ))}
            </div>

            {/* Showtimes */}
            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Séances
                    {!isLoading && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                            {groups.length} film{groups.length > 1 ? "s" : ""}
                        </Badge>
                    )}
                </h2>

                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden border-border/50 bg-card/80">
                                <Skeleton className="aspect-[2/3] w-full shimmer" />
                                <CardContent className="p-3 space-y-2">
                                    <Skeleton className="h-4 w-3/4 shimmer" />
                                    <Skeleton className="h-3 w-1/2 shimmer" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <Card className="border-border/50 bg-card/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <span className="text-5xl mb-4">📽️</span>
                            <h3 className="font-semibold text-lg mb-1">
                                Aucune séance disponible
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Les séances ne sont pas encore disponibles pour cette date.
                                Essayez une autre date ou vérifiez directement sur le site du cinéma.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Grid view */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {groups.map((group) => (
                                <MovieCard
                                    key={group.movie.id}
                                    movie={group.movie}
                                    showtimes={group.showtimes}
                                />
                            ))}
                        </div>

                        {/* Detailed list view */}
                        <Separator className="my-6" />
                        <h3 className="text-lg font-semibold mb-4">Détail des séances</h3>
                        <div className="space-y-4">
                            {groups.map((group) => (
                                <Card
                                    key={group.movie.id}
                                    className="border-border/50 bg-card/80"
                                >
                                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                                        {/* Mini poster */}
                                        <div className="w-16 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                                            {group.movie.posterUrl ? (
                                                <img
                                                    src={group.movie.posterUrl}
                                                    alt={group.movie.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-xl">
                                                    🎬
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <Link
                                                href={`/films/${group.movie.id}`}
                                                className="font-semibold hover:text-primary transition-colors"
                                            >
                                                {group.movie.title}
                                            </Link>
                                            {group.movie.duration && (
                                                <p className="text-xs text-muted-foreground">
                                                    {group.movie.duration}
                                                    {group.movie.genres && group.movie.genres.length > 0 && (
                                                        <> · {group.movie.genres.slice(0, 3).join(", ")}</>
                                                    )}
                                                </p>
                                            )}
                                            <ShowtimesList showtimes={group.showtimes} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
