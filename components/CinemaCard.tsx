"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Monitor, Film, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const IMAGE_EXTENSIONS = ["webp", "png", "jpg", "jpeg", "avif"];

export default function CinemaCard({
    cinema,
    showtimeCount,
    movieCount,
}: CinemaCardProps) {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [imgFailed, setImgFailed] = useState(false);
    const extIndexRef = useRef(0);
    const imgRef = useRef<HTMLImageElement>(null);

    // Client-only image probing to avoid SSR hydration mismatch
    useEffect(() => {
        extIndexRef.current = 0;
        setImgFailed(false);
        setImgSrc(`/cinemas/${cinema.id}.${IMAGE_EXTENSIONS[0]}`);
    }, [cinema.id]);

    // Check if image was already broken on mount (hydration edge case)
    useEffect(() => {
        if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth === 0 && imgSrc) {
            handleImageError();
        }
    });

    const handleImageError = () => {
        const nextIndex = extIndexRef.current + 1;
        if (nextIndex < IMAGE_EXTENSIONS.length) {
            extIndexRef.current = nextIndex;
            setImgSrc(`/cinemas/${cinema.id}.${IMAGE_EXTENSIONS[nextIndex]}`);
        } else {
            setImgFailed(true);
            setImgSrc(null);
        }
    };

    const externalUrl = cinema.websiteUrl || cinema.allocineUrl;

    return (
        <Card className="group card-hover border-border/50 bg-card/80 hover:border-primary/30 cursor-pointer overflow-hidden">
            {/* Cinema image or accent bar — clickable */}
            <Link href={`/cinemas/${cinema.id}`}>
                <div className="relative">
                    {imgSrc && !imgFailed ? (
                        <img
                            ref={imgRef}
                            src={imgSrc}
                            alt={cinema.name}
                            className="w-full h-32 object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
                            onError={handleImageError}
                        />
                    ) : (
                        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
                    )}
                    {imgSrc && !imgFailed && (
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                    )}
                </div>
            </Link>

            <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <Link href={`/cinemas/${cinema.id}`} className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                            {cinema.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                                {cinema.address}, {cinema.city}
                            </span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                        {externalUrl && (
                            <a
                                href={externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                title="Voir le site du cinéma"
                            >
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                            </a>
                        )}
                        <FavoriteButton
                            id={cinema.id}
                            type="cinema"
                            name={cinema.name}
                            className="shrink-0"
                        />
                    </div>
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
    );
}
