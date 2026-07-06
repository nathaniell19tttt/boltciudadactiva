import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Image, TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';
import { supabase } from '@/lib/supabase';
import { getRegistrationData, clearRegistrationData } from '@/lib/registrationStore';

const PRIMARY = '#1976D2';
const SUCCESS_COLOR = '#2E7D32';
const ERROR = '#D32F2F';
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const { theme, isDark } = useTheme();

  const registrationData = getRegistrationData();
  const email = registrationData.email;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const showSuccess = useCallback(() => {
    setSuccess(true);
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        if (role === 'trabajador') {
          router.replace('/worker-signup-profile' as any);
        } else {
          router.replace('/company-signup-profile' as any);
        }
      }, 1800);
    });
  }, [role, router]);

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError(`Ingresa los ${OTP_LENGTH} dígitos del código`);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      });

      if (verifyError) {
        setError('Código incorrecto o expirado. Intenta de nuevo.');
        return;
      }

      const user = data.user;
      if (!user) { setError('Error de verificación. Intenta de nuevo.'); return; }

      const { password } = getRegistrationData();

      if (password) {
        await supabase.auth.updateUser({ password });
      }

      await supabase.from('users').upsert({
        id: user.id,
        email,
        role: role || 'trabajador',
        status: 'active',
      }, { onConflict: 'id' });

      showSuccess();
    } catch (err: any) {
      setError(err.message || 'Error de verificación');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(RESEND_SECONDS);
    setError(null);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();

    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
  };

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9a-zA-Z]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const maskedEmail = email
    ? email.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) =>
        first + '*'.repeat(Math.min(middle.length, 4)) + domain)
    : '';

  const bg = isDark ? theme.colors.background : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <View style={[styles.backBtnInner, { backgroundColor: isDark ? theme.colors.surfaceVariant : '#F5F7FA' }]}>
              <ArrowLeft size={22} color={theme.colors.text} />
            </View>
          </TouchableOpacity>

          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Illustration */}
            <View style={styles.illustrationWrap}>
              <View style={[styles.illustrationOuter, { backgroundColor: 'rgba(25,118,210,0.08)' }]}>
                <View style={[styles.illustrationInner, { backgroundColor: 'rgba(25,118,210,0.15)' }]}>
                  <Mail size={48} color={PRIMARY} strokeWidth={1.5} />
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: PRIMARY }]}>
                <Text style={styles.badgeText}>✓</Text>
              </View>
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>Verifica tu correo{'\n'}electrónico</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Hemos enviado un código de verificación a tu correo electrónico{' '}
              <Text style={[styles.emailHighlight, { color: theme.colors.text }]}>{maskedEmail}</Text>
              {'. '}Ingrésalo para continuar.
            </Text>
          </Animated.View>

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={ref => { inputRefs.current[i] = ref; }}
                style={[
                  styles.otpBox,
                  {
                    color: theme.colors.text,
                    borderColor: digit ? PRIMARY : (isDark ? theme.colors.border : '#E0E0E0'),
                    backgroundColor: digit ? (isDark ? 'rgba(25,118,210,0.1)' : '#EEF4FF') : (isDark ? theme.colors.surfaceVariant : '#F8F9FA'),
                  },
                ]}
                value={digit}
                onChangeText={v => handleOtpChange(v, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="default"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
                autoComplete="one-time-code"
              />
            ))}
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={[styles.errorText, { color: ERROR }]}>{error}</Text>
            </View>
          )}

          {/* Verify button */}
          <TouchableOpacity
            style={[styles.verifyBtn, { backgroundColor: loading ? '#90CAF9' : PRIMARY, opacity: loading ? 0.85 : 1 }]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyBtnText}>{loading ? 'Verificando...' : 'Verificar'}</Text>
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendSection}>
            <Text style={[styles.resendLabel, { color: theme.colors.textSecondary }]}>
              ¿No recibiste el código?
            </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={[styles.resendLink, { color: PRIMARY }]}>Reenviar código</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.resendTimer, { color: theme.colors.textTertiary }]}>
                Reenviar en {resendTimer}s
              </Text>
            )}
          </View>

          {/* Change email */}
          <TouchableOpacity style={styles.changeEmail} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={[styles.changeEmailText, { color: theme.colors.textSecondary }]}>
              Cambiar dirección de correo
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success overlay */}
      {success && (
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <View style={[styles.successIconWrap, { backgroundColor: 'rgba(46,125,50,0.1)' }]}>
              <CheckCircle size={64} color={SUCCESS_COLOR} />
            </View>
            <Text style={[styles.successTitle, { color: '#1A1A2E' }]}>¡Correo verificado!</Text>
            <Text style={[styles.successSubtitle, { color: '#5C6370' }]}>
              Continuando al siguiente paso...
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', marginTop: 8, marginBottom: 20 },
  backBtnInner: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  illustrationWrap: { alignItems: 'center', marginBottom: 28, position: 'relative' },
  illustrationOuter: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center' },
  illustrationInner: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', bottom: 8, right: '30%', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2.5, borderColor: '#FFFFFF' },
  badgeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginBottom: 12, lineHeight: 34 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 4 },
  emailHighlight: { fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  otpBox: {
    width: 48, height: 58, borderRadius: 14, borderWidth: 2,
    fontSize: 22, fontWeight: '700', textAlign: 'center',
  },
  errorBox: { alignItems: 'center', marginBottom: 16 },
  errorText: { fontSize: 13, textAlign: 'center' },
  verifyBtn: {
    height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  verifyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resendSection: { alignItems: 'center', marginBottom: 16 },
  resendLabel: { fontSize: 14, marginBottom: 6 },
  resendLink: { fontSize: 14, fontWeight: '700' },
  resendTimer: { fontSize: 14 },
  changeEmail: { alignItems: 'center' },
  changeEmailText: { fontSize: 13, textDecorationLine: 'underline' },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  successCard: { alignItems: 'center', paddingHorizontal: 40 },
  successIconWrap: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontSize: 26, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  successSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
