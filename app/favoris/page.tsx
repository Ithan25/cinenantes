"use client";

import { Heart, Film, Building2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useFavorites } from "@/hooks/useFavorites";
import Link from "next/link";

export default function FavorisPage() {
    const { favorites, isLoaded, removeFavorite, getFavoritesByType } =
        useFavorites();

    const movieFavorites = getFavoritesByType("movie");
    const cinemaFavorites = getFavoritesByType("cinema");

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Heart className="h-8 w-8 text-red-500" />
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
                    {/* Cinema favorites */}
                    {cinemaFavorites.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                Cinémas favoris
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {cinemaFavorites.length}
                                </Badge>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {cinemaFavorites.map((fav) => (
                                    <Card
                                        key={`cinema-${fav.id}`}
                                        className="border-border/50 bg-card/80 hover:border-primary/30 transition-all"
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <Link
                                                href={`/cinemas/${fav.id}`}
                                                className="flex-1 min-w-0"
                                            >
                                                <h3 className="font-medium text-sm hover:text-primary transition-colors truncate">
                                                    {fav.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Ajouté le{" "}
                                                    {new Date(fav.addedAt).toLocaleDateString("fr-FR")}
                                                </p>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 text-muted-foreground hover:text-red-400"
                                                onClick={() => removeFavorite(fav.id, "cinema")}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {cinemaFavorites.length > 0 && movieFavorites.length > 0 && (
                        <Separator />
                    )}

                    {/* Movie favorites */}
                    {movieFavorites.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Film className="h-5 w-5 text-primary" />
                                Films favoris
                                <Badge variant="secondary" className="ml-1 text-xs">
                                    {movieFavorites.length}
                                </Badge>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {movieFavorites.map((fav) => (
                                    <Card
                                        key={`movie-${fav.id}`}
                                        className="border-border/50 bg-card/80 hover:border-primary/30 transition-all"
                                    >
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <Link
                                                href={`/films/${fav.id}`}
                                                className="flex-1 min-w-0"
                                            >
                                                <h3 className="font-medium text-sm hover:text-primary transition-colors truncate">
                                                    {fav.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Ajouté le{" "}
                                                    {new Date(fav.addedAt).toLocaleDateString("fr-FR")}
                                                </p>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 text-muted-foreground hover:text-red-400"
                                                onClick={() => removeFavorite(fav.id, "movie")}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
