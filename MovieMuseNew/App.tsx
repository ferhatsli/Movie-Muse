/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {RootNavigator} from './src/navigation/RootNavigator';
import {AuthProvider} from './src/contexts/AuthContext';
import {FavoritesProvider} from './src/contexts/FavoritesContext';
import {COLORS} from './src/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const App = () => {
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Create AsyncStorage directory if it doesn't exist
        const storageDir = `${RNFS.DocumentDirectoryPath}/RCTAsyncLocalStorage_V1`;
        const exists = await RNFS.exists(storageDir);
        
        if (!exists) {
          await RNFS.mkdir(storageDir);
        }

        // Initialize AsyncStorage with a test write
        await AsyncStorage.setItem('@app_init', 'initialized');
        const testRead = await AsyncStorage.getItem('@app_init');
        
        if (testRead !== 'initialized') {
          throw new Error('AsyncStorage initialization failed');
        }
      } catch (error) {
        console.warn('Storage initialization warning:', error);
        // Try to clear storage and reinitialize if there's an error
        try {
          await AsyncStorage.clear();
          await AsyncStorage.setItem('@app_init', 'initialized');
        } catch (clearError) {
          console.error('Failed to reinitialize storage:', clearError);
        }
      }
    };

    initializeStorage();
  }, []);

  return (
    <AuthProvider>
      <FavoritesProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
          translucent
        />
        <RootNavigator />
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;
