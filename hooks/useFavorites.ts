"use client";

import { useState, useEffect, useCallback } from "react";
import { Favorite, FavoriteType } from "@/lib/types";

const STORAGE_KEY = "cinenantes-favorites";
const FAVORITES_UPDATED_EVENT = "favorites-updated";

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
    // Dispatch event for other hooks in the same window
    window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
}

export function useFavorites() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadFavorites = useCallback(() => {
        setFavorites(getFavoritesFromStorage());
        setIsLoaded(true);
    }, []);

    // Initial load and sync listener
    useEffect(() => {
        loadFavorites();

        const handleStorageChange = () => {
            loadFavorites();
        };

        // Listen for updates from other hook instances in the same window
        window.addEventListener(FAVORITES_UPDATED_EVENT, handleStorageChange);
        // Listen for updates from other tabs
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener(FAVORITES_UPDATED_EVENT, handleStorageChange);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [loadFavorites]);

    const addFavorite = useCallback(
        (id: string, type: FavoriteType, name: string, metadata: any = {}) => {
            const currentFavorites = getFavoritesFromStorage();
            const exists = currentFavorites.some((f) => f.id === id && f.type === type);
            if (exists) return;

            const newFavs = [
                ...currentFavorites,
                { id, type, name, addedAt: new Date().toISOString(), ...metadata },
            ];
            saveFavoritesToStorage(newFavs);
        },
        []
    );

    const removeFavorite = useCallback((id: string, type: FavoriteType) => {
        const currentFavorites = getFavoritesFromStorage();
        const newFavs = currentFavorites.filter(
            (f) => !(f.id === id && f.type === type)
        );
        saveFavoritesToStorage(newFavs);
    }, []);

    const toggleFavorite = useCallback(
        (id: string, type: FavoriteType, name: string, metadata: any = {}) => {
            const currentFavorites = getFavoritesFromStorage();
            const exists = currentFavorites.some((f) => f.id === id && f.type === type);

            if (exists) {
                const newFavs = currentFavorites.filter(
                    (f) => !(f.id === id && f.type === type)
                );
                saveFavoritesToStorage(newFavs);
            } else {
                const newFavs = [
                    ...currentFavorites,
                    { id, type, name, addedAt: new Date().toISOString(), ...metadata },
                ];
                saveFavoritesToStorage(newFavs);
            }
        },
        []
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
