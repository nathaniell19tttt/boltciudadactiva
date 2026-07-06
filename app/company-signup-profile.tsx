import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Pressable, Animated, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, CheckCircle, Lock } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';
import { supabase } from '@/lib/supabase';
import { getRegistrationData, clearRegistrationData } from '@/lib/registrationStore';

const PRIMARY = '#1976D2';
const SUCCESS_COLOR = '#388E3C';
const ERROR_COLOR = '#D32F2F';

const businessTypes = [
  'Pollería', 'Restaurante', 'Bodega', 'Minimarket', 'Ferretería',
  'Farmacia', 'Panadería', 'Pastelería', 'Cafetería', 'Salón de belleza',
  'Barbería', 'Taller mecánico', 'Librería', 'Tienda de ropa', 'Botica',
  'Veterinaria', 'Academia', 'Consultorio', 'Otro',
];

const districts = [
  'Comas', 'Carabayllo', 'Puente Piedra', 'Independencia',
  'Los Olivos', 'San Martín de Porres', 'Cercado de Lima', 'Otros',
];

const responsibleRoles = [
  'Propietario', 'Administrador', 'Recursos Humanos',
  'Gerente', 'Supervisor', 'Otro',
];

export default function CompanySignupProfileScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [showSuccess, setShowSuccess] = useState(false);

  const registrationEmail = getRegistrationData().email;

  // Step 1
  const [companyName, setCompanyName] = useState('');
  const [commercialName, setCommercialName] = useState('');
  const [industry, setIndustry] = useState('');
  const [district, setDistrict] = useState('');

  // Step 2
  const [responsibleName, setResponsibleName] = useState('');
  const [responsibleRole, setResponsibleRole] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Step 3
  const [description, setDescription] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const progressAnim = useRef(new Animated.Value(1 / 3)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Success animations
  const circleScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const successTextOpacity = useRef(new Animated.Value(0)).current;
  const successTextSlide = useRef(new Animated.Value(20)).current;

  const bg = isDark ? theme.colors.background : '#FFFFFF';
  const inputBg = isDark ? theme.colors.surfaceVariant : '#F8F9FA';
  const inputBorder = isDark ? theme.colors.border : '#E0E0E0';

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step / totalSteps,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const animateStep = (next: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(next);
      setError(null);
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.spring(circleScale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(checkOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(successTextOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(successTextSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const validate = () => {
    setError(null);
    if (step === 1) {
      if (!companyName.trim()) { setError('Ingresa el nombre de tu empresa'); return false; }
      if (!industry) { setError('Selecciona el rubro de tu negocio'); return false; }
      if (!district) { setError('Selecciona el distrito'); return false; }
    }
    if (step === 2) {
      if (!responsibleName.trim()) { setError('Ingresa el nombre del responsable'); return false; }
      if (!responsibleRole) { setError('Selecciona el cargo del responsable'); return false; }
      if (!phone.trim()) { setError('Ingresa el número de teléfono'); return false; }
    }
    if (step === 3) {
      if (!confirmed) { setError('Debes confirmar que la información es verdadera'); return false; }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validate()) return;
    if (step < totalSteps) { animateStep(step + 1); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Sesión no encontrada. Inicia sesión de nuevo.'); return; }

      const { error: profileError } = await supabase.from('company_profiles').upsert({
        user_id: user.id,
        name: companyName.trim(),
        legal_name: commercialName.trim() || null,
        industry,
        district,
        department: 'Lima',
        province: 'Lima',
        address: address.trim() || null,
        phone: phone.trim(),
        description: description.trim() || null,
        employee_count: 1,
      }, { onConflict: 'user_id' });

      if (profileError) { setError('Error al guardar: ' + profileError.message); return; }

      clearRegistrationData();
      showSuccessAnimation();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const RadioChip = ({ selected, onPress, label }: { selected: boolean; onPress: () => void; label: string }) => (
    <TouchableOpacity
      style={[styles.chip, selected && { backgroundColor: PRIMARY }]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && { color: '#FFF' }]}>{label}</Text>
    </TouchableOpacity>
  );

  const InputBox = ({ placeholder, value, onChangeText, keyboardType = 'default', multiline = false, numberOfLines = 1 }: { placeholder: string; value: string; onChangeText: (v: string) => void; keyboardType?: any; multiline?: boolean; numberOfLines?: number }) => (
    <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorder, height: multiline ? 80 : 52, alignItems: multiline ? 'flex-start' : 'center', paddingVertical: multiline ? 12 : 0 }]}>
      <TextInput
        style={[styles.textInput, { color: theme.colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCorrect={false}
      />
    </View>
  );

  if (showSuccess) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: circleScale }] }]}>
            <Animated.View style={{ opacity: checkOpacity }}>
              <CheckCircle size={64} color="#FFFFFF" />
            </Animated.View>
          </Animated.View>
          <Animated.View style={{ opacity: successTextOpacity, transform: [{ translateY: successTextSlide }], alignItems: 'center' }}>
            <Text style={[styles.successTitle, { color: theme.colors.text }]}>
              ¡Bienvenido a Ciudad Activa!
            </Text>
            <Text style={[styles.successMsg, { color: theme.colors.textSecondary }]}>
              Tu empresa ha sido registrada correctamente. Ahora puedes publicar ofertas laborales, encontrar talento, gestionar postulaciones y hacer crecer tu negocio.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.successBtn, { opacity: pressed ? 0.88 : 1 }]}
              onPress={() => router.replace('/(company)')}
            >
              <Text style={styles.successBtnText}>Ir al Panel de Empresa</Text>
            </Pressable>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step > 1 ? animateStep(step - 1) : router.replace('/(company)')}>
            <View style={[styles.backBtn, { backgroundColor: isDark ? theme.colors.surfaceVariant : '#F5F7FA' }]}>
              <ArrowLeft size={20} color={theme.colors.text} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.stepLabel, { color: theme.colors.textSecondary }]}>Paso {step} de {totalSteps}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: isDark ? theme.colors.surfaceVariant : '#E8EAED' }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                backgroundColor: PRIMARY,
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              },
            ]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* STEP 1 */}
            {step === 1 && (
              <View>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Cuéntanos sobre tu empresa</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
                  Completa la información básica para comenzar a publicar ofertas laborales.
                </Text>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Nombre de la empresa o negocio *</Text>
                  <InputBox placeholder="Ej: Pollería El Buen Sabor" value={companyName} onChangeText={setCompanyName} />
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Nombre comercial (opcional)</Text>
                  <InputBox placeholder="Nombre con el que te conoce el público" value={commercialName} onChangeText={setCommercialName} />
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Rubro del negocio *</Text>
                  <View style={styles.chips}>
                    {businessTypes.map(b => (
                      <RadioChip key={b} selected={industry === b} onPress={() => setIndustry(b)} label={b} />
                    ))}
                  </View>
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Distrito *</Text>
                  <View style={styles.chips}>
                    {districts.map(d => (
                      <RadioChip key={d} selected={district === d} onPress={() => setDistrict(d)} label={d} />
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <View>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Información de contacto</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
                  Estos datos permitirán que los postulantes puedan comunicarse contigo.
                </Text>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Nombre del responsable *</Text>
                  <InputBox placeholder="Ej: María García" value={responsibleName} onChangeText={setResponsibleName} />
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Cargo del responsable *</Text>
                  <View style={styles.chips}>
                    {responsibleRoles.map(r => (
                      <RadioChip key={r} selected={responsibleRole === r} onPress={() => setResponsibleRole(r)} label={r} />
                    ))}
                  </View>
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Número de teléfono *</Text>
                  <InputBox placeholder="+51 999 999 999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>

                {/* Email read-only */}
                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Correo electrónico</Text>
                  <View style={[styles.inputRow, styles.readonlyInput, { backgroundColor: isDark ? '#2a2a2a' : '#F0F2F5', borderColor: inputBorder }]}>
                    <Lock size={16} color={theme.colors.textTertiary} style={{ marginRight: 8 }} />
                    <Text style={[styles.readonlyText, { color: theme.colors.textSecondary }]}>
                      {registrationEmail || 'correo@registrado.com'}
                    </Text>
                  </View>
                  <Text style={[styles.readonlyHint, { color: theme.colors.textTertiary }]}>
                    Este correo fue verificado durante el registro y no puede modificarse.
                  </Text>
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Dirección del negocio (opcional)</Text>
                  <InputBox placeholder="Ej: Av. Universitaria 1234, Comas" value={address} onChangeText={setAddress} />
                </View>
              </View>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <View>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Tu empresa está casi lista</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
                  Podrás completar el resto de la información más adelante desde Editar Perfil.
                </Text>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Logo de la empresa (opcional)</Text>
                  <TouchableOpacity style={[styles.uploadBox, { borderColor: inputBorder, backgroundColor: inputBg }]}>
                    <Text style={styles.uploadIcon}>🏢</Text>
                    <Text style={[styles.uploadText, { color: theme.colors.textSecondary }]}>Subir logo</Text>
                    <Text style={[styles.uploadHint, { color: theme.colors.textTertiary }]}>PNG, JPG (máx. 5MB)</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Descripción breve de la empresa (opcional)</Text>
                  <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorder, height: 90, alignItems: 'flex-start', paddingVertical: 12 }]}>
                    <TextInput
                      style={[styles.textInput, { color: theme.colors.text }]}
                      placeholder={`"Somos una empresa dedicada a brindar productos y servicios de calidad a nuestros clientes."`}
                      placeholderTextColor={theme.colors.textTertiary}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.confirmRow}
                  onPress={() => setConfirmed(!confirmed)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    { borderColor: confirmed ? SUCCESS_COLOR : inputBorder, backgroundColor: confirmed ? SUCCESS_COLOR : 'transparent' },
                  ]}>
                    {confirmed && <Check size={12} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.confirmText, { color: theme.colors.text }]}>
                    Confirmo que la información proporcionada es verdadera.
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleNext}
              disabled={loading}
              style={({ pressed }) => ({ opacity: pressed || loading ? 0.85 : 1, marginTop: 24 })}
            >
              <View style={[styles.primaryBtn, { backgroundColor: loading ? '#90CAF9' : PRIMARY }]}>
                <Text style={styles.primaryBtnText}>
                  {loading ? 'Guardando...' : step === totalSteps ? 'Finalizar registro' : 'Continuar'}
                </Text>
              </View>
            </Pressable>

            {step === 1 && (
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => { clearRegistrationData(); router.replace('/(company)'); }}
              >
                <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Completar más tarde</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  stepLabel: { fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 4 },
  progressFill: { height: 4, borderRadius: 2 },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 24, paddingBottom: 40 },
  stepTitle: { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  stepSubtitle: { fontSize: 14, lineHeight: 21, marginBottom: 24 },
  fieldWrap: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputRow: { borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 14, height: 52, justifyContent: 'center' },
  textInput: { flex: 1, fontSize: 15 },
  readonlyInput: { flexDirection: 'row', alignItems: 'center' },
  readonlyText: { flex: 1, fontSize: 14 },
  readonlyHint: { fontSize: 11, marginTop: 4, marginLeft: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E0E0E0' },
  chipText: { fontSize: 13, color: '#424242', fontWeight: '500' },
  uploadBox: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: 14,
    padding: 28, alignItems: 'center', gap: 6,
  },
  uploadIcon: { fontSize: 32 },
  uploadText: { fontSize: 14, fontWeight: '600' },
  uploadHint: { fontSize: 12 },
  confirmRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 8 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1,
  },
  confirmText: { flex: 1, fontSize: 14, lineHeight: 21, fontWeight: '500' },
  errorBox: {
    borderRadius: 10, padding: 12, marginTop: 16,
    backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: 'rgba(211,47,47,0.2)',
  },
  errorText: { fontSize: 13, textAlign: 'center', color: ERROR_COLOR },
  primaryBtn: {
    height: 54, borderRadius: 27, justifyContent: 'center', alignItems: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 6,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 16 },
  skipText: { fontSize: 14, textDecorationLine: 'underline' },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: SUCCESS_COLOR,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 36,
    shadowColor: SUCCESS_COLOR, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  successTitle: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  successMsg: { fontSize: 15, lineHeight: 23, textAlign: 'center', marginBottom: 36 },
  successBtn: {
    height: 54, borderRadius: 27, paddingHorizontal: 32,
    backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 6,
  },
  successBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
