import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'add your supabase url here';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'add your supabase anon key here';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!supabase) {
  console.error('Failed to initialize Supabase client');
}
