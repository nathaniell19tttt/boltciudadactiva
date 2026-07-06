import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Send } from 'lucide-react-native';
import { Button, Input, Screen } from '@/components/ui';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Spacing } from '@/constants';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await resetPassword(email);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Screen>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/login')}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.successContainer}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.success[100] }]}>
              <Mail size={48} color={theme.colors.success[600]} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              Correo enviado
            </Text>

            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              Hemos enviado un enlace para restablecer tu contraseña a:
            </Text>

            <Text style={[styles.emailSent, { color: theme.colors.primary[600] }]}>
              {email}
            </Text>

            <Button
              title="Volver a iniciar sesión"
              onPress={() => router.replace('/login')}
              fullWidth
              size="lg"
              style={styles.button}
            />

            <TouchableOpacity onPress={() => setSent(false)}>
              <Text style={[styles.resend, { color: theme.colors.primary[500] }]}>
                No recibí el correo, reenviar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            ¿Olvidaste tu contraseña?
          </Text>

          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
          </Text>

          {error && (
            <View style={[styles.errorBox, { backgroundColor: theme.colors.error[100] }]}>
              <Text style={[styles.errorText, { color: theme.colors.error[700] }]}>{error}</Text>
            </View>
          )}

          <Input
            label="Correo electrónico"
            placeholder="tu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={theme.colors.textSecondary} />}
            required
          />

          <Button
            title="Enviar enlace"
            onPress={handleReset}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.button}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.screenPadding,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 15,
    marginBottom: Spacing['2xl'],
  },
  errorBox: {
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.md,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing['2xl'],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  emailSent: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  resend: {
    fontSize: 14,
    marginTop: Spacing.lg,
    fontWeight: '500',
  },
});
