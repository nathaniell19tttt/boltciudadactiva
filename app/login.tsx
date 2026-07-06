import { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Pressable, Animated, TextInput, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { OAuthResult } from '@/lib/oauth';

const PRIMARY = '#1976D2';
const ERROR_COLOR = '#D32F2F';
const { width } = Dimensions.get('window');
const FORM_MAX = Math.min(width - 48, 480);

export default function LoginScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { signIn, signInWithGoogle, signInWithLinkedIn, loading, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'linkedin' | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'trabajador') router.replace('/(worker)');
      else if (user.role === 'empresa') router.replace('/(company)');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos');
      return;
    }
    setError(null);
    const result = await signIn(email.trim().toLowerCase(), password);
    if (result.error) {
      const msg = result.error;
      if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
        setError('Correo o contraseña incorrectos');
      } else if (msg.includes('Email not confirmed')) {
        setError('Confirma tu correo antes de iniciar sesión');
      } else {
        setError(msg);
      }
    }
  };

  const bg = isDark ? theme.colors.background : '#FFFFFF';
  const inputBg = isDark ? theme.colors.surfaceVariant : '#F8F9FA';
  const inputBorder = isDark ? theme.colors.border : '#E0E0E0';

  const handleOAuthResult = (result: OAuthResult) => {
    if (result.cancelled) {
      setError('Autenticacion cancelada');
    } else if (result.error) {
      setError(result.error);
    }
    setOauthLoading(null);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setOauthLoading('google');
    const result = await signInWithGoogle();
    handleOAuthResult(result);
  };

  const handleLinkedInSignIn = async () => {
    setError(null);
    setOauthLoading('linkedin');
    const result = await signInWithLinkedIn();
    handleOAuthResult(result);
  };

  const SocialBtn = ({ label, icon, provider, onPress }: { label: string; icon: string; provider: 'google' | 'linkedin'; onPress: () => void }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const isLoading = oauthLoading === provider;

    return (
      <Pressable
        onPressIn={() => !isLoading && Animated.spring(scale, { toValue: 0.97, friction: 10, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 10, useNativeDriver: true }).start()}
        onPress={onPress}
        disabled={loading || oauthLoading !== null}
        accessibilityLabel={label}
      >
        <Animated.View style={[styles.socialBtn, { backgroundColor: inputBg, borderColor: inputBorder, transform: [{ scale }], opacity: isLoading ? 0.7 : 1 }]}>
          <Text style={styles.socialIcon}>{icon}</Text>
          <Text style={[styles.socialLabel, { color: theme.colors.text }]}>
            {isLoading ? 'Conectando...' : label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <View style={[styles.backBtnInner, { backgroundColor: isDark ? theme.colors.surfaceVariant : '#F5F7FA' }]}>
                <ArrowLeft size={20} color={theme.colors.text} />
              </View>
            </TouchableOpacity>

            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <Text style={[styles.title, { color: theme.colors.text }]}>¡HOLA DE NUEVO!</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Inicia sesión para continuar.
              </Text>
            </Animated.View>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Correo electrónico</Text>
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

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Contraseña</Text>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <Lock size={18} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: theme.colors.text }]}
                  placeholder="Tu contraseña"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <Eye size={18} color={theme.colors.textSecondary} />
                    : <EyeOff size={18} color={theme.colors.textSecondary} />}
                </TouchableOpacity>
              </View>
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={[styles.forgotText, { color: PRIMARY }]}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => ({ opacity: pressed || loading ? 0.85 : 1 })}
            >
              <View style={[styles.primaryBtn, { backgroundColor: loading ? '#90CAF9' : PRIMARY }]}>
                <Text style={styles.primaryBtnText}>
                  {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Text>
              </View>
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.divLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.divText, { color: theme.colors.textSecondary }]}>o continúa con</Text>
              <View style={[styles.divLine, { backgroundColor: theme.colors.border }]} />
            </View>

            {/* Social buttons */}
            <SocialBtn label="Continuar con Google" icon="G" provider="google" onPress={handleGoogleSignIn} />
            <View style={{ height: 10 }} />
            <SocialBtn label="Continuar con LinkedIn" icon="in" provider="linkedin" onPress={handleLinkedInSignIn} />

            {/* Register link */}
            <View style={styles.linkRow}>
              <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>¿No tienes una cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={[styles.linkAction, { color: PRIMARY }]}> Registrarse</Text>
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
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: FORM_MAX,
    paddingHorizontal: 24,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 28 },
  backBtnInner: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  title: {
    fontSize: 28, fontWeight: '800', letterSpacing: 0.5,
    marginBottom: 8, textAlign: 'center',
  },
  subtitle: {
    fontSize: 15, lineHeight: 22, marginBottom: 32, textAlign: 'center',
  },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 52,
  },
  textInput: { flex: 1, fontSize: 15 },
  errorBox: {
    borderRadius: 10, padding: 12, marginBottom: 12,
    backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: 'rgba(211,47,47,0.2)',
  },
  errorText: { fontSize: 13, textAlign: 'center', color: ERROR_COLOR },
  forgotRow: { alignItems: 'center', marginBottom: 20, marginTop: 4 },
  forgotText: { fontSize: 14, fontWeight: '600' },
  primaryBtn: {
    height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28, shadowRadius: 10, elevation: 6,
    marginBottom: 20,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  divLine: { flex: 1, height: 1 },
  divText: { marginHorizontal: 12, fontSize: 13 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 52, borderRadius: 14, borderWidth: 1.5, gap: 10,
    width: '100%',
  },
  socialIcon: { fontSize: 17, fontWeight: '800', color: '#333' },
  socialLabel: { fontSize: 15, fontWeight: '600' },
  linkRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 24,
  },
  linkText: { fontSize: 14 },
  linkAction: { fontSize: 14, fontWeight: '700' },
});
