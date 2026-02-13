"use client";

import { useState, useEffect, useCallback } from "react";
import { ShowtimeGroup } from "@/lib/types";

interface UseShowtimesOptions {
    cinemaId?: string;
    date?: string;
    enrich?: boolean;
}

interface UseShowtimesResult {
    groups: ShowtimeGroup[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

const CACHE_KEY_PREFIX = "cinenantes-cache-showtimes-v1";
const CACHE_TTL = 3 * 60 * 60 * 1000; // 3 hours

export function useShowtimes(
    options: UseShowtimesOptions = {}
): UseShowtimesResult {
    const [groups, setGroups] = useState<ShowtimeGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { cinemaId, date, enrich = true } = options;

    const fetchData = useCallback(
        async (forceRefresh = false) => {
            setError(null);

            const cacheKey = `${CACHE_KEY_PREFIX}-${cinemaId || "all"}-${date || "today"}-${enrich}`;

            // Try to load from cache first
            let cachedDataLoaded = false;
            if (!forceRefresh) {
                try {
                    const cached = localStorage.getItem(cacheKey);
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        if (Date.now() - parsed.timestamp < CACHE_TTL) {
                            setGroups(parsed.data);
                            setIsLoading(false);
                            cachedDataLoaded = true;
                            // Even if cached, we might want to refetch if almost expired? 
                            // For now, simple TTL is enough.
                            return;
                        }
                    }
                } catch (e) {
                    console.warn("Error reading cache", e);
                }
            }

            if (!cachedDataLoaded) {
                setIsLoading(true);
            }

            try {
                const params = new URLSearchParams();
                if (cinemaId) params.set("cinemaId", cinemaId);
                if (date) params.set("date", date);
                if (!enrich) params.set("enrich", "false");

                const response = await fetch(`/api/showtimes?${params.toString()}`);

                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des séances");
                }

                const data = await response.json();
                const fetchedGroups = data.groups || [];
                setGroups(fetchedGroups);

                try {
                    localStorage.setItem(
                        cacheKey,
                        JSON.stringify({
                            timestamp: Date.now(),
                            data: fetchedGroups,
                        })
                    );
                } catch (e) {
                    console.warn("Error setting cache", e);
                }
            } catch (err) {
                console.error(err);
                setError(
                    err instanceof Error ? err.message : "Une erreur est survenue"
                );
                // If fetch failed, try to fallback to stale cache if available
                if (!cachedDataLoaded) {
                    try {
                        const cached = localStorage.getItem(cacheKey);
                        if (cached) {
                            const parsed = JSON.parse(cached);
                            setGroups(parsed.data);
                            setError(null); // Clear error if we have stale data
                        }
                    } catch {
                        // ignore
                    }
                }
            } finally {
                setIsLoading(false);
            }
        },
        [cinemaId, date, enrich]
    );

    useEffect(() => {
        // Initial fetch
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cinemaId, date, enrich]); // Depend on options, not fetchData itself to avoid loops if useCallback dependency is wrong

    return { groups, isLoading, error, refetch: () => fetchData(true) };
}
