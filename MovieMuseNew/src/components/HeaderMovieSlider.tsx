import React, {useState, useEffect, memo} from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {MainNavigationProp} from '../types/navigation';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.1.103:5001';
const FONT_SIZES = {
  large: 24,
  regular: 16,
};

const SmallMovieItem = memo(({movie, isActive}) => {
  return (
    <Image
      source={{
        uri: `https://image.tmdb.org/t/p/w154${movie.poster_path}`,
      }}
      style={{
        width: 60,
        height: 90,
        marginHorizontal: 5,
        borderRadius: 8,
        opacity: isActive ? 1 : 0.5,
      }}
    />
  );
});

export default function HeaderMovieSlider({movies}) {
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigation = useNavigation<MainNavigationProp>();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMovieIndex(prevIndex => (prevIndex + 1) % movies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [movies]);

  const handleSearch = async () => {
    if (searchQuery.trim() !== '') {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/search?query=${searchQuery}`,
        );
        setSearchResults(response.data.results);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      // Navigation will be handled automatically by the App.js auth state listener
    } catch (error) {
      console.error('Logout failed: ', error);
    }
  };

  const renderSearchResultItem = ({item}) => (
    <TouchableOpacity
      style={{padding: 10, borderBottomColor: '#fff', borderBottomWidth: 1}}
      onPress={() => {
        setIsSearchActive(false);
        navigation.navigate('MovieDetail', {movieId: item.id});
      }}>
      <Text style={{color: '#fff'}}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (!movies.length) return null;

  return (
    <View style={{height: 600, width: '100%'}}>
      {isSearchActive ? (
        <View style={{padding: 20, marginTop: 50}}>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Enter movie name..."
            placeholderTextColor="#888"
            style={{
              backgroundColor: '#333',
              color: '#fff',
              padding: 10,
              borderRadius: 5,
              marginBottom: 10,
            }}
            onSubmitEditing={handleSearch}
          />
          <FlatList
            data={searchResults}
            renderItem={renderSearchResultItem}
            keyExtractor={item => item.id.toString()}
          />
          <TouchableOpacity onPress={() => setIsSearchActive(false)}>
            <Text style={{color: '#fff', textAlign: 'center', marginTop: 10}}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ImageBackground
          source={{
            uri: `https://image.tmdb.org/t/p/w600_and_h900_bestv2${movies[currentMovieIndex].poster_path}`,
          }}
          style={{width: '100%', height: '100%'}}
          resizeMode="cover">
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0.7)',
              'rgba(0, 0, 0, 0.5)',
              'rgba(0, 0, 0, 0.3)',
            ]}
            style={{flex: 1, justifyContent: 'flex-end'}}>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                marginTop: 40,
              }}>
              <Text style={{
                color: COLORS.white,
                fontSize: 24,
                fontWeight: 'bold',
              }}>
                MovieMuse
              </Text>

              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  style={{marginRight: 20}}
                  onPress={() => setIsSearchActive(true)}>
                  <Ionicons name="search-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{marginRight: 20}}
                  onPress={() => navigation.navigate('MainTabs', {
                    screen: 'ProfileTab'
                  })}>
                  <Ionicons name="person-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{position: 'absolute', bottom: 180, left: 16}}>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: FONT_SIZES.large,
                  fontFamily: FONTS.medium,
                }}>
                {movies[currentMovieIndex]?.title ?? ''}
              </Text>
            </View>

            <View style={{position: 'absolute', bottom: 120, left: 16}}>
              <TouchableOpacity
                style={{
                  backgroundColor: COLORS.secondary,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 25,
                }}
                onPress={() => {
                  navigation.navigate('MovieDetail', {
                    movieId: movies[currentMovieIndex].id,
                  });
                }}>
                <Text
                  style={{
                    color: COLORS.white,
                    fontSize: FONT_SIZES.regular,
                    fontFamily: FONTS.medium,
                  }}>
                  Watch Now
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                position: 'absolute',
                bottom: 10,
                left: 16,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <FlatList
                data={movies}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => (
                  <SmallMovieItem
                    movie={item}
                    isActive={currentMovieIndex === index}
                  />
                )}
                initialNumToRender={5}
                windowSize={3}
              />
            </View>
          </LinearGradient>
        </ImageBackground>
      )}
    </View>
  );
} 