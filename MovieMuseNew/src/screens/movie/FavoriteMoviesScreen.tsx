import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {COLORS} from '../../theme/colors';
import {FONTS} from '../../theme/fonts';
import MovieCard from '../../components/MovieCard';
import {useFavorites} from '../../contexts/FavoritesContext';
import {useNavigation} from '@react-navigation/native';
import {MainTabScreenNavigationProp} from '../../types/navigation';

const {width} = Dimensions.get('window');

export default function FavoriteMoviesScreen() {
  const navigation = useNavigation<MainTabScreenNavigationProp>();
  const {favorites, isLoading, removeFromFavorites} = useFavorites();

  const handleMoviePress = (movieId: number) => {
    navigation.navigate('MovieDetail', {movieId});
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No favorite movies yet</Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('HomeTab')}>
          <Text style={styles.browseButtonText}>Browse Movies</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={({item}) => (
          <MovieCard
            movie={item}
            onPress={() => handleMoviePress(item.id)}
            onFavoritePress={() => removeFromFavorites(item.id)}
            isFavorite={true}
          />
        )}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  listContainer: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  emptyText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.medium,
    marginBottom: 20,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
}); 