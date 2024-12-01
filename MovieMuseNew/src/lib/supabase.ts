import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';

const supabaseUrl = 'https://xfsfatyvihnydmamgdsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhmc2ZhdHl2aWhueWRtYW1nZHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NzQyNjcsImV4cCI6MjA0ODE1MDI2N30.qTaxhBUyxrVFCSbEAWgiWlxVtj1EbnyVBTiSX60jAIQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 