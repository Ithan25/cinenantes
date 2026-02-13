import * as cheerio from "cheerio";
import { Cinema, Movie, Showtime, ShowtimeGroup } from "./types";

// ============================================
// In-memory cache
// ============================================
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
    // Disable cache reading
    return null;
}

function setCache(key: string, data: ShowtimeGroup[]): void {
    cache.set(key, { data, timestamp: Date.now() });
}

// ============================================
// Scraper
// ============================================

function generateId(): string {
    return Math.random().toString(36).substring(2, 10);
}

function formatDateForAllocine(date: string): string {
    // date is "YYYY-MM-DD", Allociné uses "YYYY-MM-DD"
    return date;
}

export async function scrapeShowtimes(
    cinema: Cinema,
    date: string
): Promise<ShowtimeGroup[]> {
    const cacheKey = getCacheKey(cinema.id, date);
    // const cached = getFromCache(cacheKey); // Cache disabled
    // if (cached) {
    //     return cached;
    // }

    try {
        const dateParam = formatDateForAllocine(date);
        console.log(`Scraping ${cinema.name} for date ${dateParam}`);

        // Try 'date' param
        const url = `https://www.allocine.fr/seance/salle_gen_csalle=${cinema.allocineId}.html?date=${dateParam}`;

        const response = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            },
            next: { revalidate: 0 }, // Disable Next.js cache
        });

        if (!response.ok) {
            console.error(
                `Failed to fetch showtimes for ${cinema.name}: ${response.status}`
            );
            return [];
        }

        const html = await response.text();
        const groups = parseShowtimesHTML(html, cinema, date);
        console.log(`Found ${groups.length} movies for ${cinema.name}`);

        setCache(cacheKey, groups);
        return groups;
    } catch (error) {
        console.error(`Error scraping ${cinema.name}:`, error);
        return [];
    }
}

function parseShowtimesHTML(
    html: string,
    cinema: Cinema,
    date: string
): ShowtimeGroup[] {
    const $ = cheerio.load(html);
    const moviesMap = new Map<string, ShowtimeGroup>();

    // Allociné structure: each movie is in a card/section
    // Look for movie cards in the showtimes page
    $(".card.entity-card, .showtimes-list-holder .item, .hred, .js-showtimes-movie-card, [class*='movieShowtime'], .movie-card-showtimes").each(
        (_i, movieSection) => {
            const $section = $(movieSection);

            // Extract movie title
            const titleEl =
                $section.find(".meta-title a, .meta-title-link, h2 a, .title a, a.meta-title-link").first();
            const movieTitle = titleEl.text().trim();

            if (!movieTitle) return;

            // Extract Allociné movie ID from URL
            const movieHref = titleEl.attr("href") || "";
            const movieIdMatch = movieHref.match(
                /fichefilm_gen_cfilm=(\d+)|\/film\/(\d+)/
            );
            const allocineMovieId = movieIdMatch
                ? movieIdMatch[1] || movieIdMatch[2]
                : generateId();

            // Extract poster URL
            const posterImg = $section.find("img.thumbnail-img, img[data-src], img").first();
            const rawPosterUrl =
                posterImg.attr("data-src") ||
                posterImg.attr("src") ||
                "";

            // Allociné thumbnail URLs often contain /c_160_213/ or /r_160_213/
            // removing this part yields the high-res image
            const posterUrl = rawPosterUrl.replace(/\/c_\d+_\d+\/|\/r_\d+_\d+\//, "/");

            // Extract movie metadata
            const metaText = $section.find(".meta-body-item, .dark-grey-link, .meta-body").text();
            const durationMatch = metaText.match(/(\d+h\s*\d*min?|\d+h|\d+\s*min)/);
            const duration = durationMatch ? durationMatch[0].trim() : undefined;

            // Extract genres
            const genreEls = $section.find(
                '.meta-body-item:contains("Genre") .dark-grey-link, .badge, .meta-body-info span'
            );
            const genres: string[] = [];
            genreEls.each((_j, el) => {
                const g = $(el).text().trim();
                if (g && g.length < 30) genres.push(g);
            });

            // Extract director
            const directorEl = $section.find(
                '.meta-body-item:contains("De") .dark-grey-link, .light-blue-link'
            ).first();
            const director = directorEl.text().trim() || undefined;

            const movie: Movie = {
                id: `movie-${allocineMovieId}`,
                title: movieTitle,
                allocineId: allocineMovieId,
                posterUrl: posterUrl || undefined,
                duration,
                genres: genres.length > 0 ? genres : undefined,
                director,
            };

            // Extract showtimes
            const showtimes: Showtime[] = [];

            $section
                .find(
                    ".showtimes-hour-item, .showtimes-version .text, .times .text, span.showtimes-hour-item-value, .showtime-tags .tag, [class*='showtime'] .text, [data-times]"
                )
                .each((_j, timeEl) => {
                    const $time = $(timeEl);
                    const timeText = $time.text().trim();

                    // Match time format "14:30" or "14h30"
                    const timeMatch = timeText.match(/(\d{1,2})[h:](\d{2})/);
                    if (!timeMatch) return;

                    const formattedTime = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;

                    // Detect version (VF, VOST, VO)
                    const parentText = $time
                        .closest(".showtimes-version, .showtimes-format, .version-holder, [class*='version']")
                        .text()
                        .toUpperCase();
                    let version: Showtime["version"] = "";
                    if (parentText.includes("VOST")) version = "VOST";
                    else if (parentText.includes("VO")) version = "VO";
                    else if (parentText.includes("VF")) version = "VF";

                    // Detect 3D and IMAX
                    const formatText = $time
                        .closest(".showtimes-format, [class*='format'], [class*='version']")
                        .text()
                        .toUpperCase();
                    const is3D = formatText.includes("3D");
                    const isIMAX = formatText.includes("IMAX");

                    showtimes.push({
                        id: `st-${generateId()}`,
                        time: formattedTime,
                        version,
                        is3D,
                        isIMAX,
                    });
                });

            // If no showtimes found with specific selectors, try generic time patterns
            if (showtimes.length === 0) {
                const sectionText = $section.text();
                const timeRegex = /(\d{1,2})[h:](\d{2})/g;
                let match;
                const seenTimes = new Set<string>();

                while ((match = timeRegex.exec(sectionText)) !== null) {
                    const formattedTime = `${match[1].padStart(2, "0")}:${match[2]}`;
                    // Filter reasonable movie times (08:00 - 23:59)
                    const hour = parseInt(match[1]);
                    if (hour >= 8 && hour <= 23 && !seenTimes.has(formattedTime)) {
                        seenTimes.add(formattedTime);
                        showtimes.push({
                            id: `st-${generateId()}`,
                            time: formattedTime,
                            version: "",
                            is3D: false,
                            isIMAX: false,
                        });
                    }
                }
            }

            if (showtimes.length > 0) {
                if (moviesMap.has(allocineMovieId)) {
                    // Merge with existing
                    const existingGroup = moviesMap.get(allocineMovieId)!;
                    existingGroup.showtimes.push(...showtimes);

                    // Sort
                    existingGroup.showtimes.sort((a, b) => a.time.localeCompare(b.time));

                    // Refine duplicates within showtimes (same time/version)
                    const uniqueKeys = new Set<string>();
                    existingGroup.showtimes = existingGroup.showtimes.filter(st => {
                        const key = `${st.time}-${st.version}-${st.is3D ? '3d' : '2d'}-${st.isIMAX ? 'imax' : 'std'}`;
                        if (uniqueKeys.has(key)) return false;
                        uniqueKeys.add(key);
                        return true;
                    });
                } else {
                    // Create new entry
                    showtimes.sort((a, b) => a.time.localeCompare(b.time));
                    moviesMap.set(allocineMovieId, {
                        movie,
                        cinema,
                        date,
                        showtimes,
                    });
                }
            }
        }
    );

    return Array.from(moviesMap.values());
}

export async function scrapeAllCinemas(
    cinemas: Cinema[],
    date: string
): Promise<ShowtimeGroup[]> {
    // Scrape in parallel with a concurrency limit (low to avoid 429 rate limiting)
    const CONCURRENCY = 2;
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

        // Add delay between batches to avoid rate limiting
        if (i + CONCURRENCY < cinemas.length) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    return allGroups;
}
