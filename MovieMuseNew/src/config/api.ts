import {Platform} from 'react-native';

// Use localhost for iOS and 10.0.2.2 for Android emulator
export const API_BASE_URL = Platform.select({
  ios: 'http://localhost:5001',
  android: 'http://10.0.2.2:5001', // Special IP for Android emulator to access host machine
}) || 'http://localhost:5001'; // Fallback to localhost if Platform.select returns undefined 