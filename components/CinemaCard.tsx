"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Monitor, Film } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import { Cinema } from "@/lib/types";

interface CinemaCardProps {
    cinema: Cinema;
    showtimeCount?: number;
    movieCount?: number;
}

const TYPE_LABELS: Record<Cinema["type"], string> = {
    multiplexe: "Multiplexe",
    "art-essai": "Art & Essai",
    independant: "Indépendant",
};

const TYPE_COLORS: Record<Cinema["type"], string> = {
    multiplexe: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    "art-essai": "border-purple-500/30 text-purple-400 bg-purple-500/10",
    independant: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
};

export default function CinemaCard({
    cinema,
    showtimeCount,
    movieCount,
}: CinemaCardProps) {
    return (
        <Link href={`/cinemas/${cinema.id}`}>
            <Card className="group card-hover border-border/50 bg-card/80 hover:border-primary/30 cursor-pointer overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />

                <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                                {cinema.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                    {cinema.address}, {cinema.city}
                                </span>
                            </div>
                        </div>
                        <FavoriteButton
                            id={cinema.id}
                            type="cinema"
                            name={cinema.name}
                            className="shrink-0"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                            variant="outline"
                            className={`text-xs ${TYPE_COLORS[cinema.type]}`}
                        >
                            {TYPE_LABELS[cinema.type]}
                        </Badge>
                        {cinema.screens && (
                            <Badge
                                variant="outline"
                                className="text-xs border-border text-muted-foreground gap-1"
                            >
                                <Monitor className="h-3 w-3" />
                                {cinema.screens} salle{cinema.screens > 1 ? "s" : ""}
                            </Badge>
                        )}
                    </div>

                    {(showtimeCount !== undefined || movieCount !== undefined) && (
                        <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground border-t border-border/50">
                            {movieCount !== undefined && (
                                <div className="flex items-center gap-1.5">
                                    <Film className="h-3 w-3 text-primary/70" />
                                    <span>
                                        {movieCount} film{movieCount > 1 ? "s" : ""}
                                    </span>
                                </div>
                            )}
                            {showtimeCount !== undefined && (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-primary/70">🎬</span>
                                    <span>
                                        {showtimeCount} séance{showtimeCount > 1 ? "s" : ""}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
