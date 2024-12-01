import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  MovieDetail: { movieId: number };
  MoviesScreen: { category: string };
};

export type TabParamList = {
  HomeTab: undefined;
  FavoriteMoviesTab: undefined;
  ProfileTab: undefined;
};

export type MainTabScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  StackNavigationProp<MainStackParamList>
>;

export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>;
export type MainNavigationProp = StackNavigationProp<MainStackParamList>; 