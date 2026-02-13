"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

function getToday(): string {
    return new Date().toISOString().split("T")[0];
}

interface FilterState {
    date: string;
    search: string;
    cinema: string | null;
}

const DEFAULT_STATE: FilterState = { date: getToday(), search: "", cinema: null };

export function usePersistedFilters(page: string) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize state with defaults content to match server rendering
    // Real values will be synced from URL in useEffect
    const [selectedDate, setSelectedDate] = useState(DEFAULT_STATE.date);
    const [searchQuery, setSearchQuery] = useState(DEFAULT_STATE.search);
    const [selectedCinema, setSelectedCinema] = useState<string | null>(DEFAULT_STATE.cinema);
    const [isInitialized, setIsInitialized] = useState(false);

    // Sync state from URL params on mount and when params change
    useEffect(() => {
        // value 'reload' is standardized but checking for it safely

        const date = searchParams.get("date") || DEFAULT_STATE.date;
        const q = searchParams.get("q") || DEFAULT_STATE.search;
        const cinema = searchParams.get("cinema") || DEFAULT_STATE.cinema;

        setSelectedDate(date);
        setSearchQuery(q);
        setSelectedCinema(cinema);
        setIsInitialized(true);
    }, [searchParams, pathname, router, isInitialized]);

    // Update URL when filters change (wrapper functions to expose similar API)
    const updateURL = useCallback(
        (newDate: string, newQuery: string, newCinema: string | null) => {
            const params = new URLSearchParams();
            if (newDate && newDate !== getToday()) params.set("date", newDate);
            if (newQuery) params.set("q", newQuery);
            if (newCinema) params.set("cinema", newCinema);

            // Only update if changed to avoid loops
            const currentString = searchParams.toString();
            const newString = params.toString();

            if (currentString !== newString) {
                router.push(newString ? `${pathname}?${newString}` : pathname, { scroll: false });
            }
        },
        [pathname, router, searchParams]
    );

    const handleSetSelectedDate = (date: string) => {
        setSelectedDate(date);
        updateURL(date, searchQuery, selectedCinema);
    };

    const handleSetSearchQuery = (q: string) => {
        setSearchQuery(q);
        updateURL(selectedDate, q, selectedCinema);
    };

    const handleSetSelectedCinema = (cinema: string | null) => {
        setSelectedCinema(cinema);
        updateURL(selectedDate, searchQuery, cinema);
    };

    return {
        selectedDate,
        setSelectedDate: handleSetSelectedDate,
        searchQuery,
        setSearchQuery: handleSetSearchQuery,
        selectedCinema,
        setSelectedCinema: handleSetSelectedCinema,
        isInitialized,
    };
}
