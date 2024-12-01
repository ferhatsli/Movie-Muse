export interface Movie {
  id: number;
  title: string;
  overview?: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count?: number;
  release_date: string;
  genre_ids?: number[];
  genres?: {
    id: number;
    name: string;
  }[];
  runtime?: number;
  status?: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
  popularity?: number;
  production_companies?: {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }[];
} 