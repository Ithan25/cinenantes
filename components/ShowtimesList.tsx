"use client";

import { Badge } from "@/components/ui/badge";
import { Showtime } from "@/lib/types";

interface ShowtimesListProps {
    showtimes: Showtime[];
    compact?: boolean;
}

export default function ShowtimesList({
    showtimes,
    compact = false,
}: ShowtimesListProps) {
    if (showtimes.length === 0) {
        return (
            <p className="text-sm text-muted-foreground italic">
                Aucune séance disponible
            </p>
        );
    }

    // Group by version
    const grouped = showtimes.reduce(
        (acc, st) => {
            const key = st.version || "Standard";
            if (!acc[key]) acc[key] = [];
            acc[key].push(st);
            return acc;
        },
        {} as Record<string, Showtime[]>
    );

    if (compact) {
        return (
            <div className="flex flex-wrap gap-1.5">
                {showtimes.map((st) => (
                    <Badge
                        key={st.id}
                        variant="outline"
                        className="text-xs px-2 py-0.5 border-primary/30 text-primary/90 hover:bg-primary/10 transition-colors cursor-default"
                    >
                        {st.time}
                        {st.version && (
                            <span className="ml-1 text-[10px] text-muted-foreground">
                                {st.version}
                            </span>
                        )}
                        {st.is3D && (
                            <span className="ml-1 text-[10px] text-blue-400">3D</span>
                        )}
                    </Badge>
                ))}
            </div>
        );
    }

    // Sort showtimes by time
    const sortedShowtimes = [...showtimes].sort((a, b) => a.time.localeCompare(b.time));

    return (
        <div className="flex flex-wrap gap-3">
            {sortedShowtimes.map((st) => (
                <Badge
                    key={st.id}
                    variant="outline"
                    className="text-base px-4 py-1.5 border-primary/40 text-primary hover:bg-primary/20 hover:border-primary/80 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all cursor-default group"
                >
                    <span className="font-bold">{st.time}</span>
                    <span className="ml-2 text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
                        {st.version && st.version.includes("VO") ? st.version : "VF"}
                    </span>
                    {st.is3D && (
                        <span className="ml-2 text-xs text-blue-400 font-extrabold drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]">
                            3D
                        </span>
                    )}
                    {st.isIMAX && (
                        <span className="ml-2 text-xs text-amber-300 font-extrabold drop-shadow-[0_0_8px_rgba(252,211,77,0.6)]">
                            IMAX
                        </span>
                    )}
                </Badge>
            ))}
        </div>
    );
}
