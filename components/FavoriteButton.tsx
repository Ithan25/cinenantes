"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { FavoriteType } from "@/lib/types";

interface FavoriteButtonProps {
    id: string;
    type: FavoriteType;
    name: string;
    size?: "sm" | "default" | "lg" | "icon";
    variant?: "ghost" | "outline";
    className?: string;
}

export default function FavoriteButton({
    id,
    type,
    name,
    size = "icon",
    variant = "ghost",
    className = "",
}: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
    const active = isLoaded && isFavorite(id, type);

    return (
        <Button
            variant={variant}
            size={size}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(id, type, name);
            }}
            className={`transition-all duration-300 ${active
                    ? "text-red-500 hover:text-red-400"
                    : "text-muted-foreground hover:text-red-400"
                } ${className}`}
            aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
            <Heart
                className={`h-4 w-4 transition-all duration-300 ${active ? "fill-current scale-110" : "scale-100"
                    }`}
            />
        </Button>
    );
}
