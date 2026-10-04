import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : (typeof process !== "undefined" ? process.env : {});
const supabaseUrl = env?.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (!env?.VITE_SUPABASE_URL || !env?.VITE_SUPABASE_ANON_KEY) {
  // Cảnh báo nếu thiếu env trên môi trường production
  if (typeof window !== "undefined" && !window.electronAPI?.isElectron) {
    console.warn("Supabase URL or Anon Key is missing in environment variables!");
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
