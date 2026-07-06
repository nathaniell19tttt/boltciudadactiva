import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Building2, MapPin, Globe, Mail, Phone, Users, Calendar, Check, Edit2, Camera, Link } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Button, Input, Screen, Card, Avatar, Badge } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CompanyInfoScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const companyProfile = profile as any;

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Company fields
  const [name, setName] = useState(companyProfile?.name || '');
  const [description, setDescription] = useState(companyProfile?.description || '');
  const [industry, setIndustry] = useState(companyProfile?.industry || '');
  const [district, setDistrict] = useState(companyProfile?.district || '');
  const [address, setAddress] = useState(companyProfile?.address || '');
  const [website, setWebsite] = useState(companyProfile?.website || '');
  const [phone, setPhone] = useState(companyProfile?.phone || '');
  const [employees, setEmployees] = useState(companyProfile?.employees_count?.toString() || '');
  const [foundedYear, setFoundedYear] = useState(companyProfile?.founded_year?.toString() || '');

  const industries = ['Tecnología', 'Retail', 'Manufactura', 'Servicios', 'Construcción', 'Gastronomía', 'Salud', 'Educación', 'Otros'];
  const employeeRanges = ['1-10', '11-50', '51-200', '201-500', '500+'];

  useEffect(() => {
    if (companyProfile) {
      setName(companyProfile.name || '');
      setDescription(companyProfile.description || '');
      setIndustry(companyProfile.industry || '');
      setDistrict(companyProfile.district || '');
      setAddress(companyProfile.address || '');
      setWebsite(companyProfile.website || '');
      setPhone(companyProfile.phone || '');
      setEmployees(companyProfile.employees_count?.toString() || '');
      setFoundedYear(companyProfile.founded_year?.toString() || '');
    }
  }, [companyProfile]);

  const handleSave = async () => {
    if (!companyProfile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('company_profiles')
        .update({
          name,
          description,
          industry,
          district,
          address,
          website,
          phone,
          employees_count: employees ? parseInt(employees) : null,
          founded_year: foundedYear ? parseInt(foundedYear) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', companyProfile.id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        await refreshProfile();
        Alert.alert('Guardado', 'Tu perfil de empresa ha sido actualizado');
        setIsEditing(false);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mi Empresa</Text>
            <TouchableOpacity
              style={[styles.editBtn, isEditing && { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Edit2 size={20} color={isEditing ? '#FFFFFF' : theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Banner & Logo */}
          <View style={styles.bannerSection}>
            <View style={[styles.banner, { backgroundColor: theme.colors.primary[100] }]}>
              <TouchableOpacity style={styles.bannerCamera}>
                <Camera size={24} color={theme.colors.primary[500]} />
              </TouchableOpacity>
            </View>
            <View style={styles.logoContainer}>
              <Avatar
                source={companyProfile?.logo_url}
                name={name || 'Empresa'}
                size={100}
              />
              <TouchableOpacity style={styles.logoCamera}>
                <Camera size={18} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Company Name */}
          <View style={styles.nameSection}>
            <Text style={[styles.companyName, { color: theme.colors.text }]}>
              {name || 'Mi Empresa'}
            </Text>
            {companyProfile?.verified && (
              <Badge text="Verificada" variant="success" />
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{companyProfile?.jobs_count || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Vacantes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{companyProfile?.applications_count || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Postulaciones</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{companyProfile?.views_count || 0}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Vistas</Text>
            </View>
          </View>

          {/* Info Cards */}
          <View style={styles.sectionsContainer}>
            {/* Basic Info */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Building2 size={20} color={theme.colors.primary[500]} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Información de la empresa</Text>
              </View>

              {isEditing ? (
                <>
                  <Input label="Nombre de la empresa*" value={name} onChangeText={setName} required />
                  <Input label="Descripción" value={description} onChangeText={setDescription} multiline numberOfLines={3} placeholder="Describe tu empresa..." />

                  <Text style={[styles.label, { color: theme.colors.text }]}>Industria</Text>
                  <View style={styles.optionsRow}>
                    {industries.filter(i => i !== 'Otros').slice(0, 5).map((ind) => (
                      <TouchableOpacity
                        key={ind}
                        style={[styles.optionChip, industry === ind && { backgroundColor: theme.colors.primary[500] }]}
                        onPress={() => setIndustry(ind)}
                      >
                        <Text style={[styles.optionText, industry === ind && { color: '#FFFFFF' }]}>{ind}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.optionsRow}>
                    {industries.slice(5).map((ind) => (
                      <TouchableOpacity
                        key={ind}
                        style={[styles.optionChip, industry === ind && { backgroundColor: theme.colors.primary[500] }]}
                        onPress={() => setIndustry(ind)}
                      >
                        <Text style={[styles.optionText, industry === ind && { color: '#FFFFFF' }]}>{ind}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.label, { color: theme.colors.text }]}>Número de empleados</Text>
                  <View style={styles.optionsRow}>
                    {employeeRanges.map((range) => (
                      <TouchableOpacity
                        key={range}
                        style={[styles.optionChip, employees === range && { backgroundColor: theme.colors.primary[500] }]}
                        onPress={() => setEmployees(range)}
                      >
                        <Text style={[styles.optionText, employees === range && { color: '#FFFFFF' }]}>{range}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Input label="Año de fundación" value={foundedYear} onChangeText={setFoundedYear} keyboardType="numeric" maxLength={4} />
                </>
              ) : (
                <>
                  {description && <Text style={[styles.descText, { color: theme.colors.textSecondary }]}>{description}</Text>}

                  <View style={styles.infoGrid}>
                    {industry && (
                      <View style={styles.infoItem}>
                        <Building2 size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.infoText, { color: theme.colors.text }]}>{industry}</Text>
                      </View>
                    )}
                    {employees && (
                      <View style={styles.infoItem}>
                        <Users size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.infoText, { color: theme.colors.text }]}>{employees} empleados</Text>
                      </View>
                    )}
                    {foundedYear && (
                      <View style={styles.infoItem}>
                        <Calendar size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.infoText, { color: theme.colors.text }]}>Desde {foundedYear}</Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </Card>

            {/* Location */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MapPin size={20} color={theme.colors.primary[500]} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ubicación</Text>
              </View>

              {isEditing ? (
                <>
                  <Input label="Distrito" value={district} onChangeText={setDistrict} />
                  <Input label="Dirección" value={address} onChangeText={setAddress} placeholder="Dirección de la oficina principal" />
                </>
              ) : (
                <View style={styles.infoGrid}>
                  {district && (
                    <View style={styles.infoItem}>
                      <MapPin size={16} color={theme.colors.textSecondary} />
                      <Text style={[styles.infoText, { color: theme.colors.text }]}>{district}</Text>
                    </View>
                  )}
                  {address && (
                    <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>{address}</Text>
                  )}
                </View>
              )}
            </Card>

            {/* Contact */}
            <Card style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Mail size={20} color={theme.colors.primary[500]} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contacto</Text>
              </View>

              {isEditing ? (
                <>
                  <Input label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                  <Input label="Sitio web" value={website} onChangeText={setWebsite} keyboardType="url" placeholder="https://..." />
                </>
              ) : (
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Mail size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.infoText, { color: theme.colors.text }]}>{user?.email}</Text>
                  </View>
                  {phone && (
                    <View style={styles.infoItem}>
                      <Phone size={16} color={theme.colors.textSecondary} />
                      <Text style={[styles.infoText, { color: theme.colors.text }]}>{phone}</Text>
                    </View>
                  )}
                  {website && (
                    <TouchableOpacity style={styles.infoItem}>
                      <Link size={16} color={theme.colors.primary[500]} />
                      <Text style={[styles.infoText, { color: theme.colors.primary[600] }]}>{website}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Card>
          </View>

          {/* Save Button */}
          {isEditing && (
            <View style={styles.saveSection}>
              <Button title="Guardar cambios" onPress={handleSave} loading={loading} size="lg" fullWidth />
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  editBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E0E0E0' },
  bannerSection: { position: 'relative', marginBottom: 50 },
  banner: { height: 140, position: 'relative' },
  bannerCamera: { position: 'absolute', right: Spacing.md, bottom: Spacing.md, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center' },
  logoContainer: { position: 'absolute', bottom: -50, left: Spacing.screenPadding, alignItems: 'center' },
  logoCamera: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  nameSection: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.base, paddingHorizontal: Spacing.screenPadding, gap: Spacing.sm },
  companyName: { fontSize: 22, fontWeight: '700', flex: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: Spacing.lg, marginTop: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 12, marginTop: 2 },
  sectionsContainer: { padding: Spacing.screenPadding },
  sectionCard: { marginBottom: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '500', marginBottom: Spacing.sm, marginTop: Spacing.sm },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  optionChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full, backgroundColor: '#E0E0E0' },
  optionText: { fontSize: 13, color: '#424242' },
  descText: { fontSize: 14, lineHeight: 22 },
  infoGrid: { gap: Spacing.sm },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { fontSize: 14 },
  addressText: { fontSize: 13, marginTop: Spacing.xs },
  saveSection: { padding: Spacing.screenPadding, paddingBottom: 0 },
  bottomSpacing: { height: Spacing['3xl'] },
});
