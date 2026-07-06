import { supabase } from './supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// Complete any pending WebBrowser sessions
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'linkedin';

export interface OAuthResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
}

interface OAuthConfig {
  provider: OAuthProvider;
  redirectTo?: string;
}

const PROVIDER_CONFIG: Record<OAuthProvider, { supabaseProvider: 'google' | 'linkedin_oidc' }> = {
  google: { supabaseProvider: 'google' },
  linkedin: { supabaseProvider: 'linkedin_oidc' },
};

export async function signInWithOAuth(config: OAuthConfig): Promise<OAuthResult> {
  const { provider, redirectTo } = config;
  const providerConfig = PROVIDER_CONFIG[provider];

  if (!providerConfig) {
    return { success: false, error: `Proveedor OAuth no soportado: ${provider}` };
  }

  try {
    const redirectUri = redirectTo || makeRedirectUri({
      scheme: 'ciudadactiva',
      path: 'auth/callback',
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: providerConfig.supabaseProvider,
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      if (error.message.includes('cancelled') || error.message.includes('canceled')) {
        return { success: false, cancelled: true, error: 'Autenticacion cancelada' };
      }
      return { success: false, error: error.message };
    }

    if (!data.url) {
      return { success: false, error: 'No se recibio URL de autenticacion' };
    }

    // On web, Supabase handles the redirect automatically
    // On native, open the browser for OAuth flow
    if (Platform.OS !== 'web') {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
        {
          showTitle: false,
          enableDefaultShareMenuItem: false,
        }
      );

      if (result.type === 'cancel') {
        return { success: false, cancelled: true, error: 'Autenticacion cancelada por el usuario' };
      }

      if (result.type === 'dismiss') {
        return { success: false, cancelled: true, error: 'Autenticacion cancelada' };
      }

      if (result.type === 'success' && result.url) {
        // Parse the URL for tokens
        const url = new URL(result.url);
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');
        const errorParam = url.searchParams.get('error');
        const errorDesc = url.searchParams.get('error_description');

        if (errorParam) {
          return { success: false, error: errorDesc || errorParam };
        }

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            return { success: false, error: sessionError.message };
          }

          return { success: true };
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    if (err.message?.includes('User cancelled')) {
      return { success: false, cancelled: true, error: 'Autenticacion cancelada' };
    }
    return { success: false, error: err.message || 'Error desconocido en autenticacion OAuth' };
  }
}

export async function handleOAuthCallback(url: string): Promise<OAuthResult> {
  try {
    const urlObj = new URL(url);
    const accessToken = urlObj.searchParams.get('access_token');
    const refreshToken = urlObj.searchParams.get('refresh_token');
    const errorParam = urlObj.searchParams.get('error');
    const errorDesc = urlObj.searchParams.get('error_description');

    if (errorParam) {
      return { success: false, error: errorDesc || errorParam };
    }

    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    }

    return { success: false, error: 'No se encontraron tokens en la respuesta' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error procesando respuesta OAuth' };
  }
}

export async function checkOAuthSession(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
}

export async function getSessionFromUrl(): Promise<OAuthResult> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.session) {
      return { success: true };
    }

    return { success: false, error: 'No hay sesion activa' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error recuperando sesion' };
  }
}
