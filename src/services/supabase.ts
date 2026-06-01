import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Initializes and returns the Supabase client.
 * Supports environment variables or dynamically provided UI configurations.
 */
export function getSupabaseClient(customConfig?: SupabaseConfig | null): SupabaseClient | null {
  // 1. If custom configuration is provided directly (from UI settings), initialize a new client
  if (customConfig && customConfig.url && customConfig.anonKey) {
    try {
      // Basic sanitization
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

  // 3. Fallback to process.env environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    try {
      supabaseInstance = createClient(envUrl.trim(), envKey.trim(), {
        auth: { persistSession: false },
      });
      return supabaseInstance;
    } catch (error) {
      console.error("Erro ao criar cliente Supabase com variáveis de ambiente:", error);
      return null;
    }
  }

  return null;
}
