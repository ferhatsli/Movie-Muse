"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const Redis = __importStar(require("redis"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cache_1 = require("./middleware/cache");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Redis client setup
let redisClient = null;
const initRedis = () => __awaiter(void 0, void 0, void 0, function* () {
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
        yield redisClient.connect();
    }
    catch (error) {
        console.warn('Redis connection failed, continuing without caching:', error);
        redisClient = null;
    }
});
// Initialize Redis
initRedis();
// Initialize cache middleware with Redis client
const cache = (0, cache_1.cacheMiddleware)(redisClient);
// CORS Middleware
app.use((0, cors_1.default)());
// Basic test route
app.get('/', (req, res) => {
    res.send('Server is running');
});
// Get movies categorized by genre
app.get('/movies', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = '1', limit = '5' } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    try {
        const cacheKey = `movies_page_${page}`;
        const categorizedMovies = yield cache(cacheKey, () => __awaiter(void 0, void 0, void 0, function* () {
            const genresResponse = yield axios_1.default.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=en-US`);
            const genres = genresResponse.data.genres;
            const categorizedMovies = {};
            const moviesResponse = yield Promise.all(Array.from({ length: limitNum }, (_, i) => axios_1.default.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=${pageNum + i}`, { timeout: 10000 })));
            const movies = moviesResponse.flatMap(response => response.data.results);
            movies.forEach((movie) => {
                movie.genre_ids.forEach((genreId) => {
                    var _a;
                    const genre = (_a = genres.find((g) => g.id === genreId)) === null || _a === void 0 ? void 0 : _a.name;
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
        }), 1800);
        res.json(categorizedMovies);
    }
    catch (error) {
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
}));
// Get opening background images
app.get('/opening-backgrounds', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { limit = '10' } = req.query;
    const limitNum = Number(limit);
    try {
        const moviesResponse = yield axios_1.default.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1&sort_by=popularity.desc`, { timeout: 10000 });
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
    }
    catch (error) {
        console.error('Error fetching background images:', error);
        res.status(500).send('Error fetching background images');
    }
}));
// Sort movies by criteria
app.get('/sort-movies', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sort_by = 'popularity.desc', genre = '', page = '1' } = req.query;
    const pageNum = Number(page);
    try {
        const genresResponse = yield axios_1.default.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=en-US`);
        const genres = genresResponse.data.genres;
        const genreObject = genres.find((g) => g.name.toLowerCase() === String(genre).toLowerCase());
        const genreId = genreObject === null || genreObject === void 0 ? void 0 : genreObject.id;
        if (!genreId) {
            return res.status(400).send('Invalid genre name.');
        }
        const genreFilter = `&with_genres=${genreId}`;
        const moviesResponse = yield axios_1.default.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=${pageNum}&sort_by=${sort_by}${genreFilter}`, { timeout: 10000 });
        const movies = moviesResponse.data.results;
        res.json(movies);
    }
    catch (error) {
        console.error('Error fetching sorted movies:', error);
        res.status(500).send('Error fetching sorted movies');
    }
}));
// Get all genres
app.get('/genres', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const genresResponse = yield axios_1.default.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.TMDB_API_KEY}&language=en-US`, { timeout: 10000 });
        const genres = genresResponse.data.genres;
        res.json(genres);
    }
    catch (error) {
        console.error('Error fetching genres:', error);
        res.status(500).send('Error fetching genres');
    }
}));
// Get movie details by ID
app.get('/movie/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const movieResponse = yield axios_1.default.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`, { timeout: 10000 });
        res.json(movieResponse.data);
    }
    catch (error) {
        console.error('Error fetching movie details:', error);
        res.status(500).send('Error fetching movie details');
    }
}));
// Search movies
app.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query = '' } = req.query;
    try {
        const response = yield axios_1.default.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${query}`, { timeout: 10000 });
        res.json(response.data);
    }
    catch (error) {
        console.error('Error searching for movies:', error);
        res.status(500).send('Error searching for movies');
    }
}));
// Get movie recommendations
app.get('/recommendations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const moviesResponse = yield axios_1.default.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&page=1`, { timeout: 10000 });
        const movies = moviesResponse.data.results;
        const randomMovies = [];
        while (randomMovies.length < 2) {
            const randomIndex = Math.floor(Math.random() * movies.length);
            const selectedMovie = movies[randomIndex];
            if (!randomMovies.find(m => m.id === selectedMovie.id)) {
                randomMovies.push(selectedMovie);
            }
        }
        const recommendations = [];
        for (const movie of randomMovies) {
            const recommendationResponse = yield axios_1.default.get(`https://api.themoviedb.org/3/movie/${movie.id}/recommendations?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`, { timeout: 10000 });
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
    }
    catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).send('Error fetching recommendations');
    }
}));
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
