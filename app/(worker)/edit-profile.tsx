import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, User, MapPin, Briefcase, GraduationCap, Globe, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Button, Input, Screen, Card } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const workerProfile = profile as any;

  const [loading, setLoading] = useState(false);

  // Información personal
  const [firstName, setFirstName] = useState(workerProfile?.first_name || '');
  const [lastName, setLastName] = useState(workerProfile?.last_name || '');
  const [phone, setPhone] = useState(workerProfile?.phone || '');
  const [gender, setGender] = useState(workerProfile?.gender || '');

  // Ubicación
  const [district, setDistrict] = useState(workerProfile?.district || '');
  const [address, setAddress] = useState(workerProfile?.address || '');

  // Profesional
  const [profession, setProfession] = useState(workerProfile?.profession || '');
  const [summary, setSummary] = useState(workerProfile?.summary || '');
  const [skills, setSkills] = useState<string[]>(workerProfile?.skills || []);

  const districts = ['Comas', 'Carabayllo', 'Puente Piedra', 'Independencia', 'Los Olivos', 'San Martín', 'Otros'];
  const genderOptions = ['masculino', 'femenino', 'otro'];

  const skillSuggestions = [
    'Atención al cliente', 'Cocina', 'Electricidad', 'Gasfitería', 'Carpintería',
    'Ventas', 'Microsoft Office', 'Manejo de herramientas', 'Limpieza', 'Construcción',
    'Costura', 'Atención al público', 'Trabajo en equipo', 'Comunicación'
  ];

  const handleSave = async () => {
    Alert.alert(
      'Guardar cambios',
      '¿Deseas guardar los cambios realizados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase
                .from('worker_profiles')
                .update({
                  first_name: firstName,
                  last_name: lastName,
                  phone,
                  gender,
                  district,
                  address,
                  profession,
                  summary,
                  skills,
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', user?.id);

              if (error) {
                Alert.alert('Error', error.message);
              } else {
                await refreshProfile();
                Alert.alert('Guardado', 'Tu perfil ha sido actualizado');
                router.back();
              }
            } catch (err) {
              Alert.alert('Error', 'No se pudo guardar');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else if (skills.length < 10) {
      setSkills([...skills, skill]);
    } else {
      Alert.alert('Límite alcanzado', 'Puedes seleccionar máximo 10 habilidades');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.colors.text }]}>Editar perfil</Text>

          {/* Información personal */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={18} color={theme.colors.primary[500]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Información personal</Text>
            </View>
            <Input label="Nombres" value={firstName} onChangeText={setFirstName} required />
            <Input label="Apellidos" value={lastName} onChangeText={setLastName} required />
            <Input label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

            <Text style={[styles.label, { color: theme.colors.text }]}>Sexo</Text>
            <View style={styles.optionsRow}>
              {genderOptions.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionChip, gender === g && { backgroundColor: theme.colors.primary[500] }]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.optionText, gender === g && { color: '#FFFFFF' }]}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ubicación */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={18} color={theme.colors.primary[500]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ubicación</Text>
            </View>

            <Text style={[styles.label, { color: theme.colors.text }]}>Distrito</Text>
            <View style={styles.optionsRow}>
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

            <Input label="Dirección" value={address} onChangeText={setAddress} placeholder="Dirección completa (privada)" />
          </View>

          {/* Profesional */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Briefcase size={18} color={theme.colors.primary[500]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Información profesional</Text>
            </View>

            <Input label="Profesión" value={profession} onChangeText={setProfession} placeholder="Ej: Electricista, Cocinero" required />
            <Input label="Resumen profesional" value={summary} onChangeText={setSummary} placeholder="Describe tu experiencia" multiline numberOfLines={3} />

            <Text style={[styles.label, { color: theme.colors.text }]}>Habilidades ({skills.length}/10)</Text>
            <View style={styles.skillsContainer}>
              {skillSuggestions.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[styles.skillChip, skills.includes(skill) && { backgroundColor: theme.colors.primary[500] }]}
                  onPress={() => toggleSkill(skill)}
                >
                  <Text style={[styles.skillText, skills.includes(skill) && { color: '#FFFFFF' }]}>{skill}</Text>
                  {skills.includes(skill) && <Check size={14} color="#FFFFFF" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Guardar cambios"
            onPress={handleSave}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { padding: Spacing.screenPadding, flexGrow: 1 },
  backButton: { width: 40, height: 40, justifyContent: 'center', marginBottom: Spacing.md },
  title: { fontSize: 24, fontWeight: '700', marginBottom: Spacing.xl },
  section: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: Spacing.sm },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  optionChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full, backgroundColor: '#E0E0E0' },
  optionText: { fontSize: 13, color: '#424242' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  skillChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full, backgroundColor: '#E0E0E0' },
  skillText: { fontSize: 12, color: '#424242' },
  saveButton: { marginTop: Spacing.lg, marginBottom: Spacing['2xl'] },
});
