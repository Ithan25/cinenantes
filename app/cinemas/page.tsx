import { Metadata } from "next";
import { Building2 } from "lucide-react";
import { CINEMAS } from "@/lib/cinemas";
import CinemaCard from "@/components/CinemaCard";

export const metadata: Metadata = {
    title: "Cinémas — CinéNantes",
    description: "Tous les cinémas de Nantes et périphérie : Pathé, Katorza, Cinématographe, Concorde, UGC et plus.",
};

export default function CinemasPage() {
    const nantes = CINEMAS.filter((c) => c.city === "Nantes");
    const peripherie = CINEMAS.filter((c) => c.city !== "Nantes");

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-primary" />
                    <span className="gradient-text">Tous les cinémas</span>
                </h1>
                <p className="text-muted-foreground">
                    {CINEMAS.length} cinémas répertoriés à Nantes et en périphérie
                </p>
            </div>

            {/* Nantes */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    Nantes
                    <span className="text-sm font-normal text-muted-foreground">
                        ({nantes.length} cinéma{nantes.length > 1 ? "s" : ""})
                    </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nantes.map((cinema) => (
                        <CinemaCard key={cinema.id} cinema={cinema} />
                    ))}
                </div>
            </div>

            {/* Périphérie */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-400"></span>
                    Périphérie
                    <span className="text-sm font-normal text-muted-foreground">
                        ({peripherie.length} cinéma{peripherie.length > 1 ? "s" : ""})
                    </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {peripherie.map((cinema) => (
                        <CinemaCard key={cinema.id} cinema={cinema} />
                    ))}
                </div>
            </div>
        </div>
    );
}
