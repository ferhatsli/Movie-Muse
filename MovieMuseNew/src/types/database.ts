import {Profile} from './supabase';

export interface Database {
  profiles: {
    id: string;
    email: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    favorite_genres: string[] | null;
    created_at: string;
    updated_at: string;
  };
  
  favorite_movies: {
    id: string;
    user_id: string;
    movie_id: number;
    created_at: string;
  };
  
  movie_ratings: {
    id: string;
    user_id: string;
    movie_id: number;
    rating: number;
    created_at: string;
    updated_at: string;
  };
  
  movie_reviews: {
    id: string;
    user_id: string;
    movie_id: number;
    content: string;
    rating: number;
    created_at: string;
    updated_at: string;
  };
} 