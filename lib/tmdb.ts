import { Movie } from "./types";

// ============================================
// TMDB API Client (optional enrichment)
// ============================================

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// Cache for TMDB lookups
const tmdbCache = new Map<string, Partial<Movie>>();

export function isConfigured(): boolean {
    return TMDB_API_KEY.length > 0;
}

export async function searchMovie(
    title: string
): Promise<Partial<Movie> | null> {
    if (!isConfigured()) return null;

    const cacheKey = title.toLowerCase().trim();
    if (tmdbCache.has(cacheKey)) {
        return tmdbCache.get(cacheKey) || null;
    }

    try {
        const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(title)}&region=FR`;
        const response = await fetch(url);

        if (!response.ok) return null;

        const data = await response.json();
        if (!data.results || data.results.length === 0) return null;

        const result = data.results[0];
        const enriched: Partial<Movie> = {
            tmdbId: String(result.id),
            posterUrl: result.poster_path
                ? `${TMDB_IMAGE_BASE}/w500${result.poster_path}`
                : undefined,
            backdropUrl: result.backdrop_path
                ? `${TMDB_IMAGE_BASE}/w1280${result.backdrop_path}`
                : undefined,
            synopsis: result.overview || undefined,
            rating: result.vote_average
                ? Math.round(result.vote_average * 10) / 10
                : undefined,
            releaseDate: result.release_date || undefined,
        };

        // Fetch additional details for genres and cast
        const details = await fetchMovieDetails(result.id);
        if (details) {
            enriched.genres = details.genres;
            enriched.duration = details.duration;
            enriched.director = details.director;
            enriched.cast = details.cast;
        }

        tmdbCache.set(cacheKey, enriched);
        return enriched;
    } catch (error) {
        console.error(`TMDB search error for "${title}":`, error);
        return null;
    }
}

async function fetchMovieDetails(
    tmdbId: number
): Promise<{
    genres: string[];
    duration: string;
    director?: string;
    cast?: string[];
} | null> {
    try {
        const [detailsRes, creditsRes] = await Promise.all([
            fetch(
                `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
            ),
            fetch(
                `${TMDB_BASE_URL}/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}&language=fr-FR`
            ),
        ]);

        if (!detailsRes.ok) return null;

        const details = await detailsRes.json();
        const credits = creditsRes.ok ? await creditsRes.json() : null;

        const genres = details.genres?.map(
            (g: { name: string }) => g.name
        ) || [];

        const runtime = details.runtime;
        const hours = Math.floor(runtime / 60);
        const mins = runtime % 60;
        const duration = runtime
            ? `${hours}h${mins.toString().padStart(2, "0")}`
            : "";

        const director = credits?.crew?.find(
            (c: { job: string; name: string }) => c.job === "Director"
        )?.name;

        const cast = credits?.cast
            ?.slice(0, 5)
            .map((c: { name: string }) => c.name);

        return { genres, duration, director, cast };
    } catch {
        return null;
    }
}

export async function enrichMovie(movie: Movie): Promise<Movie> {
    const tmdbData = await searchMovie(movie.title);
    if (!tmdbData) return movie;

    return {
        ...movie,
        posterUrl: tmdbData.posterUrl || movie.posterUrl,
        backdropUrl: tmdbData.backdropUrl || movie.backdropUrl,
        synopsis: tmdbData.synopsis || movie.synopsis,
        rating: tmdbData.rating || movie.rating,
        genres: tmdbData.genres || movie.genres,
        duration: tmdbData.duration || movie.duration,
        director: tmdbData.director || movie.director,
        cast: tmdbData.cast || movie.cast,
        tmdbId: tmdbData.tmdbId || movie.tmdbId,
    };
}
