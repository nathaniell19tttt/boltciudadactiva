import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, Send, MapPin, Briefcase, Clock, DollarSign, FileText, AlertCircle, Check, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Button, Input, Card, Badge, Screen } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CreateVacancyScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const companyProfile = profile as any;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [modality, setModality] = useState('');
  const [contractType, setContractType] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [showSalary, setShowSalary] = useState(true);
  const [positions, setPositions] = useState('1');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [urgent, setUrgent] = useState(false);
  const [experience, setExperience] = useState('');
  const [educationLevel, setEducationLevel] = useState('');

  const categories = ['Tecnología', 'Construcción', 'Gastronomía', 'Retail', 'Servicios', 'Manufactura', 'Salud', 'Educación', 'Otros'];
  const modalities = ['Presencial', 'Remoto', 'Híbrido'];
  const contractTypes = ['Tiempo completo', 'Medio tiempo', 'Por horas', 'Temporal', 'Por proyecto', 'Pasantía'];
  const districts = ['Comas', 'Carabayllo', 'Puente Piedra', 'Independencia', 'Los Olivos', 'San Martín', 'Otros'];
  const experienceLevels = ['Sin experiencia', '1-2 años', '3-5 años', '5+ años'];
  const educationLevels = ['Sin requisitos', 'Secundaria', 'Técnico', 'Universitario', 'Postgrado'];

  const addRequirement = () => setRequirements([...requirements, '']);
  const updateRequirement = (idx: number, value: string) => {
    const updated = [...requirements];
    updated[idx] = value;
    setRequirements(updated);
  };
  const removeRequirement = (idx: number) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== idx));
    }
  };

  const addBenefit = () => setBenefits([...benefits, '']);
  const updateBenefit = (idx: number, value: string) => {
    const updated = [...benefits];
    updated[idx] = value;
    setBenefits(updated);
  };
  const removeBenefit = (idx: number) => {
    if (benefits.length > 1) {
      setBenefits(benefits.filter((_, i) => i !== idx));
    }
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return !!title && !!category && !!modality && !!contractType;
      case 2:
        return !!district;
      case 3:
        return !!description && description.length >= 50;
      default:
        return true;
    }
  };

  const handlePublish = async () => {
    if (!companyProfile?.id) return;

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      Alert.alert('Completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('jobs').insert({
        company_id: companyProfile.id,
        title,
        category,
        modality,
        contract_type: contractType,
        location: district,
        address: showSalary ? address : null,
        salary_min: showSalary && salaryMin ? parseFloat(salaryMin) : null,
        salary_max: showSalary && salaryMax ? parseFloat(salaryMax) : null,
        show_salary: showSalary,
        positions: parseInt(positions) || 1,
        description,
        requirements: requirements.filter(r => r.trim()),
        benefits: benefits.filter(b => b.trim()),
        urgent,
        experience_required: experience,
        education_level: educationLevel,
        status: 'active',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Publicado', 'Tu vacante ha sido publicada exitosamente', [
          { text: 'Ver vacantes', onPress: () => router.push('/(company)/vacancies') },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo publicar');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepItem}>
          <View style={[
            styles.stepCircle,
            { backgroundColor: step >= s ? theme.colors.primary[500] : '#E0E0E0' },
          ]}>
            {step > s ? (
              <Check size={14} color="#FFFFFF" />
            ) : (
              <Text style={[styles.stepNumber, { color: step >= s ? '#FFFFFF' : '#424242' }]}>{s}</Text>
            )}
          </View>
          <Text style={[styles.stepLabel, { color: step >= s ? theme.colors.primary[500] : theme.colors.textSecondary }]}>
            {s === 1 ? 'Datos' : s === 2 ? 'Ubicación' : 'Detalles'}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Nueva vacante</Text>
            <TouchableOpacity style={styles.previewBtn} onPress={() => setShowPreview(true)}>
              <Eye size={22} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Información básica</Text>

              <Input
                label="Título de la vacante*"
                value={title}
                onChangeText={setTitle}
                placeholder="Ej: Electricista residencial"
                required
              />

              <Text style={[styles.label, { color: theme.colors.text }]}>Categoría*</Text>
              <View style={styles.optionsGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.optionChip, category === cat && { backgroundColor: theme.colors.primary[500] }]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.optionText, category === cat && { color: '#FFFFFF' }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.colors.text }]}>Modalidad de trabajo*</Text>
              <View style={styles.optionsRow}>
                {modalities.map((mod) => (
                  <TouchableOpacity
                    key={mod}
                    style={[styles.optionChip, modality === mod && { backgroundColor: theme.colors.primary[500] }]}
                    onPress={() => setModality(mod)}
                  >
                    <Text style={[styles.optionText, modality === mod && { color: '#FFFFFF' }]}>{mod}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.colors.text }]}>Tipo de contrato*</Text>
              <View style={styles.optionsGrid}>
                {contractTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.optionChip, contractType === type && { backgroundColor: theme.colors.primary[500] }]}
                    onPress={() => setContractType(type)}
                  >
                    <Text style={[styles.optionText, contractType === type && { color: '#FFFFFF' }]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <Input
                    label="Vacantes"
                    value={positions}
                    onChangeText={setPositions}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <TouchableOpacity
                    style={[styles.urgentBtn, urgent && { backgroundColor: theme.colors.error[100], borderColor: theme.colors.error[500] }]}
                    onPress={() => setUrgent(!urgent)}
                  >
                    <AlertCircle size={18} color={urgent ? theme.colors.error[500] : theme.colors.textSecondary} />
                    <Text style={[styles.urgentText, { color: urgent ? theme.colors.error[500] : theme.colors.textSecondary }]}>
                      Urgente
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Location & Salary */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ubicación y salario</Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>Distrito*</Text>
              <View style={styles.optionsGrid}>
                {districts.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.optionChip, district === d && { backgroundColor: theme.colors.primary[500] }]}
                    onPress={() => setDistrict(d)}
                  >
                    <Text style={[styles.optionText, district === d && { color: '#FFFFFF' }]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {modality !== 'Remoto' && (
                <Input
                  label="Dirección (opcional)"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Dirección exacta del trabajo"
                />
              )}

              <Card style={styles.salaryCard}>
                <View style={styles.salaryHeader}>
                  <DollarSign size={20} color={theme.colors.primary[500]} />
                  <Text style={[styles.salaryTitle, { color: theme.colors.text }]}>Rango salarial</Text>
                  <TouchableOpacity style={styles.showSalaryToggle} onPress={() => setShowSalary(!showSalary)}>
                    <Text style={[styles.showSalaryText, { color: showSalary ? theme.colors.primary[500] : theme.colors.textSecondary }]}>
                      {showSalary ? 'Mostrar' : 'Ocultar'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showSalary && (
                  <View style={styles.salaryInputs}>
                    <View style={styles.halfInput}>
                      <Input
                        label="Mínimo"
                        value={salaryMin}
                        onChangeText={setSalaryMin}
                        keyboardType="numeric"
                        placeholder="S/."
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <Input
                        label="Máximo"
                        value={salaryMax}
                        onChangeText={setSalaryMax}
                        keyboardType="numeric"
                        placeholder="S/."
                      />
                    </View>
                  </View>
                )}
              </Card>

              <Text style={[styles.label, { color: theme.colors.text }]}>Experiencia requerida</Text>
              <View style={styles.optionsRow}>
                {experienceLevels.map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    style={[styles.optionChip, experience === exp && { backgroundColor: theme.colors.primary[500] }]}
                    onPress={() => setExperience(exp)}
                  >
                    <Text style={[styles.optionText, experience === exp && { color: '#FFFFFF' }]}>{exp}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.colors.text }]}>Nivel educativo</Text>
              <View style={styles.optionsRow}>
                {educationLevels.map((edu) => (
                  <TouchableOpacity
                    key={edu}
                    style={[styles.optionChip, educationLevel === edu && { backgroundColor: theme.colors.primary[500] }]}
                    onPress={() => setEducationLevel(edu)}
                  >
                    <Text style={[styles.optionText, educationLevel === edu && { color: '#FFFFFF' }]}>{edu}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 3: Description */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Detalles de la vacante</Text>

              <Input
                label="Descripción del puesto*"
                value={description}
                onChangeText={setDescription}
                placeholder="Describe las responsabilidades, horarios, condiciones..."
                multiline
                numberOfLines={5}
                required
              />
              <Text style={[styles.charCount, { color: theme.colors.textTertiary }]}>
                {description.length}/50 caracteres mín.
              </Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>Requisitos</Text>
              {requirements.map((req, idx) => (
                <View key={idx} style={styles.multiInputRow}>
                  <Input
                    value={req}
                    onChangeText={(val) => updateRequirement(idx, val)}
                    placeholder="Ej: Experiencia en instalaciones eléctricas"
                    style={{ flex: 1 }}
                  />
                  {requirements.length > 1 && (
                    <TouchableOpacity style={styles.removeInputBtn} onPress={() => removeRequirement(idx)}>
                      <Text style={[styles.removeInputText, { color: theme.colors.error[500] }]}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addInputBtn} onPress={addRequirement}>
                <Text style={[styles.addInputText, { color: theme.colors.primary[500] }]}>+ Añadir requisito</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: theme.colors.text }]}>Beneficios</Text>
              {benefits.map((ben, idx) => (
                <View key={idx} style={styles.multiInputRow}>
                  <Input
                    value={ben}
                    onChangeText={(val) => updateBenefit(idx, val)}
                    placeholder="Ej: Seguro médico"
                    style={{ flex: 1 }}
                  />
                  {benefits.length > 1 && (
                    <TouchableOpacity style={styles.removeInputBtn} onPress={() => removeBenefit(idx)}>
                      <Text style={[styles.removeInputText, { color: theme.colors.error[500] }]}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addInputBtn} onPress={addBenefit}>
                <Text style={[styles.addInputText, { color: theme.colors.primary[500] }]}>+ Añadir beneficio</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Navigation */}
          <View style={styles.navigation}>
            {step > 1 && (
              <Button title="Atrás" variant="outline" onPress={() => setStep(step - 1)} style={{ flex: 1, marginRight: Spacing.sm }} />
            )}
            {step < 3 ? (
              <Button title="Continuar" onPress={() => setStep(step + 1)} style={{ flex: 1 }} disabled={!validateStep(step)} />
            ) : (
              <Button
                title="Publicar vacante"
                onPress={handlePublish}
                loading={loading}
                leftIcon={<Send size={18} color="#FFFFFF" />}
                style={{ flex: 1 }}
              />
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: Spacing.screenPadding },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', marginLeft: Spacing.sm },
  previewBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', marginBottom: Spacing.xl },
  stepItem: { alignItems: 'center', width: '33%' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepNumber: { fontSize: 14, fontWeight: '600' },
  stepLabel: { fontSize: 11, marginTop: 4 },
  stepContent: {},
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.lg },
  label: { fontSize: 14, fontWeight: '500', marginBottom: Spacing.sm, marginTop: Spacing.md },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  optionChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full, backgroundColor: '#E0E0E0' },
  optionText: { fontSize: 13, color: '#424242' },
  rowInputs: { flexDirection: 'row', gap: Spacing.md },
  halfInput: { flex: 1 },
  urgentBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Spacing.radius.md, borderWidth: 1, borderColor: '#E0E0E0' },
  urgentText: { fontSize: 14, fontWeight: '500' },
  salaryCard: { marginTop: Spacing.md },
  salaryHeader: { flexDirection: 'row', alignItems: 'center' },
  salaryTitle: { flex: 1, fontSize: 15, fontWeight: '600', marginLeft: Spacing.sm },
  showSalaryToggle: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  showSalaryText: { fontSize: 13, fontWeight: '500' },
  salaryInputs: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  charCount: { fontSize: 12, marginTop: -Spacing.sm, marginBottom: Spacing.md },
  multiInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  removeInputBtn: { width: 32, height: 44, justifyContent: 'center', alignItems: 'center' },
  removeInputText: { fontSize: 24, fontWeight: '300' },
  addInputBtn: { paddingVertical: Spacing.md },
  addInputText: { fontSize: 14, fontWeight: '500' },
  navigation: { flexDirection: 'row', marginTop: Spacing.xl },
  bottomSpacing: { height: Spacing['3xl'] },
});
