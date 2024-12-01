import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {MainTabScreenNavigationProp} from '../../types/navigation';
import HeaderMovieSlider from '../../components/HeaderMovieSlider';
import PopularMoviesSection from '../../components/home/PopularMoviesSection';
import {COLORS} from '../../theme/colors';
import {FONTS} from '../../theme/fonts';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface MoviesByCategory {
  [key: string]: Movie[];
}

const API_BASE_URL = 'http://192.168.1.103:5001';

export default function HomeScreen() {
  const navigation = useNavigation<MainTabScreenNavigationProp>();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [moviesByCategory, setMoviesByCategory] = useState<MoviesByCategory>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoviesData = async (refresh = false) => {
    try {
      setLoading(true);
      const [trendingResponse, categorizedResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/movies/trending`),
        axios.get(`${API_BASE_URL}/movies`),
      ]);

      setTrendingMovies(trendingResponse.data.results || []);
      setMoviesByCategory(categorizedResponse.data.data || {});
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.status === 404
            ? 'Movie service is currently unavailable'
            : 'Failed to fetch movies. Please check your internet connection.',
        );
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMoviesData(true);
  }, []);

  useEffect(() => {
    fetchMoviesData();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchMoviesData()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <HeaderMovieSlider movies={trendingMovies} />
        
        {Object.entries(moviesByCategory).map(([category, movies]) => (
          <PopularMoviesSection
            key={category}
            movies={movies}
            title={category}
          />
        ))}
      </ScrollView>
    </View>
  );
}

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
}); 