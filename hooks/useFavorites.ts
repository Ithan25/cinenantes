"use client";

import { useState, useEffect, useCallback } from "react";
import { Favorite, FavoriteType } from "@/lib/types";

const STORAGE_KEY = "cinenantes-favorites";

function getFavoritesFromStorage(): Favorite[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveFavoritesToStorage(favorites: Favorite[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function useFavorites() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setFavorites(getFavoritesFromStorage());
        setIsLoaded(true);
    }, []);

    const addFavorite = useCallback(
        (id: string, type: FavoriteType, name: string) => {
            setFavorites((prev) => {
                const exists = prev.some((f) => f.id === id && f.type === type);
                if (exists) return prev;
                const newFavs = [
                    ...prev,
                    { id, type, name, addedAt: new Date().toISOString() },
                ];
                saveFavoritesToStorage(newFavs);
                return newFavs;
            });
        },
        []
    );

    const removeFavorite = useCallback((id: string, type: FavoriteType) => {
        setFavorites((prev) => {
            const newFavs = prev.filter(
                (f) => !(f.id === id && f.type === type)
            );
            saveFavoritesToStorage(newFavs);
            return newFavs;
        });
    }, []);

    const toggleFavorite = useCallback(
        (id: string, type: FavoriteType, name: string) => {
            const exists = favorites.some((f) => f.id === id && f.type === type);
            if (exists) {
                removeFavorite(id, type);
            } else {
                addFavorite(id, type, name);
            }
        },
        [favorites, addFavorite, removeFavorite]
    );

    const isFavorite = useCallback(
        (id: string, type: FavoriteType): boolean => {
            return favorites.some((f) => f.id === id && f.type === type);
        },
        [favorites]
    );

    const getFavoritesByType = useCallback(
        (type: FavoriteType): Favorite[] => {
            return favorites.filter((f) => f.type === type);
        },
        [favorites]
    );

    return {
        favorites,
        isLoaded,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        getFavoritesByType,
    };
}
