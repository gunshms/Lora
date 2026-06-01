import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

// Public client credentials are safe to expose in client-side bundles (this is the Supabase anon key)
const DEFAULT_URL = "https://kqfzxejypkgvqwtdfpge.supabase.co";
const DEFAULT_KEY = "sb_publishable_sbknzYwccISEVGsYEK_TAA_Ad3g2G3p";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Initializes and returns the Supabase client.
 * Uses hardcoded defaults to ensure zero-setup on production deploys like Netlify/Vercel.
 */
export function getSupabaseClient(customConfig?: SupabaseConfig | null): SupabaseClient | null {
  // 1. If custom configuration is provided (from settings if overridden)
  if (customConfig && customConfig.url && customConfig.anonKey) {
    try {
      const cleanUrl = customConfig.url.trim();
      const cleanKey = customConfig.anonKey.trim();
      
      if (cleanUrl.startsWith("http") && cleanKey.length > 10) {
        supabaseInstance = createClient(cleanUrl, cleanKey, {
          auth: { persistSession: false },
        });
        return supabaseInstance;
      }
    } catch (error) {
      console.error("Erro ao criar cliente Supabase customizado:", error);
      return null;
    }
  }

  // 2. Return already initialized instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // 3. Fallback to environment variables if available
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    try {
      supabaseInstance = createClient(envUrl.trim(), envKey.trim(), {
        auth: { persistSession: false },
      });
      return supabaseInstance;
    } catch (error) {
      console.error("Erro ao criar cliente Supabase com vars:", error);
    }
  }

  // 4. Ultimate fallback to hardcoded default credentials (ensures zero-setup online)
  try {
    supabaseInstance = createClient(DEFAULT_URL, DEFAULT_KEY, {
      auth: { persistSession: false },
    });
    return supabaseInstance;
  } catch (error) {
    console.error("Erro ao criar cliente Supabase padrão:", error);
    return null;
  }
}
