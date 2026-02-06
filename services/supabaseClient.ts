import { createClient } from '@supabase/supabase-js';

/**
 * NEXUS AI - Production-Hardened Cloud Configuration
 * Relies strictly on process.env for security and professional deployment.
 */
export const getSupabaseConfig = () => {
  const url = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
  const key = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  return { 
    url: url.trim(), 
    key: key.trim() 
  };
};

const config = getSupabaseConfig();

export const isSupabaseConfigured = config.url.length > 10 && config.key.length > 10;

/**
 * The Supabase client singleton.
 * In production mode, this will initialize directly using the injected system environment variables.
 */
export const supabase = isSupabaseConfigured 
  ? createClient(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }) 
  : null;