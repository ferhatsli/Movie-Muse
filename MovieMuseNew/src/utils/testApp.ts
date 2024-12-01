import {supabase} from '../lib/supabase';
import {api} from '../services/api';

export const testSupabaseConnection = async () => {
  try {
    const {data, error} = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Supabase test failed:', err);
    return false;
  }
};

export const testApiConnection = async () => {
  try {
    const response = await api.getMovies(1);
    if (response && response.results) {
      console.log('API connection successful');
      return true;
    }
    console.error('API response invalid');
    return false;
  } catch (err) {
    console.error('API test failed:', err);
    return false;
  }
};

export const testImageLoading = async () => {
  try {
    const movies = await api.getTrendingMovies();
    if (movies && movies.results && movies.results[0]?.poster_path) {
      const imageUrl = `https://image.tmdb.org/t/p/w500${movies.results[0].poster_path}`;
      const response = await fetch(imageUrl);
      if (response.ok) {
        console.log('Image loading successful');
        return true;
      }
    }
    console.error('Image loading failed');
    return false;
  } catch (err) {
    console.error('Image test failed:', err);
    return false;
  }
};

export const runAllTests = async () => {
  console.log('Starting app tests...');
  
  const supabaseTest = await testSupabaseConnection();
  console.log('Supabase test:', supabaseTest ? 'PASSED' : 'FAILED');
  
  const apiTest = await testApiConnection();
  console.log('API test:', apiTest ? 'PASSED' : 'FAILED');
  
  const imageTest = await testImageLoading();
  console.log('Image test:', imageTest ? 'PASSED' : 'FAILED');
  
  return supabaseTest && apiTest && imageTest;
}; 