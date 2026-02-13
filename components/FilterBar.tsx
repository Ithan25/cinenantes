"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cinema } from "@/lib/types";
import { CINEMAS } from "@/lib/cinemas";
import { formatDate } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCinema: string | null;
    onCinemaChange: (cinemaId: string | null) => void;
    selectedDate: string;
    onDateChange: (date: string) => void;
    cinemas?: Cinema[];
}

export default function FilterBar({
    searchQuery,
    onSearchChange,
    selectedCinema,
    onCinemaChange,
    selectedDate,
    onDateChange,
    cinemas = CINEMAS,
}: FilterBarProps) {
    const [showFilters, setShowFilters] = useState(false);

    // Local state for search input to avoid lag on each keystroke
    const [localSearch, setLocalSearch] = useState(searchQuery);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Sync local search when prop changes (e.g. back navigation restoring URL)
    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    const handleLocalSearchChange = (value: string) => {
        setLocalSearch(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSearchChange(value);
        }, 300);
    };

    const handleClearSearch = () => {
        setLocalSearch("");
        clearTimeout(debounceRef.current);
        onSearchChange("");
    };



    // ...

    // Generate date options (today + next 6 days)
    const dateOptions = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const value = formatDate(d);
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
        <div className="space-y-3 md:space-y-4 bg-card/40 backdrop-blur-md border border-border/50 p-3 md:p-4 rounded-xl shadow-sm">
            {/* Search + filter toggle */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Rechercher un film, un cinéma..."
                        value={localSearch}
                        onChange={(e) => handleLocalSearchChange(e.target.value)}
                        className="pl-11 h-12 text-base bg-background/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-lg"
                    />
                    {localSearch && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-12 w-12 border-white/10 ${showFilters ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(251,191,36,0.15)]" : "hover:bg-white/5"}`}
                >
                    <SlidersHorizontal className="h-5 w-5" />
                </Button>
            </div>

            {/* Date selector */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {dateOptions.map((d) => (
                    <Button
                        key={d.value}
                        variant={selectedDate === d.value ? "default" : "outline"}
                        size="default"
                        onClick={() => onDateChange(d.value)}
                        className={`whitespace-nowrap flex-shrink-0 rounded-full px-5 h-10 ${selectedDate === d.value
                            ? "bg-primary text-primary-foreground font-semibold shadow-[0_0_15px_rgba(251,191,36,0.25)] hover:bg-primary/90"
                            : "border-white/10 bg-white/5 hover:bg-white/10 hover:text-foreground hover:border-white/20"
                            }`}
                    >
                        {d.label}
                    </Button>
                ))}
            </div>

            {/* Cinema filter (expandable) */}
            {showFilters && (
                <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-muted-foreground">Filtrer par cinéma</span>
                        {selectedCinema && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCinemaChange(null)}
                                className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                            >
                                Effacer
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {cinemas.map((cinema) => (
                            <Badge
                                key={cinema.id}
                                variant="outline"
                                className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${selectedCinema === cinema.id
                                    ? "bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(251,191,36,0.15)]"
                                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/20"
                                    }`}
                                onClick={() =>
                                    onCinemaChange(
                                        selectedCinema === cinema.id ? null : cinema.id
                                    )
                                }
                            >
                                {cinema.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
