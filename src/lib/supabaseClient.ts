import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_ENV_URL = 'https://rvoryldhaoxwranfsxnh.supabase.co';
const FALLBACK_ENV_KEY = 'sb_publishable_uufSg2hSi-jkMkjBiNVAbw_HCYwXqTX';

const FALLBACK_DXG_URL = 'https://dxgsuxbvhebymyuesdbm.supabase.co';
const FALLBACK_DXG_KEY = 'sb_publishable_fLNyExGVvr2_3JZoBucq0A_2G-B9JoQ';

// Read Supabase credentials from Vite environment variables with verified fallback
const rawUrl: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)) ||
  '';

const rawKey: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== 'undefined' && (process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY)) ||
  '';

export const safeUrl: string =
  rawUrl &&
  rawUrl.startsWith('https://') &&
  !rawUrl.includes('your-project') &&
  !rawUrl.includes('jeywaveyokdbxcloljsj')
    ? rawUrl
    : FALLBACK_ENV_URL;

export const safeKey: string = (() => {
  if (rawKey && !rawKey.includes('your-publishable-key')) {
    return rawKey;
  }
  if (safeUrl.includes('dxgsuxbvhebymyuesdbm')) {
    return FALLBACK_DXG_KEY;
  }
  return FALLBACK_ENV_KEY;
})();

export const isSupabaseConfigured: boolean = true;

// Custom fetch to route requests through same-origin /api/supabase in browser environments
// This eliminates "Failed to fetch" errors caused by iframe sandbox / cross-origin policies
const proxyFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as Request).url;

  // On static/Netlify hosts or when outside iframe sandbox, direct requests should be preferred
  const isStaticDeploy =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('netlify.app') ||
      window.location.hostname.includes('github.io') ||
      window.location.hostname.includes('shokhoutfits.com'));

  if (!isStaticDeploy && typeof window !== 'undefined' && url.includes('.supabase.co')) {
    const proxyUrl = url.replace(/https:\/\/[^/]+\.supabase\.co/, '/api/supabase');
    const enrichedHeaders = new Headers(init?.headers || {});
    enrichedHeaders.set('x-supabase-target-url', safeUrl);
    enrichedHeaders.set('x-supabase-client-key', safeKey);
    if (!enrichedHeaders.has('apikey')) {
      enrichedHeaders.set('apikey', safeKey);
    }
    if (!enrichedHeaders.has('Authorization') && !enrichedHeaders.has('authorization')) {
      enrichedHeaders.set('Authorization', `Bearer ${safeKey}`);
    }
    return fetch(proxyUrl, {
      ...init,
      headers: enrichedHeaders,
    }).catch(() => fetch(input, init));
  }

  return fetch(input, init);
};

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'shokh_supabase_auth_token',
  },
  global: {
    fetch: proxyFetch,
  },
});

export function logSupabaseError(operation: string, error: any) {
  if (error) {
    console.error(`[Supabase Error in "${operation}"]:`, {
      message: error.message || error,
      code: error.code,
      details: error.details,
      hint: error.hint,
      raw: error,
    });
  }
}

export default supabase;
