import {supabase} from './supabase';
import {Movie} from '../types/movie';

export const addFavoriteMovie = async (userId: string, movie: Movie) => {
  const {data, error} = await supabase
    .from('favorite_movies')
    .insert([
      {
        user_id: userId,
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeFavoriteMovie = async (userId: string, movieId: number) => {
  const {error} = await supabase
    .from('favorite_movies')
    .delete()
    .match({user_id: userId, movie_id: movieId});

  if (error) throw error;
};

export const getFavoriteMovies = async (userId: string) => {
  const {data, error} = await supabase
    .from('favorite_movies')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

export const isFavoriteMovie = async (userId: string, movieId: number) => {
  const {data, error} = await supabase
    .from('favorite_movies')
    .select('id')
    .match({user_id: userId, movie_id: movieId})
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  return !!data;
}; 