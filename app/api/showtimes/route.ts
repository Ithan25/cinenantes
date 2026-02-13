import { NextRequest, NextResponse } from "next/server";
import { CINEMAS, getCinemaById } from "@/lib/cinemas";
import { scrapeShowtimes, scrapeAllCinemas } from "@/lib/scraper";
import { enrichMovie } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const cinemaId = searchParams.get("cinemaId");
    const dateParam = searchParams.get("date");
    const enrich = searchParams.get("enrich") !== "false";

    // Default to today
    const date =
        dateParam ||
        new Date().toISOString().split("T")[0];

    try {
        let groups;

        if (cinemaId) {
            const cinema = getCinemaById(cinemaId);
            if (!cinema) {
                return NextResponse.json(
                    { error: "Cinéma non trouvé" },
                    { status: 404 }
                );
            }
            groups = await scrapeShowtimes(cinema, date);
        } else {
            groups = await scrapeAllCinemas(CINEMAS, date);
        }

        // Optionally enrich with TMDB data
        if (enrich) {
            const enrichedGroups = await Promise.all(
                groups.map(async (group) => ({
                    ...group,
                    movie: await enrichMovie(group.movie),
                }))
            );
            groups = enrichedGroups;
        }

        // Filter out past showtimes if the date is today
        const today = new Date().toLocaleDateString("en-CA", {
            timeZone: "Europe/Paris",
        }); // YYYY-MM-DD
        if (date === today) {
            const nowParts = new Date()
                .toLocaleTimeString("en-GB", {
                    timeZone: "Europe/Paris",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }); // "HH:MM"

            groups = groups
                .map((group) => ({
                    ...group,
                    showtimes: group.showtimes.filter(
                        (st) => st.time >= nowParts
                    ),
                }))
                .filter((group) => group.showtimes.length > 0);
        }

        return NextResponse.json({
            date,
            count: groups.length,
            groups,
        });
    } catch (error) {
        console.error("API showtimes error:", error);
        return NextResponse.json(
            { error: "Erreur lors de la récupération des séances" },
            { status: 500 }
        );
    }
}
