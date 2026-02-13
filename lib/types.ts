// ============================================
// CinéNantes - Types
// ============================================

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  type: "multiplexe" | "art-essai" | "independant";
  allocineId: string;
  allocineUrl: string;
  websiteUrl?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  screens?: number;
}

export interface Movie {
  id: string;
  title: string;
  allocineId: string;
  posterUrl?: string;
  backdropUrl?: string;
  synopsis?: string;
  rating?: number;
  genres?: string[];
  duration?: string;
  releaseDate?: string;
  director?: string;
  cast?: string[];
  tmdbId?: string;
}

export interface Showtime {
  id: string;
  time: string; // "14:30"
  version: "VF" | "VOST" | "VO" | "";
  is3D: boolean;
  isIMAX: boolean;
  screenFormat?: string;
}

export interface ShowtimeGroup {
  movie: Movie;
  cinema: Cinema;
  date: string; // "2026-02-13"
  showtimes: Showtime[];
}

export interface CinemaWithShowtimes {
  cinema: Cinema;
  groups: ShowtimeGroup[];
}

export interface MovieWithCinemas {
  movie: Movie;
  cinemaShowtimes: {
    cinema: Cinema;
    showtimes: Showtime[];
  }[];
}

export type FavoriteType = "movie" | "cinema";

export interface Favorite {
  id: string;
  type: FavoriteType;
  name: string;
  addedAt: string;
}
