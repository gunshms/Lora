import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;
let supabaseInstanceKey: string | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const getActiveConfig = (customConfig?: SupabaseConfig | null): SupabaseConfig | null => {
  const url = customConfig?.url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = customConfig?.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url?.trim().startsWith("http") || !anonKey || anonKey.trim().length <= 10) {
    return null;
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
};

export function getSupabaseClient(customConfig?: SupabaseConfig | null): SupabaseClient | null {
  const config = getActiveConfig(customConfig);
  if (!config) return null;

  const instanceKey = `${config.url}|${config.anonKey}`;
  if (supabaseInstance && supabaseInstanceKey === instanceKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        persistSession: true,
        storageKey: "thebest-supabase-auth",
      },
    });
    supabaseInstanceKey = instanceKey;
    return supabaseInstance;
  } catch (error) {
    console.error("Erro ao criar cliente Supabase:", error);
    supabaseInstance = null;
    supabaseInstanceKey = null;
    return null;
  }
}
