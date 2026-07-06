import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Pressable, Animated, TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Plus, Trash2, CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';
import { supabase } from '@/lib/supabase';
import { clearRegistrationData } from '@/lib/registrationStore';

const PRIMARY = '#1976D2';
const SUCCESS_COLOR = '#388E3C';
const ERROR_COLOR = '#D32F2F';
const { height } = Dimensions.get('window');

const districts = [
  'Comas', 'Carabayllo', 'Puente Piedra', 'Independencia',
  'Los Olivos', 'San Martín de Porres', 'Cercado de Lima', 'Otros',
];

const educationLevels = [
  { key: 'primaria', label: 'Primaria' },
  { key: 'secundaria', label: 'Secundaria' },
  { key: 'tecnico', label: 'Técnico' },
  { key: 'universitario', label: 'Universitario' },
  { key: 'postgrado', label: 'Postgrado' },
];

interface Experience {
  id: number;
  company: string;
  role: string;
  duration: string;
}

export default function WorkerSignupProfileScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');

  // Step 2
  const [jobSought, setJobSought] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [hasExperience, setHasExperience] = useState<boolean | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: 1, company: '', role: '', duration: '' },
  ]);

  // Step 3
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
      if (!firstName.trim()) { setError('Ingresa tu nombre'); return false; }
      if (!lastName.trim()) { setError('Ingresa tus apellidos'); return false; }
      if (!phone.trim()) { setError('Ingresa tu número de teléfono'); return false; }
      if (!district) { setError('Selecciona tu distrito'); return false; }
    }
    if (step === 2) {
      if (!jobSought.trim()) { setError('Indica qué tipo de empleo buscas'); return false; }
      if (!educationLevel) { setError('Selecciona tu nivel de estudios'); return false; }
      if (hasExperience === null) { setError('Indica si tienes experiencia laboral'); return false; }
      if (hasExperience) {
        const valid = experiences.every(e => e.company.trim() && e.role.trim());
        if (!valid) { setError('Completa empresa y cargo en cada experiencia'); return false; }
      }
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

      const experienceYears = hasExperience
        ? experiences.filter(e => e.company.trim()).length
        : 0;

      const { error: profileError } = await supabase.from('worker_profiles').upsert({
        user_id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        department: 'Lima',
        province: 'Lima',
        district,
        profession: jobSought.trim(),
        occupation: jobSought.trim(),
        education_level: educationLevel,
        experience_years: experienceYears,
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

  const addExperience = () => {
    setExperiences(prev => [...prev, { id: Date.now(), company: '', role: '', duration: '' }]);
  };

  const removeExperience = (id: number) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  const updateExperience = (id: number, field: keyof Omit<Experience, 'id'>, value: string) => {
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const RadioBtn = ({ selected, onPress, label }: { selected: boolean; onPress: () => void; label: string }) => (
    <TouchableOpacity
      style={[styles.radioBtn, { borderColor: selected ? PRIMARY : inputBorder, backgroundColor: selected ? `${PRIMARY}12` : 'transparent' }]}
      onPress={onPress}
    >
      <View style={[styles.radioCircle, { borderColor: selected ? PRIMARY : inputBorder, backgroundColor: selected ? PRIMARY : 'transparent' }]}>
        {selected && <Check size={9} color="#FFF" />}
      </View>
      <Text style={[styles.radioLabel, { color: theme.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );

  const InputBox = ({ placeholder, value, onChangeText, keyboardType = 'default' }: { placeholder: string; value: string; onChangeText: (v: string) => void; keyboardType?: any }) => (
    <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: inputBorder }]}>
      <TextInput
        style={[styles.textInput, { color: theme.colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
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
              Tu cuenta ha sido creada correctamente. Ya puedes comenzar a buscar empleo, postular a vacantes, participar en eventos y acceder a capacitaciones.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.successBtn, { opacity: pressed ? 0.88 : 1 }]}
              onPress={() => router.replace('/(worker)')}
            >
              <Text style={styles.successBtnText}>Ir al inicio</Text>
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
          <TouchableOpacity onPress={() => step > 1 ? animateStep(step - 1) : router.replace('/(worker)')}>
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
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Cuéntanos sobre ti</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
                  Completa tu información básica para comenzar a utilizar Ciudad Activa.
                </Text>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Nombres *</Text>
                  <InputBox placeholder="Ej: Juan Carlos" value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Apellidos *</Text>
                  <InputBox placeholder="Ej: García López" value={lastName} onChangeText={setLastName} />
                </View>
                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Número de teléfono *</Text>
                  <InputBox placeholder="+51 999 999 999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                </View>
                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Distrito donde resides *</Text>
                  <View style={styles.chips}>
                    {districts.map(d => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.chip, district === d && { backgroundColor: PRIMARY }]}
                        onPress={() => setDistrict(d)}
                      >
                        <Text style={[styles.chipText, district === d && { color: '#FFF' }]}>{d}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <View>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>¿Qué tipo de empleo buscas?</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
                  Esta información nos ayudará a recomendarte mejores oportunidades laborales.
                </Text>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Puesto o cargo que buscas *</Text>
                  <InputBox placeholder="Ej: Cocinero, Vendedor, Electricista" value={jobSought} onChangeText={setJobSought} />
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Nivel de estudios *</Text>
                  <View style={styles.radioGroup}>
                    {educationLevels.map(l => (
                      <RadioBtn key={l.key} selected={educationLevel === l.key} onPress={() => setEducationLevel(l.key)} label={l.label} />
                    ))}
                  </View>
                </View>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>¿Tienes experiencia laboral? *</Text>
                  <View style={styles.boolRow}>
                    <TouchableOpacity
                      style={[styles.boolBtn, { borderColor: hasExperience === true ? PRIMARY : inputBorder, backgroundColor: hasExperience === true ? `${PRIMARY}12` : 'transparent' }]}
                      onPress={() => setHasExperience(true)}
                    >
                      <Text style={[styles.boolBtnText, { color: hasExperience === true ? PRIMARY : theme.colors.text }]}>Sí</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.boolBtn, { borderColor: hasExperience === false ? PRIMARY : inputBorder, backgroundColor: hasExperience === false ? `${PRIMARY}12` : 'transparent' }]}
                      onPress={() => { setHasExperience(false); setExperiences([{ id: 1, company: '', role: '', duration: '' }]); }}
                    >
                      <Text style={[styles.boolBtnText, { color: hasExperience === false ? PRIMARY : theme.colors.text }]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {hasExperience === true && (
                  <View>
                    {experiences.map((exp, index) => (
                      <View key={exp.id} style={[styles.expCard, { backgroundColor: inputBg, borderColor: inputBorder }]}>
                        <View style={styles.expCardHeader}>
                          <Text style={[styles.expCardTitle, { color: theme.colors.text }]}>Experiencia {index + 1}</Text>
                          {experiences.length > 1 && (
                            <TouchableOpacity onPress={() => removeExperience(exp.id)}>
                              <Trash2 size={16} color={ERROR_COLOR} />
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={[styles.expInput, { backgroundColor: bg, borderColor: inputBorder }]}>
                          <TextInput
                            style={[styles.textInput, { color: theme.colors.text }]}
                            placeholder="Nombre de la empresa"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={exp.company}
                            onChangeText={v => updateExperience(exp.id, 'company', v)}
                          />
                        </View>
                        <View style={[styles.expInput, { backgroundColor: bg, borderColor: inputBorder }]}>
                          <TextInput
                            style={[styles.textInput, { color: theme.colors.text }]}
                            placeholder="Cargo desempeñado"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={exp.role}
                            onChangeText={v => updateExperience(exp.id, 'role', v)}
                          />
                        </View>
                        <View style={[styles.expInput, { backgroundColor: bg, borderColor: inputBorder }]}>
                          <TextInput
                            style={[styles.textInput, { color: theme.colors.text }]}
                            placeholder="Tiempo trabajado (Ej: 2 años)"
                            placeholderTextColor={theme.colors.textTertiary}
                            value={exp.duration}
                            onChangeText={v => updateExperience(exp.id, 'duration', v)}
                          />
                        </View>
                      </View>
                    ))}
                    <TouchableOpacity style={styles.addExpBtn} onPress={addExperience}>
                      <Plus size={16} color={PRIMARY} />
                      <Text style={[styles.addExpText, { color: PRIMARY }]}>Agregar otra experiencia</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <View>
                <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Completa tu registro</Text>
                <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
                  Puedes completar el resto de tu perfil más adelante desde la sección Editar Perfil.
                </Text>

                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Subir CV (opcional)</Text>
                  <TouchableOpacity style={[styles.uploadBox, { borderColor: inputBorder, backgroundColor: inputBg }]}>
                    <Text style={[styles.uploadIcon]}>📄</Text>
                    <Text style={[styles.uploadText, { color: theme.colors.textSecondary }]}>Toca para subir tu CV</Text>
                    <Text style={[styles.uploadHint, { color: theme.colors.textTertiary }]}>PDF, DOC (máx. 5MB)</Text>
                  </TouchableOpacity>
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
                onPress={() => { clearRegistrationData(); router.replace('/(worker)'); }}
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E0E0E0' },
  chipText: { fontSize: 13, color: '#424242', fontWeight: '500' },
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  radioBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1.5,
  },
  radioCircle: {
    width: 16, height: 16, borderRadius: 8, borderWidth: 2,
    marginRight: 8, justifyContent: 'center', alignItems: 'center',
  },
  radioLabel: { fontSize: 13, fontWeight: '500' },
  boolRow: { flexDirection: 'row', gap: 12 },
  boolBtn: {
    flex: 1, height: 48, borderRadius: 12, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
  },
  boolBtnText: { fontSize: 15, fontWeight: '600' },
  expCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 12 },
  expCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  expCardTitle: { fontSize: 13, fontWeight: '700' },
  expInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, height: 46, justifyContent: 'center', marginBottom: 8 },
  addExpBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, marginBottom: 8 },
  addExpText: { fontSize: 14, fontWeight: '600' },
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
    height: 54, borderRadius: 27, paddingHorizontal: 40,
    backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center',
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 6,
  },
  successBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
