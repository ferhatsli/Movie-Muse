import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
  Share,
  Alert,
} from 'react-native';
import {COLORS} from '../../theme/colors';
import {FONTS} from '../../theme/fonts';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainStackParamList} from '../../types/navigation';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFavorites} from '../../contexts/FavoritesContext';

const {width} = Dimensions.get('window');
const API_BASE_URL = 'http://192.168.1.103:5001';

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genres: Array<{id: number; name: string}>;
  production_companies: Array<{id: number; name: string; logo_path: string | null}>;
  status: string;
  budget: number;
  revenue: number;
  tagline: string;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }>;
  };
  videos: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }>;
  };
  similar: {
    results: Array<{
      id: number;
      title: string;
      poster_path: string;
      vote_average: number;
    }>;
  };
}

type MovieDetailScreenProps = NativeStackScreenProps<
  MainStackParamList,
  'MovieDetail'
>;

const MovieDetailScreen: React.FC<MovieDetailScreenProps> = ({route, navigation}) => {
  const {movieId} = route.params;
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const {isFavorite, addToFavorites, removeFromFavorites} = useFavorites();

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/movie/${movieId}?append_to_response=credits,videos,similar`,
      );
      setMovie(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch movie details');
      console.error('Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!movie) return;

    try {
      if (isFavorite(movie.id)) {
        await removeFromFavorites(movie.id);
      } else {
        await addToFavorites(movie);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const shareMovie = async () => {
    try {
      await Share.share({
        message: `Check out ${movie?.title} on MovieMuse!\nhttps://www.themoviedb.org/movie/${movieId}`,
        title: movie?.title || 'Check out this movie!',
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Failed to load movie details'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMovieDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`,
          }}
          style={styles.backdropImage}
        />
        <LinearGradient
          colors={['transparent', COLORS.background]}
          style={styles.gradient}
        />
        <View style={styles.headerContent}>
          <Text style={styles.title}>{movie.title}</Text>
          {movie.tagline && (
            <Text style={styles.tagline}>{movie.tagline}</Text>
          )}
          <View style={styles.movieInfo}>
            <Text style={styles.releaseDate}>
              {new Date(movie.release_date).getFullYear()}
            </Text>
            <Text style={styles.runtime}>
              {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
            </Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color={COLORS.primary} />
              <Text style={styles.ratingText}>
                {movie.vote_average.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite(movie.id) ? 'heart' : 'heart-outline'}
              size={24}
              color={COLORS.primary}
            />
            <Text style={styles.actionText}>
              {isFavorite(movie.id) ? 'Remove' : 'Add to Favorites'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={shareMovie}>
            <Ionicons name="share-outline" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movie.overview}</Text>
        </View>

        {movie.genres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genres</Text>
            <View style={styles.genres}>
              {movie.genres.map(genre => (
                <View key={genre.id} style={styles.genre}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {movie.credits?.cast?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {movie.credits.cast.slice(0, 10).map(person => (
                <View key={person.id} style={styles.castItem}>
                  <Image
                    source={{
                      uri: person.profile_path
                        ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                        : 'https://via.placeholder.com/185x278',
                    }}
                    style={styles.castImage}
                  />
                  <Text style={styles.castName} numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text style={styles.castCharacter} numberOfLines={1}>
                    {person.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {movie.similar?.results?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Movies</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {movie.similar.results.slice(0, 10).map(similarMovie => (
                <TouchableOpacity
                  key={similarMovie.id}
                  style={styles.similarMovie}
                  onPress={() =>
                    navigation.push('MovieDetail', {movieId: similarMovie.id})
                  }>
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/w185${similarMovie.poster_path}`,
                    }}
                    style={styles.similarMovieImage}
                  />
                  <Text style={styles.similarMovieTitle} numberOfLines={2}>
                    {similarMovie.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {showTrailer && movie.videos?.results?.length > 0 && (
        <Modal
          visible={showTrailer}
          transparent={true}
          onRequestClose={() => setShowTrailer(false)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTrailer(false)}>
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <WebView
              source={{
                uri: `https://www.youtube.com/embed/${movie.videos.results[0].key}`,
              }}
              style={styles.webview}
            />
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  header: {
    height: 300,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  tagline: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.medium,
    opacity: 0.8,
    marginBottom: 8,
  },
  movieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  releaseDate: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginRight: 16,
  },
  runtime: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginRight: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginLeft: 4,
  },
  content: {
    padding: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: FONTS.bold,
    marginBottom: 12,
  },
  overview: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.regular,
    lineHeight: 24,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genre: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  castItem: {
    width: 100,
    marginRight: 16,
  },
  castImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  castName: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  castCharacter: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  similarMovie: {
    width: 120,
    marginRight: 16,
  },
  similarMovieImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarMovieTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  webview: {
    flex: 1,
    marginTop: 80,
  },
});

export default MovieDetailScreen; 