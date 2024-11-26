import express, { Request, Response } from 'express';
import axios from 'axios';
import * as Redis from 'redis';
import cors from 'cors';
import dotenv from 'dotenv';
import { cacheMiddleware } from './middleware/cache';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Redis client setup
let redisClient: Redis.RedisClientType | null = null;

const initRedis = async () => {
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (error) => {
      console.error('Redis Error:', error);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis successfully');
    });

    await redisClient.connect();
  } catch (error) {
    console.warn('Redis connection failed, continuing without caching:', error);
    redisClient = null;
  }
};

// Initialize Redis
initRedis();

// Initialize cache middleware with Redis client
const cache = cacheMiddleware(redisClient);

// Types
interface Genre {
  id: number;
  name: string;
}

interface Movie {
  id: number;
  title: string;
  genre_ids: number[];
  backdrop_path: string | null;
  poster_path: string | null;
  [key: string]: any;
}

interface CategorizedMovies {
  [genre: string]: Movie[];
}

interface MovieResponse {
  data: CategorizedMovies;
  pagination: {
    currentPage: number;
    hasMore: boolean;
    totalPages: number;
  };
}

// CORS Middleware
app.use(cors());

// Basic test route
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

// Get movies categorized by genre
app.get('/movies', async (req: Request, res: Response) => {
  const { page = '1', limit = '5' } = req.query;
  const pageNum = Number(page);
  const limitNum = Number(limit);

  try {
    const cacheKey = `movies_page_${page}`;

    const categorizedMovies = await cache(
      cacheKey,
      async () => {
        const genresResponse = await axios.get<{ genres: Genre[] }>(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=en-US`
        );
        const genres = genresResponse.data.genres;

        const categorizedMovies: CategorizedMovies = {};

        const moviesResponse = await Promise.all(
          Array.from({ length: limitNum }, (_, i) =>
            axios.get<{ results: Movie[] }>(
              `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=${pageNum + i}`,
              { timeout: 10000 }
            )
          )
        );

        const movies = moviesResponse.flatMap(response => response.data.results);

        movies.forEach((movie) => {
          movie.genre_ids.forEach((genreId) => {
            const genre = genres.find((g) => g.id === genreId)?.name;
            if (genre) {
              if (!categorizedMovies[genre]) {
                categorizedMovies[genre] = [];
              }
              if (!categorizedMovies[genre].find((m) => m.id === movie.id)) {
                categorizedMovies[genre].push(movie);
              }
            }
          });
        });

        return {
          data: categorizedMovies,
          pagination: {
            currentPage: pageNum,
            hasMore: pageNum < 5,
            totalPages: 5,
          },
        };
      },
      1800
    );

    res.json(categorizedMovies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({
      error: 'Error fetching movies',
      data: {},
      pagination: {
        currentPage: pageNum,
        hasMore: false,
        totalPages: 0,
      },
    });
  }
});

// Get opening background images
app.get('/opening-backgrounds', async (req: Request, res: Response) => {
  const { limit = '10' } = req.query;
  const limitNum = Number(limit);

  try {
    const moviesResponse = await axios.get<{ results: Movie[] }>(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1&sort_by=popularity.desc`,
      { timeout: 10000 }
    );
    const movies = moviesResponse.data.results;

    const backgrounds = movies
      .filter((movie) => movie.backdrop_path)
      .map((movie) => ({
        id: movie.id,
        backdrop_path: movie.backdrop_path,
        poster_path: movie.poster_path,
      }))
      .slice(0, limitNum);

    res.json(backgrounds);
  } catch (error) {
    console.error('Error fetching background images:', error);
    res.status(500).send('Error fetching background images');
  }
});

// Sort movies by criteria
app.get('/sort-movies', async (req: Request, res: Response) => {
  const { sort_by = 'popularity.desc', genre = '', page = '1' } = req.query;
  const pageNum = Number(page);

  try {
    const genresResponse = await axios.get<{ genres: Genre[] }>(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=en-US`
    );
    const genres = genresResponse.data.genres;

    const genreObject = genres.find(
      (g) => g.name.toLowerCase() === String(genre).toLowerCase()
    );
    const genreId = genreObject?.id;

    if (!genreId) {
      return res.status(400).send('Invalid genre name.');
    }

    const genreFilter = `&with_genres=${genreId}`;

    const moviesResponse = await axios.get<{ results: Movie[] }>(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=${pageNum}&sort_by=${sort_by}${genreFilter}`,
      { timeout: 10000 }
    );
    const movies = moviesResponse.data.results;

    res.json(movies);
  } catch (error) {
    console.error('Error fetching sorted movies:', error);
    res.status(500).send('Error fetching sorted movies');
  }
});

// Get all genres
app.get('/genres', async (req: Request, res: Response) => {
  try {
    const genresResponse = await axios.get<{ genres: Genre[] }>(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=en-US`,
      { timeout: 10000 }
    );
    const genres = genresResponse.data.genres;

    res.json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).send('Error fetching genres');
  }
});

// Get movie details by ID
app.get('/movie/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const movieResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`,
      { timeout: 10000 }
    );

    res.json(movieResponse.data);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).send('Error fetching movie details');
  }
});

// Search movies
app.get('/search', async (req: Request, res: Response) => {
  const { query = '' } = req.query;

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`,
      { timeout: 10000 }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error searching for movies:', error);
    res.status(500).send('Error searching for movies');
  }
});

// Get movie recommendations
app.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const moviesResponse = await axios.get<{ results: Movie[] }>(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=1`,
      { timeout: 10000 }
    );
    const movies = moviesResponse.data.results;

    const randomMovies: Movie[] = [];
    while (randomMovies.length < 2) {
      const randomIndex = Math.floor(Math.random() * movies.length);
      const selectedMovie = movies[randomIndex];
      if (!randomMovies.find(m => m.id === selectedMovie.id)) {
        randomMovies.push(selectedMovie);
      }
    }

    const recommendations: Movie[] = [];

    for (const movie of randomMovies) {
      const recommendationResponse = await axios.get<{ results: Movie[] }>(
        `https://api.themoviedb.org/3/movie/${movie.id}/recommendations?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`,
        { timeout: 10000 }
      );
      recommendations.push(...recommendationResponse.data.results);
    }

    res.json({
      randomMovies: randomMovies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      })),
      recommendations: recommendations.slice(0, 10),
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).send('Error fetching recommendations');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 