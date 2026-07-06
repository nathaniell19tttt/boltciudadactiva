import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated, TextInput, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';
import { supabase } from '@/lib/supabase';

const PRIMARY = '#1976D2';
const SUCCESS_COLOR = '#2E7D32';
const ERROR = '#D32F2F';
const { width } = Dimensions.get('window');
const FORM_MAX = Math.min(width - 48, 480);

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleReset = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Ingresa tu correo electronico');
      return;
    }
    if (!validateEmail(email.trim())) {
      setError('El correo electronico no es valido');
      return;
    }

    setLoading(true);

    try {
      // Send OTP code for password recovery
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'ciudadactiva://reset-password',
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el codigo');
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? theme.colors.background : '#FFFFFF';
  const inputBg = isDark ? theme.colors.surfaceVariant : '#F8F9FA';
  const inputBorder = isDark ? theme.colors.border : '#E0E0E0';

  if (sent) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/login')}>
            <View style={[styles.backBtnInner, { backgroundColor: isDark ? theme.colors.surfaceVariant : '#F5F7FA' }]}>
              <ArrowLeft size={22} color={theme.colors.text} />
            </View>
          </TouchableOpacity>

          <View style={styles.successContainer}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(46,125,50,0.1)' }]}>
              <Mail size={48} color={SUCCESS_COLOR} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              Codigo enviado
            </Text>

            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              Hemos enviado un codigo de verificacion de 6 digitos a:
            </Text>

            <Text style={[styles.emailSent, { color: PRIMARY }]}>
              {email}
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: PRIMARY }]}
              onPress={() => router.push(`/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Ingresar codigo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendBtn}
              onPress={() => {
                setSent(false);
                setEmail('');
              }}
            >
              <Text style={[styles.resendText, { color: theme.colors.textSecondary }]}>
                No recibi el codigo, reintentar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <View style={[styles.backBtnInner, { backgroundColor: isDark ? theme.colors.surfaceVariant : '#F5F7FA' }]}>
                <ArrowLeft size={22} color={theme.colors.text} />
              </View>
            </TouchableOpacity>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <Text style={[styles.title, { color: theme.colors.text }]}>Olvidaste tu contrasena?</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Ingresa tu correo electronico y te enviaremos un codigo de verificacion para restablecerla.
              </Text>
            </Animated.View>

            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Correo electronico</Text>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <Mail size={18} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: theme.colors.text }]}
                  placeholder="tu@email.com"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={[styles.errorText, { color: ERROR }]}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: loading ? '#90CAF9' : PRIMARY, opacity: loading ? 0.85 : 1 }]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Enviando...' : 'Enviar codigo'}</Text>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
                Recordaste tu contrasena?
              </Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={[styles.loginLink, { color: PRIMARY }]}> Iniciar sesion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', paddingVertical: 16, paddingBottom: 40 },
  formContainer: { width: '100%', maxWidth: FORM_MAX, paddingHorizontal: 24 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 28 },
  backBtnInner: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8, lineHeight: 36 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 52,
  },
  textInput: { flex: 1, fontSize: 15 },
  errorBox: { alignItems: 'center', marginBottom: 16 },
  errorText: { fontSize: 13, textAlign: 'center' },
  primaryBtn: {
    height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 6,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: '700' },
  container: { flex: 1, paddingHorizontal: 24 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 40 },
  iconContainer: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  message: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emailSent: { fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 28 },
  resendBtn: { marginTop: 16, padding: 8 },
  resendText: { fontSize: 14 },
});
