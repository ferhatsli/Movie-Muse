import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_SESSION: '@user_session',
  USER_PROFILE: '@user_profile',
  USER_SETTINGS: '@user_settings',
  AUTH_TOKEN: '@auth_token',
  FAVORITE_MOVIES: '@favorite_movies',
  APP_INIT: '@app_init',
} as const;

class StorageService {
  // User Session
  async setUserSession(session: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving user session:', error);
      throw error;
    }
  }

  async getUserSession(): Promise<any | null> {
    try {
      const session = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  }

  // User Profile
  async setUserProfile(profile: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<any | null> {
    try {
      const profile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // User Settings
  async setUserSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving user settings:', error);
      throw error;
    }
  }

  async getUserSettings(): Promise<any | null> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return null;
    }
  }

  // Auth Token
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw error;
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Favorite Movies
  async setFavoriteMovies(movies: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_MOVIES, JSON.stringify(movies));
    } catch (error) {
      console.error('Error saving favorite movies:', error);
      throw error;
    }
  }

  async getFavoriteMovies(): Promise<any[]> {
    try {
      const movies = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_MOVIES);
      return movies ? JSON.parse(movies) : [];
    } catch (error) {
      console.error('Error getting favorite movies:', error);
      return [];
    }
  }

  // App Initialization
  async initializeApp(): Promise<void> {
    try {
      const initialized = await AsyncStorage.getItem(STORAGE_KEYS.APP_INIT);
      if (!initialized) {
        await AsyncStorage.setItem(STORAGE_KEYS.APP_INIT, 'true');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      throw error;
    }
  }

  // Clear Storage
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_SESSION,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.USER_SETTINGS,
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.FAVORITE_MOVIES,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

export const storage = new StorageService(); 