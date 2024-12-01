import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {COLORS} from '../theme/colors';
import MovieDetailScreen from '../screens/movie/MovieDetailScreen';
import MoviesScreen from '../screens/movie/MoviesScreen';
import {TabNavigator} from './TabNavigator';
import {MainStackParamList} from '../types/navigation';

const Stack = createStackNavigator<MainStackParamList>();

export const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={{
          title: 'Movie Details',
        }}
      />
      <Stack.Screen
        name="MoviesScreen"
        component={MoviesScreen}
        options={({route}) => ({
          title: route.params?.category || 'Movies',
        })}
      />
    </Stack.Navigator>
  );
}; 