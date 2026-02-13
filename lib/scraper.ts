import { Cinema, Movie, Showtime, ShowtimeGroup } from "./types";

// ============================================
// Allociné JSON API Scraper
// ============================================
// Uses the internal JSON endpoint:
//   https://www.allocine.fr/_/showtimes/theater-{id}/d-{date}/p-{page}
// This returns structured data with movies, showtimes, pagination.
// ============================================

const ALLOCINE_BASE = "https://www.allocine.fr/_/showtimes/theater-";

// In-memory server-side cache
interface CacheEntry {
    data: ShowtimeGroup[];
    timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCacheKey(cinemaId: string, date: string): string {
    return `${cinemaId}:${date}`;
}

function getFromCache(key: string): ShowtimeGroup[] | null {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data;
    }
    cache.delete(key);
    return null;
}

function setCache(key: string, data: ShowtimeGroup[]): void {
    cache.set(key, { data, timestamp: Date.now() });
}

// ============================================
// Main scraper function
// ============================================

export async function scrapeShowtimes(
    cinema: Cinema,
    date: string
): Promise<ShowtimeGroup[]> {
    const cacheKey = getCacheKey(cinema.id, date);
    const cached = getFromCache(cacheKey);
    if (cached) {
        console.log(`[cache hit] ${cinema.name} for ${date}`);
        return cached;
    }

    try {
        console.log(`[scraping] ${cinema.name} for ${date} via JSON API`);
        const allGroups: ShowtimeGroup[] = [];
        let page = 1;
        let totalPages = 1;

        while (page <= totalPages) {
            const url = `${ALLOCINE_BASE}${cinema.allocineId}/d-${date}/p-${page}`;
            const response = await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    Accept: "application/json",
                    "Accept-Language": "fr-FR,fr;q=0.9",
                },
                next: { revalidate: 0 },
            });

            if (!response.ok) {
                console.error(
                    `[error] ${cinema.name}: HTTP ${response.status} on page ${page}`
                );
                break;
            }

            const json = await response.json();

            // Update pagination
            if (json.pagination) {
                totalPages = parseInt(json.pagination.totalPages) || 1;
            }

            // Parse results
            if (json.results && Array.isArray(json.results)) {
                for (const result of json.results) {
                    const group = parseResult(result, cinema, date);
                    if (group && group.showtimes.length > 0) {
                        allGroups.push(group);
                    }
                }
            }

            page++;
        }

        console.log(`[done] ${cinema.name}: ${allGroups.length} movies found`);
        setCache(cacheKey, allGroups);
        return allGroups;
    } catch (error) {
        console.error(`[error] ${cinema.name}:`, error);
        return [];
    }
}

// ============================================
// Parse a single result from the JSON API
// ============================================

function parseResult(
    result: Record<string, unknown>,
    cinema: Cinema,
    date: string
): ShowtimeGroup | null {
    const movieData = result.movie as Record<string, unknown> | undefined;
    if (!movieData) return null;

    const title = (movieData.title as string) || "";
    if (!title) return null;

    const internalId = movieData.internalId as number;

    // Poster
    const posterObj = movieData.poster as Record<string, unknown> | undefined;
    const posterUrl = (posterObj?.url as string) || undefined;

    // Synopsis
    const synopsis =
        (movieData.synopsis as string) ||
        stripHtml(movieData.synopsisFull as string) ||
        undefined;

    // Runtime
    const runtime = (movieData.runtime as string) || undefined;

    // Genres
    const genresArr = movieData.genres as Array<Record<string, unknown>> | undefined;
    const genres = genresArr
        ?.map((g) => (g.translate as string) || "")
        .filter(Boolean);

    // Rating (Allociné user rating is on 5, we scale to 10)
    const stats = movieData.stats as Record<string, unknown> | undefined;
    const userRating = stats?.userRating as Record<string, unknown> | undefined;
    const ratingScore = userRating?.score as number | undefined;
    const rating = ratingScore ? Math.round(ratingScore * 20) / 10 : undefined;

    // Release date
    const releases = movieData.releases as Array<Record<string, unknown>> | undefined;
    let releaseDate: string | undefined;
    if (releases && releases.length > 0) {
        const rd = releases[0].releaseDate as Record<string, unknown> | undefined;
        releaseDate = (rd?.date as string) || undefined;
    }

    // Director
    const credits = movieData.credits as Array<Record<string, unknown>> | undefined;
    let director: string | undefined;
    if (credits) {
        for (const credit of credits) {
            const position = credit.position as Record<string, unknown> | undefined;
            if (position?.name === "DIRECTOR") {
                const person = credit.person as Record<string, unknown>;
                director = `${person?.firstName || ""} ${person?.lastName || ""}`.trim();
                break;
            }
        }
    }

    // Cast (actors)
    const castData = movieData.cast as Record<string, unknown> | undefined;
    const castEdges = castData?.edges as Array<Record<string, unknown>> | undefined;
    const cast: string[] = [];
    if (castEdges) {
        for (const edge of castEdges.slice(0, 5)) {
            const node = edge.node as Record<string, unknown>;
            const actor = node?.actor as Record<string, unknown>;
            if (actor) {
                const name = `${actor.firstName || ""} ${actor.lastName || ""}`.trim();
                if (name) cast.push(name);
            }
        }
    }

    const movie: Movie = {
        id: `movie-${internalId}`,
        title,
        allocineId: String(internalId),
        posterUrl,
        synopsis,
        rating,
        genres: genres && genres.length > 0 ? genres : undefined,
        duration: runtime,
        releaseDate,
        director,
        cast: cast.length > 0 ? cast : undefined,
    };

    // Parse showtimes from all version keys
    const showtimesData = result.showtimes as Record<string, unknown[]> | undefined;
    const showtimes: Showtime[] = [];
    const seenIds = new Set<number>();

    if (showtimesData) {
        for (const [key, items] of Object.entries(showtimesData)) {
            if (!Array.isArray(items)) continue;

            for (const item of items) {
                const st = item as Record<string, unknown>;
                const stInternalId = st.internalId as number;

                // Deduplicate by internalId
                if (seenIds.has(stInternalId)) continue;
                seenIds.add(stInternalId);

                const startsAt = st.startsAt as string;
                if (!startsAt) continue;

                // Parse time from "2026-02-14T10:35:00"
                const timePart = startsAt.split("T")[1];
                if (!timePart) continue;
                const formattedTime = timePart.substring(0, 5); // "10:35"

                // Version
                const diffVersion = st.diffusionVersion as string || "";
                let version: Showtime["version"] = "";
                if (diffVersion === "ORIGINAL" || key.includes("original")) {
                    version = "VOST";
                } else if (diffVersion === "LOCAL" || key.includes("local")) {
                    version = "VF";
                }

                // Tags for 3D, IMAX
                const tags = st.tags as string[] || [];
                const experience = st.experience as string[] || [];
                const tagsStr = [...tags, ...experience].join(" ").toUpperCase();
                const is3D = tagsStr.includes("3D");
                const isIMAX = tagsStr.includes("IMAX");

                // Screen format
                let screenFormat: string | undefined;
                if (tagsStr.includes("DOLBYCINEMA") || tagsStr.includes("DOLBY_CINEMA")) {
                    screenFormat = "Dolby Cinema";
                } else if (isIMAX) {
                    screenFormat = "IMAX";
                } else if (tagsStr.includes("4DX")) {
                    screenFormat = "4DX";
                }

                showtimes.push({
                    id: `st-${stInternalId}`,
                    time: formattedTime,
                    version,
                    is3D,
                    isIMAX,
                    screenFormat,
                });
            }
        }
    }

    // Sort by time
    showtimes.sort((a, b) => a.time.localeCompare(b.time));

    return {
        movie,
        cinema,
        date,
        showtimes,
    };
}

// ============================================
// Utility
// ============================================

function stripHtml(html: string | undefined): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
}

// ============================================
// Scrape all cinemas
// ============================================

export async function scrapeAllCinemas(
    cinemas: Cinema[],
    date: string
): Promise<ShowtimeGroup[]> {
    const CONCURRENCY = 3;
    const allGroups: ShowtimeGroup[] = [];

    for (let i = 0; i < cinemas.length; i += CONCURRENCY) {
        const batch = cinemas.slice(i, i + CONCURRENCY);
        const results = await Promise.allSettled(
            batch.map((cinema) => scrapeShowtimes(cinema, date))
        );

        for (const result of results) {
            if (result.status === "fulfilled") {
                allGroups.push(...result.value);
            }
        }

        // Small delay between batches
        if (i + CONCURRENCY < cinemas.length) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }

    return allGroups;
}
