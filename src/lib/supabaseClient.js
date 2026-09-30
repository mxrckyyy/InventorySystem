import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL: Supabase environment variables are missing! Check Vercel project settings.'
  );
}

// Fallback to dummy values only if completely missing to prevent build-time crashes,
// but ensure real VITE_ variables are prioritized without hardcoded project domains.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
