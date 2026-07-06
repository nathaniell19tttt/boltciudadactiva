import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Pressable, Animated, TextInput, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';
import { supabase } from '@/lib/supabase';
import { setRegistrationData } from '@/lib/registrationStore';

const PRIMARY = '#1976D2';
const ERROR_COLOR = '#D32F2F';
const SUCCESS_COLOR = '#388E3C';
const { width } = Dimensions.get('window');
const FORM_MAX = Math.min(width - 48, 480);

export default function RegisterWorkerScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  const rules = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
  const passwordValid = rules.minLength && rules.hasUpper && rules.hasLower && rules.hasNumber;
  const showRules = passwordTouched && password.length > 0 && !passwordValid;

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleContinue = async () => {
    setError(null);
    if (!email.trim()) { setError('Ingresa tu correo electrónico'); return; }
    if (!validateEmail(email.trim())) { setError('El correo electrónico no es válido'); return; }
    if (!password) { setPasswordTouched(true); setError('Ingresa una contraseña'); return; }
    if (!passwordValid) { setPasswordTouched(true); setError('La contraseña no cumple todos los requisitos'); return; }
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }
    if (!termsAccepted) { setError('Debes aceptar los Términos y Condiciones para continuar'); return; }

    setLoading(true);
    try {
      const { data: existingRole } = await supabase.rpc('check_email_role', {
        check_email: email.trim().toLowerCase(),
      });
      if (existingRole && existingRole !== 'trabajador') {
        setError('Este correo ya está registrado como empresa. Usa otro correo.');
        return;
      }
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
      });
      if (otpError) { setError(otpError.message); return; }

      setRegistrationData({ email: email.trim().toLowerCase(), password, role: 'trabajador' });
      router.push('/verify-email?role=trabajador' as any);
    } catch (err: any) {
      setError(err.message || 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? theme.colors.background : '#FFFFFF';
  const inputBg = isDark ? theme.colors.surfaceVariant : '#F8F9FA';
  const inputBorder = isDark ? theme.colors.border : '#E0E0E0';

  const SocialBtn = ({ label, icon }: { label: string; icon: string }) => {
    const scale = useRef(new Animated.Value(1)).current;
    return (
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, friction: 10, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 10, useNativeDriver: true }).start()}
        onPress={() => {}}
        accessibilityLabel={label}
      >
        <Animated.View style={[styles.socialBtn, { backgroundColor: inputBg, borderColor: inputBorder, transform: [{ scale }] }]}>
          <Text style={styles.socialIcon}>{icon}</Text>
          <Text style={[styles.socialLabel, { color: theme.colors.text }]}>{label}</Text>
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
              <Text style={[styles.title, { color: theme.colors.text }]}>Crear cuenta</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Comienza tu camino hacia nuevas oportunidades laborales.
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
                  placeholder="Contraseña"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setPasswordTouched(true); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <Eye size={18} color={theme.colors.textSecondary} />
                    : <EyeOff size={18} color={theme.colors.textSecondary} />}
                </TouchableOpacity>
              </View>
              {/* Password requirements shown below the input */}
              {showRules && (
                <View style={styles.rulesBox}>
                  {!rules.minLength && <Text style={styles.ruleText}>Debe tener al menos 8 caracteres.</Text>}
                  {!rules.hasUpper && <Text style={styles.ruleText}>Debe contener una mayuscula.</Text>}
                  {!rules.hasLower && <Text style={styles.ruleText}>Debe contener una minuscula.</Text>}
                  {!rules.hasNumber && <Text style={styles.ruleText}>Debe contener un numero.</Text>}
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Confirmar contraseña</Text>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                <Lock size={18} color={theme.colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: theme.colors.text }]}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  {showConfirm
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

            {/* Continue button */}
            <Pressable
              onPress={handleContinue}
              disabled={loading}
              style={({ pressed }) => ({ opacity: pressed || loading ? 0.85 : 1, marginTop: 4 })}
            >
              <View style={[styles.primaryBtn, { backgroundColor: loading ? '#90CAF9' : PRIMARY }]}>
                <Text style={styles.primaryBtnText}>
                  {loading ? 'Enviando código...' : 'Continuar'}
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
            <SocialBtn label="Continuar con Google" icon="G" />
            <View style={{ height: 10 }} />
            <SocialBtn label="Continuar con LinkedIn" icon="in" />

            {/* Login link */}
            <View style={styles.linkRow}>
              <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>¿Ya tienes una cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.linkAction, { color: PRIMARY }]}> Iniciar sesión</Text>
              </TouchableOpacity>
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setTermsAccepted(!termsAccepted)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                {
                  borderColor: termsAccepted ? SUCCESS_COLOR : theme.colors.border,
                  backgroundColor: termsAccepted ? SUCCESS_COLOR : 'transparent',
                },
              ]}>
                {termsAccepted && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                {'Acepto los '}
                <Text style={[styles.termsLink, { color: PRIMARY }]} onPress={() => router.push('/terms' as any)}>
                  Términos y Condiciones
                </Text>
                {' y la '}
                <Text style={[styles.termsLink, { color: PRIMARY }]} onPress={() => router.push('/privacy' as any)}>
                  Política de Privacidad
                </Text>
              </Text>
            </TouchableOpacity>
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
  backBtn: { alignSelf: 'flex-start', marginBottom: 20 },
  backBtnInner: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  title: {
    fontSize: 28, fontWeight: '800', letterSpacing: -0.3,
    marginBottom: 8, textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, lineHeight: 21, marginBottom: 28, textAlign: 'center',
  },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 52,
  },
  textInput: { flex: 1, fontSize: 15 },
  rulesBox: { marginTop: 6, gap: 2 },
  ruleText: { fontSize: 12, color: ERROR_COLOR, lineHeight: 18 },
  errorBox: {
    borderRadius: 10, padding: 12, marginBottom: 12,
    backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: 'rgba(211,47,47,0.2)',
  },
  errorText: { fontSize: 13, textAlign: 'center', color: ERROR_COLOR },
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
    marginTop: 20, marginBottom: 16,
  },
  linkText: { fontSize: 14 },
  linkAction: { fontSize: 14, fontWeight: '700' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', marginTop: 1, flexShrink: 0,
  },
  checkMark: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  termsText: { flex: 1, fontSize: 13, lineHeight: 20 },
  termsLink: { fontWeight: '600' },
});
