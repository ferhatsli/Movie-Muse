import React, {memo} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../theme/colors';
import {FONTS} from '../../theme/fonts';
import {MainTabScreenNavigationProp} from '../../types/navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FONT_SIZES = {
  large: 20,
  small: 14,
  xsmall: 12,
};

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface MovieItemProps {
  movie: Movie;
  onPress: () => void;
}

const MovieItem = memo(({movie, onPress}: MovieItemProps) => {
  return (
    <TouchableOpacity style={styles.movieItem} onPress={onPress}>
      <Image
        source={{
          uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }}
        style={styles.moviePoster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {movie.title}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color={COLORS.primary} />
          <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
        </View>
        <Text style={styles.releaseDate}>
          {new Date(movie.release_date).getFullYear()}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

interface PopularMoviesSectionProps {
  movies: Movie[];
  title: string;
}

export default function PopularMoviesSection({movies, title}: PopularMoviesSectionProps) {
  const navigation = useNavigation<MainTabScreenNavigationProp>();

  const handleMoviePress = (movieId: number) => {
    navigation.navigate('MovieDetail', {movieId});
  };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('MoviesScreen', {category: title})}>
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={movies}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <MovieItem movie={item} onPress={() => handleMoviePress(item.id)} />
        )}
        contentContainerStyle={styles.container}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.large,
    fontFamily: FONTS.bold,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.medium,
    marginRight: 4,
  },
  container: {
    paddingHorizontal: 8,
  },
  movieItem: {
    width: 150,
    marginHorizontal: 8,
  },
  moviePoster: {
    width: '100%',
    height: 225,
    borderRadius: 12,
  },
  movieInfo: {
    marginTop: 8,
  },
  movieTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rating: {
    color: COLORS.white,
    fontSize: FONT_SIZES.small,
    fontFamily: FONTS.medium,
    marginLeft: 4,
  },
  releaseDate: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.xsmall,
    fontFamily: FONTS.regular,
  },
}); 