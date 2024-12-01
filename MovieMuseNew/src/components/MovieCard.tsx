import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Movie} from '../types/movie.types';

const {width} = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24;

interface MovieCardProps {
  movie: Movie;
  onPress: () => void;
  onFavoritePress: () => void;
  isFavorite: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPress,
  onFavoritePress,
  isFavorite,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w342${movie.poster_path}`,
          }}
          style={styles.poster}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={14} color={COLORS.primary} />
          <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
        </View>
        <Text style={styles.releaseDate}>
          {new Date(movie.release_date).getFullYear()}
        </Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}>
          <FontAwesome
            name={isFavorite ? 'heart' : 'heart-o'}
            size={24}
            color={isFavorite ? COLORS.primary : COLORS.gray}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  poster: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
  },
  info: {
    padding: 12,
  },
  title: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginLeft: 4,
  },
  releaseDate: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  favoriteButton: {
    position: 'absolute',
    top: -180,
    right: 8,
    backgroundColor: COLORS.background + '80',
    padding: 8,
    borderRadius: 20,
  },
});

export default MovieCard; 