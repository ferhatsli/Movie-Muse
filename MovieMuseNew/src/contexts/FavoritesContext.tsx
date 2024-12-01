import React, {createContext, useContext, useState, useEffect} from 'react';
import {Movie} from '../types/movie';
import {useAuth} from './AuthContext';
import {
  addFavoriteMovie,
  removeFavoriteMovie,
  getFavoriteMovies,
  isFavoriteMovie,
} from '../lib/database';
import {supabase} from '../lib/supabase';
import {RealtimePostgresChangesPayload} from '@supabase/supabase-js';

interface FavoritesContextType {
  favorites: Movie[];
  isLoading: boolean;
  addToFavorites: (movie: Movie) => Promise<void>;
  removeFromFavorites: (movieId: number) => Promise<void>;
  isFavorite: (movieId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

export const FavoritesProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {user} = useAuth();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastOperation, setLastOperation] = useState<{
    type: 'add' | 'remove';
    timestamp: number;
    movieId: number;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadFavorites();
      
      // Subscribe to real-time changes
      const subscription = supabase
        .channel('favorite_movies_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'favorite_movies',
            filter: `user_id=eq.${user.id}`,
          },
          async (payload: RealtimePostgresChangesPayload<any>) => {
            // Ignore events that we just triggered (within last 2 seconds)
            if (
              lastOperation &&
              Date.now() - lastOperation.timestamp < 2000 &&
              ((payload.eventType === 'INSERT' && lastOperation.type === 'add' && payload.new.movie_id === lastOperation.movieId) ||
               (payload.eventType === 'DELETE' && lastOperation.type === 'remove' && payload.old.movie_id === lastOperation.movieId))
            ) {
              return;
            }

            // Reload the entire favorites list to ensure consistency
            await loadFavorites();
          },
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [user, lastOperation]);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      if (user) {
        const data = await getFavoriteMovies(user.id);
        setFavorites(
          data.map(item => ({
            id: item.movie_id,
            title: item.title,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: item.release_date,
          })),
        );
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (movie: Movie) => {
    try {
      if (!user) return;
      
      // Update local state immediately
      setFavorites(prev => [...prev, movie]);
      setLastOperation({
        type: 'add',
        timestamp: Date.now(),
        movieId: movie.id,
      });
      
      await addFavoriteMovie(user.id, movie);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      // Revert local state if failed
      setFavorites(prev => prev.filter(m => m.id !== movie.id));
    }
  };

  const removeFromFavorites = async (movieId: number) => {
    try {
      if (!user) return;
      
      const removedMovie = favorites.find(m => m.id === movieId);
      // Update local state immediately
      setFavorites(prev => prev.filter(movie => movie.id !== movieId));
      setLastOperation({
        type: 'remove',
        timestamp: Date.now(),
        movieId,
      });
      
      await removeFavoriteMovie(user.id, movieId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      // Revert local state if failed
      if (removedMovie) {
        setFavorites(prev => [...prev, removedMovie]);
      }
    }
  };

  const isFavorite = (movieId: number) => {
    return favorites.some(movie => movie.id === movieId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}; 