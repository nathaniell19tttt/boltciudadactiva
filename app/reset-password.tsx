import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  TextInput, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';
import { supabase } from '@/lib/supabase';

const PRIMARY = '#1976D2';
const SUCCESS_COLOR = '#2E7D32';
const ERROR = '#D32F2F';
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function ResetPasswordVerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const { theme, isDark } = useTheme();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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

  const rules = {
    minLength: newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(newPassword),
    hasLower: /[a-z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
  };
  const passwordValid = rules.minLength && rules.hasUpper && rules.hasLower && rules.hasNumber;

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError(`Ingresa los ${OTP_LENGTH} digitos del codigo`);
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email || '',
        token: code,
        type: 'recovery',
      });

      if (verifyError) {
        if (verifyError.message.includes('expired')) {
          setError('El codigo ha expirado. Solicita uno nuevo.');
        } else {
          setError('Codigo incorrecto. Intenta de nuevo.');
        }
        setLoading(false);
        return;
      }

      setVerified(true);
    } catch (err: any) {
      setError(err.message || 'Error de verificacion');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError('Ingresa tu nueva contrasena');
      return;
    }
    if (!passwordValid) {
      setError('La contrasena no cumple los requisitos de seguridad');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      showSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar contrasena');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = useCallback(() => {
    setResetSuccess(true);
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    });
  }, [router]);

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(RESEND_SECONDS);
    setError(null);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();

    const { error: resendError } = await supabase.auth.resetPasswordForEmail(email || '', {
      redirectTo: 'ciudadactiva://reset-password-verify',
    });

    if (resendError) {
      setError('Error al reenviar el codigo. Intenta de nuevo.');
    }
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

  if (resetSuccess) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <View style={[styles.successIconWrap, { backgroundColor: 'rgba(46,125,50,0.1)' }]}>
              <CheckCircle size={64} color={SUCCESS_COLOR} />
            </View>
            <Text style={[styles.successTitle, { color: '#1A1A2E' }]}>Contrasena actualizada</Text>
            <Text style={[styles.successSubtitle, { color: '#5C6370' }]}>
              Ahora puedes iniciar sesion con tu nueva contrasena.
            </Text>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    );
  }

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
            <View style={styles.illustrationWrap}>
              <View style={[styles.illustrationOuter, { backgroundColor: 'rgba(25,118,210,0.08)' }]}>
                <View style={[styles.illustrationInner, { backgroundColor: 'rgba(25,118,210,0.15)' }]}>
                  <Lock size={48} color={PRIMARY} strokeWidth={1.5} />
                </View>
              </View>
            </View>

            {!verified ? (
              <>
                <Text style={[styles.title, { color: theme.colors.text }]}>Restablecer contrasena</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Hemos enviado un codigo de verificacion a{' '}
                  <Text style={[styles.emailHighlight, { color: theme.colors.text }]}>{maskedEmail}</Text>
                  {'. '}Ingresa el codigo para continuar.
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.title, { color: theme.colors.text }]}>Nueva contrasena</Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  Crea una nueva contrasena segura para tu cuenta.
                </Text>
              </>
            )}
          </Animated.View>

          {!verified ? (
            <>
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

              <TouchableOpacity
                style={[styles.verifyBtn, { backgroundColor: loading ? '#90CAF9' : PRIMARY, opacity: loading ? 0.85 : 1 }]}
                onPress={handleVerifyOtp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.verifyBtnText}>{loading ? 'Verificando...' : 'Verificar codigo'}</Text>
              </TouchableOpacity>

              <View style={styles.resendSection}>
                <Text style={[styles.resendLabel, { color: theme.colors.textSecondary }]}>
                  No recibiste el codigo?
                </Text>
                {canResend ? (
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                    <Text style={[styles.resendLink, { color: PRIMARY }]}>Reenviar codigo</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.resendTimer, { color: theme.colors.textTertiary }]}>
                    Reenviar en {resendTimer}s
                  </Text>
                )}
              </View>
            </>
          ) : (
            <>
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Nueva contrasena</Text>
                <View style={[styles.inputRow, { backgroundColor: isDark ? theme.colors.surfaceVariant : '#F8F9FA', borderColor: isDark ? theme.colors.border : '#E0E0E0' }]}>
                  <Lock size={18} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.text }]}
                    placeholder="Minimo 8 caracteres"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword
                      ? <EyeOff size={18} color={theme.colors.textSecondary} />
                      : <Eye size={18} color={theme.colors.textSecondary} />}
                  </TouchableOpacity>
                </View>
                {newPassword.length > 0 && (
                  <View style={styles.rulesWrap}>
                    <Text style={[styles.ruleText, { color: rules.minLength ? SUCCESS_COLOR : '#9E9E9E' }]}>
                      {rules.minLength ? 'ok' : '-'} Minimo 8 caracteres
                    </Text>
                    <Text style={[styles.ruleText, { color: rules.hasUpper ? SUCCESS_COLOR : '#9E9E9E' }]}>
                      {rules.hasUpper ? 'ok' : '-'} Una mayuscula
                    </Text>
                    <Text style={[styles.ruleText, { color: rules.hasLower ? SUCCESS_COLOR : '#9E9E9E' }]}>
                      {rules.hasLower ? 'ok' : '-'} Una minuscula
                    </Text>
                    <Text style={[styles.ruleText, { color: rules.hasNumber ? SUCCESS_COLOR : '#9E9E9E' }]}>
                      {rules.hasNumber ? 'ok' : '-'} Un numero
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Confirmar contrasena</Text>
                <View style={[styles.inputRow, { backgroundColor: isDark ? theme.colors.surfaceVariant : '#F8F9FA', borderColor: isDark ? theme.colors.border : '#E0E0E0' }]}>
                  <Lock size={18} color={theme.colors.textSecondary} />
                  <TextInput
                    style={[styles.textInput, { color: theme.colors.text }]}
                    placeholder="Repite la contrasena"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={[styles.errorText, { color: ERROR }]}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.verifyBtn, { backgroundColor: loading ? '#90CAF9' : PRIMARY, opacity: loading ? 0.85 : 1 }]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.verifyBtnText}>{loading ? 'Actualizando...' : 'Actualizar contrasena'}</Text>
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', marginTop: 8, marginBottom: 20 },
  backBtnInner: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  illustrationWrap: { alignItems: 'center', marginBottom: 28 },
  illustrationOuter: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center' },
  illustrationInner: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3, marginBottom: 12, lineHeight: 34 },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32, paddingHorizontal: 4 },
  emailHighlight: { fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 },
  otpBox: {
    width: 48, height: 58, borderRadius: 14, borderWidth: 2,
    fontSize: 22, fontWeight: '700', textAlign: 'center',
  },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 52,
  },
  textInput: { flex: 1, fontSize: 15 },
  rulesWrap: { marginTop: 10, paddingHorizontal: 4 },
  ruleText: { fontSize: 12, marginBottom: 4 },
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
