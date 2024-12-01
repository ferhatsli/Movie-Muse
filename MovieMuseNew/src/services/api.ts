import axios from 'axios';
import {Platform} from 'react-native';
import {Movie} from '../types/movie.types';

// Use localhost for iOS and 10.0.2.2 for Android emulator
const BASE_URL = Platform.select({
  ios: 'http://localhost:5001',
  android: 'http://10.0.2.2:5001', // Special IP for Android emulator to access host machine
});

export const api = {
  getMovies: async (page = 1) => {
    const response = await axios.get(`${BASE_URL}/movies?page=${page}`);
    return response.data;
  },

  getGenres: async () => {
    const response = await axios.get(`${BASE_URL}/genres`);
    return response.data;
  },

  getMovieDetails: async (movieId: number) => {
    const response = await axios.get(`${BASE_URL}/movies/${movieId}`);
    return response.data;
  },

  getMoviesByCategory: async (category: string, page = 1) => {
    const response = await axios.get(
      `${BASE_URL}/movies/category/${category}?page=${page}`,
    );
    return response.data;
  },

  searchMovies: async (query: string) => {
    const response = await axios.get(`${BASE_URL}/movies/search?query=${query}`);
    return response.data;
  },

  getFavoriteMovies: async (movieIds: number[]) => {
    const promises = movieIds.map(id => axios.get(`${BASE_URL}/movies/${id}`));
    const responses = await Promise.all(promises);
    return responses.map(response => response.data);
  },

  getTrendingMovies: async () => {
    const response = await axios.get(`${BASE_URL}/movies/trending`);
    return response.data;
  },
}; 