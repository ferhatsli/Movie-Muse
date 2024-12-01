import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../../types/navigation';
import {COLORS} from '../../theme/colors';
import {FONTS} from '../../theme/fonts';
import MovieCard from '../../components/MovieCard';
import {api} from '../../services/api';
import {Movie} from '../../types/movie.types';
import {useFavorites} from '../../contexts/FavoritesContext';

type MoviesScreenProps = {
  route: RouteProp<MainStackParamList, 'MoviesScreen'>;
};

type SortOption = 'popularity' | 'rating' | 'release_date';

export default function MoviesScreen({route}: MoviesScreenProps) {
  const navigation = useNavigation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const {isFavorite, addToFavorites, removeFromFavorites} = useFavorites();

  const fetchMovies = async (pageNum = 1, refresh = false) => {
    try {
      const response = await api.getMoviesByCategory(route.params.category, pageNum);
      const newMovies = response.results;
      
      // Sort movies based on selected option
      const sortedMovies = [...newMovies].sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return b.vote_average - a.vote_average;
          case 'release_date':
            return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
          case 'popularity':
          default:
            return b.popularity - a.popularity;
        }
      });
      
      if (refresh) {
        setMovies(sortedMovies);
      } else {
        setMovies(prev => [...prev, ...sortedMovies]);
      }
      
      setHasMore(newMovies.length === 20);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching movies:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies(1, true);
  }, [route.params.category, sortBy]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchMovies(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  };

  const handleFavoritePress = async (movie: Movie) => {
    try {
      if (isFavorite(movie.id)) {
        await removeFromFavorites(movie.id);
      } else {
        await addToFavorites(movie);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderSortOption = (option: SortOption, label: string) => (
    <TouchableOpacity
      style={[styles.sortOption, sortBy === option && styles.sortOptionActive]}
      onPress={() => setSortBy(option)}>
      <Text
        style={[
          styles.sortOptionText,
          sortBy === option && styles.sortOptionTextActive,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sortContainer}>
        {renderSortOption('popularity', 'Popular')}
        {renderSortOption('rating', 'Top Rated')}
        {renderSortOption('release_date', 'Latest')}
      </View>

      <FlatList
        data={movies}
        renderItem={({item}) => (
          <MovieCard
            movie={item}
            onPress={() => navigation.navigate('MovieDetail', {movieId: item.id})}
            onFavoritePress={() => handleFavoritePress(item)}
            isFavorite={isFavorite(item.id)}
          />
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading && !refreshing ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary,
  },
  sortOptionText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  sortOptionTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
}); 