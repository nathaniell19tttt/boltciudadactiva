import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, Share2, Star, Mail, Phone, MapPin, Briefcase, GraduationCap, Globe, Calendar } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CVScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const workerProfile = profile as any;

  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [workerProfile?.id]);

  const loadData = async () => {
    if (!workerProfile?.id) return;

    const { data: exp } = await supabase
      .from('experiences')
      .select('*')
      .eq('worker_profile_id', workerProfile.id)
      .order('start_date', { ascending: false });

    if (exp) setExperiences(exp);

    const { data: edu } = await supabase
      .from('education')
      .select('*')
      .eq('worker_profile_id', workerProfile.id);

    if (edu) setEducation(edu);

    const { data: langs } = await supabase
      .from('languages')
      .select('*')
      .eq('worker_profile_id', workerProfile.id);

    if (langs) setLanguages(langs);
  };

  const handleDownload = () => {
    Alert.alert('Descargar CV', 'Tu CV se está generando en formato PDF...');
    // En producción: generar PDF con react-native-pdf
  };

  const handleShare = () => {
    Alert.alert('Compartir CV', 'Compartir tu perfil profesional...');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mi CV</Text>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <Download size={22} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card style={styles.profileHeader}>
          <View style={styles.profileHeaderContent}>
            <Avatar
              source={workerProfile?.photo_url}
              name={`${workerProfile?.first_name} ${workerProfile?.last_name}`}
              size={80}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {workerProfile?.first_name} {workerProfile?.last_name}
              </Text>
              <Text style={[styles.profileProfession, { color: theme.colors.primary[600] }]}>
                {workerProfile?.profession || 'Sin profesión definida'}
              </Text>

              <View style={styles.locationRow}>
                <MapPin size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                  {workerProfile?.district}, {workerProfile?.province}
                </Text>
              </View>

              {workerProfile?.rating > 0 && (
                <View style={styles.ratingRow}>
                  <Star size={14} color={theme.colors.warning[500]} fill={theme.colors.warning[500]} />
                  <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                    {workerProfile.rating.toFixed(1)}
                  </Text>
                  <Text style={[styles.ratingCount, { color: theme.colors.textSecondary }]}>
                    ({workerProfile.rating_count} opiniones)
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Summary */}
        {workerProfile?.summary && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Resumen profesional</Text>
            <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
              {workerProfile.summary}
            </Text>
          </View>
        )}

        {/* Experience */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Briefcase size={18} color={theme.colors.primary[500]} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Experiencia laboral</Text>
          </View>
          {experiences.length > 0 ? experiences.map((exp, idx) => (
            <View key={exp.id || idx} style={styles.experienceItem}>
              <View style={[styles.expDot, { backgroundColor: theme.colors.primary[500] }]} />
              <View style={styles.expContent}>
                <Text style={[styles.expPosition, { color: theme.colors.text }]}>{exp.position}</Text>
                <Text style={[styles.expCompany, { color: theme.colors.primary[600] }]}>{exp.company}</Text>
                <Text style={[styles.expPeriod, { color: theme.colors.textSecondary }]}>
                  {formatDate(exp.start_date)} - {exp.current ? 'Presente' : exp.end_date ? formatDate(exp.end_date) : ''}
                </Text>
                {exp.description && (
                  <Text style={[styles.expDesc, { color: theme.colors.textSecondary }]}>
                    {exp.description}
                  </Text>
                )}
              </View>
            </View>
          )) : (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Sin experiencia registrada
            </Text>
          )}
        </View>

        {/* Education */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={18} color={theme.colors.primary[500]} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Formación académica</Text>
          </View>
          {education.length > 0 ? education.map((edu, idx) => (
            <View key={edu.id || idx} style={styles.eduItem}>
              <Text style={[styles.eduDegree, { color: theme.colors.text }]}>{edu.degree}</Text>
              <Text style={[styles.eduInstitution, { color: theme.colors.textSecondary }]}>{edu.institution}</Text>
              <Text style={[styles.eduYear, { color: theme.colors.textTertiary }]}>
                {edu.start_year} - {edu.end_year || 'En curso'}
              </Text>
            </View>
          )) : (
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Sin formación registrada
            </Text>
          )}
        </View>

        {/* Skills */}
        {workerProfile?.skills && workerProfile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Habilidades</Text>
            <View style={styles.skillsContainer}>
              {workerProfile.skills.map((skill: string, idx: number) => (
                <Badge key={idx} text={skill} variant="primary" size="md" />
              ))}
            </View>
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Globe size={18} color={theme.colors.primary[500]} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Idiomas</Text>
            </View>
            {languages.map((lang, idx) => (
              <View key={idx} style={styles.langItem}>
                <Text style={[styles.langName, { color: theme.colors.text }]}>{lang.name}</Text>
                <Text style={[styles.langLevel, { color: theme.colors.textSecondary }]}>
                  {lang.level}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contacto</Text>
          <View style={styles.contactItem}>
            <Mail size={16} color={theme.colors.primary[500]} />
            <Text style={[styles.contactText, { color: theme.colors.text }]}>{user?.email}</Text>
          </View>
          {workerProfile?.phone && (
            <View style={styles.contactItem}>
              <Phone size={16} color={theme.colors.primary[500]} />
              <Text style={[styles.contactText, { color: theme.colors.text }]}>{workerProfile.phone}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Descargar PDF"
            onPress={handleDownload}
            leftIcon={<Download size={18} color="#FFFFFF" />}
            fullWidth
          />
          <View style={{ height: Spacing.md }} />
          <Button
            title="Compartir CV"
            variant="outline"
            onPress={handleShare}
            leftIcon={<Share2 size={18} color={theme.colors.primary[500]} />}
            fullWidth
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', marginLeft: Spacing.sm },
  downloadBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: Spacing.screenPadding },
  profileHeader: { marginBottom: Spacing.lg },
  profileHeaderContent: { flexDirection: 'row', alignItems: 'flex-start' },
  profileInfo: { flex: 1, marginLeft: Spacing.md },
  profileName: { fontSize: 20, fontWeight: '700' },
  profileProfession: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  locationText: { fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  ratingText: { fontSize: 14, fontWeight: '600' },
  ratingCount: { fontSize: 12 },
  section: { marginBottom: Spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.md },
  summaryText: { fontSize: 14, lineHeight: 22 },
  experienceItem: { flexDirection: 'row', marginBottom: Spacing.md },
  expDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6, marginRight: Spacing.md, marginLeft: Spacing.sm },
  expContent: { flex: 1 },
  expPosition: { fontSize: 15, fontWeight: '600' },
  expCompany: { fontSize: 14, marginTop: 2 },
  expPeriod: { fontSize: 12, marginTop: 2 },
  expDesc: { fontSize: 13, marginTop: Spacing.sm, lineHeight: 18 },
  eduItem: { marginBottom: Spacing.md },
  eduDegree: { fontSize: 15, fontWeight: '600' },
  eduInstitution: { fontSize: 13, marginTop: 2 },
  eduYear: { fontSize: 12, marginTop: 2 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  langItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  langName: { fontSize: 14 },
  langLevel: { fontSize: 12 },
  emptyText: { fontSize: 14 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  contactText: { fontSize: 14 },
  actions: { marginTop: Spacing.lg },
  bottomSpacing: { height: Spacing['3xl'] },
});
