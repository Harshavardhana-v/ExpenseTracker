import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hykjbpnkenlvfhpsggmy.supabase.co';
const supabaseAnonKey = 'sb_publishable_nKbilrjRvQ_rkcTJxwJnvw_-ALdKfip';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!supabase) {
  console.error('Failed to initialize Supabase client');
}
