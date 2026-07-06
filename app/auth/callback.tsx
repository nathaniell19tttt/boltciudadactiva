import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { handleOAuthCallback, OAuthResult } from '@/lib/oauth';
import { useAuth } from '@/contexts';
import { CheckCircle, XCircle } from 'lucide-react-native';

const PRIMARY = '#1976D2';
const ERROR_COLOR = '#D32F2F';
const SUCCESS_COLOR = '#2E7D32';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { refreshProfile } = useAuth();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    processCallback();
  }, []);

  const processCallback = async () => {
    try {
      // On web, the tokens come in the URL hash
      // On native, they come via the redirect URL
      const url = window?.location?.href || '';

      let result: OAuthResult;

      if (url.includes('access_token') || url.includes('error')) {
        result = await handleOAuthCallback(url);
      } else {
        // Check if session exists already (Supabase may have set it)
        const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();

        if (session) {
          result = { success: true };
        } else {
          // Wait and poll for session
          let attempts = 0;
          let foundSession = false;

          while (attempts < 10 && !foundSession) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const { data: { session: checkSession } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
            if (checkSession) {
              foundSession = true;
            }
            attempts++;
          }

          if (foundSession) {
            result = { success: true };
          } else {
            result = { success: false, error: 'No se pudo obtener la sesion' };
          }
        }
      }

      if (result.success) {
        setStatus('success');
        await refreshProfile();

        // Redirect after short delay
        setTimeout(() => {
          router.replace('/(worker)');
        }, 1500);
      } else {
        setStatus('error');
        setError(result.error || 'Error desconocido');

        // Redirect to login after delay
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'Error procesando autenticacion');

      setTimeout(() => {
        router.replace('/login');
      }, 3000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {status === 'processing' && (
          <>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.title}>Completando inicio de sesion...</Text>
            <Text style={styles.subtitle}>Por favor espera un momento</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={64} color={SUCCESS_COLOR} />
            <Text style={[styles.title, { color: SUCCESS_COLOR }]}>Exito</Text>
            <Text style={styles.subtitle}>Redirigiendo...</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} color={ERROR_COLOR} />
            <Text style={[styles.title, { color: ERROR_COLOR }]}>Error</Text>
            <Text style={styles.subtitle}>{error || 'Error desconocido'}</Text>
            <Text style={styles.redirectText}>Redirigiendo al login...</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
  },
  redirectText: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 8,
  },
});
