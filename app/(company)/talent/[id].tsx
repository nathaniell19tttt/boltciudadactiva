import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Star, Briefcase, Clock, Mail, Phone, Calendar, Award, Globe, Check, X, MessageCircle, FileText, Download, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Button, Screen } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function TalentProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const companyProfile = profile as any;

  const [worker, setWorker] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    loadWorkerData();
  }, [id]);

  const loadWorkerData = async () => {
    if (!id) return;

    const { data: workerData } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (workerData) {
      setWorker(workerData);

      const { data: exp } = await supabase
        .from('experiences')
        .select('*')
        .eq('worker_profile_id', id)
        .order('start_date', { ascending: false });
      if (exp) setExperiences(exp);

      const { data: edu } = await supabase
        .from('education')
        .select('*')
        .eq('worker_profile_id', id);
      if (edu) setEducation(edu);

      const { data: langs } = await supabase
        .from('languages')
        .select('*')
        .eq('worker_profile_id', id);
      if (langs) setLanguages(langs);

      const { data: apps } = await supabase
        .from('applications')
        .select('*, job:jobs(title)')
        .eq('worker_id', workerData.user_id)
        .eq('jobs.company_id', companyProfile?.id)
        .order('created_at', { ascending: false });
      if (apps) setApplications(apps);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  };

  const inviteToJob = () => {
    Alert.alert('Invitar', 'Selecciona la vacante para invitar a este candidato');
    // Show modal to select vacancy
  };

  const startChat = async () => {
    if (!worker || !companyProfile) return;

    // Create or get conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('participant_1', companyProfile.user_id)
      .eq('participant_2', worker.user_id)
      .single();

    if (existing) {
      router.push(`/(company)/messages/${existing.id}`);
      return;
    }

    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: companyProfile.user_id,
        participant_2: worker.user_id,
      })
      .select()
      .single();

    if (!error && newConv) {
      router.push(`/(company)/messages/${newConv.id}`);
    }
  };

  if (!worker) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.colors.textSecondary }}>Cargando perfil...</Text>
        </View>
      </Screen>
    );
  }

  const RatingStars = ({ rating }: { rating: number }) => (
    <View style={styles.ratingStars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          color={theme.colors.warning[500]}
          fill={star <= Math.round(rating) ? theme.colors.warning[500] : 'transparent'}
        />
      ))}
    </View>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Perfil del candidato</Text>
        <TouchableOpacity style={styles.messageBtn} onPress={startChat}>
          <MessageCircle size={22} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              source={worker.photo_url}
              name={`${worker.first_name} ${worker.last_name}`}
              size={80}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {worker.first_name} {worker.last_name}
              </Text>
              <Text style={[styles.professionTag, { color: theme.colors.primary[600] }]}>
                {worker.profession || 'Sin profesión'}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                  {worker.district}, {worker.province}
                </Text>
              </View>
              {worker.rating > 0 && (
                <View style={styles.ratingRow}>
                  <RatingStars rating={worker.rating} />
                  <Text style={[styles.ratingValue, { color: theme.colors.text }]}>
                    {worker.rating.toFixed(1)}
                  </Text>
                  <Text style={[styles.ratingCount, { color: theme.colors.textSecondary }]}>
                    ({worker.rating_count} opiniones)
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={[styles.quickInfoItem, { backgroundColor: theme.colors.primary[50] }]}>
            <Briefcase size={20} color={theme.colors.primary[500]} />
            <Text style={[styles.quickInfoLabel, { color: theme.colors.textSecondary }]}>Experiencia</Text>
            <Text style={[styles.quickInfoValue, { color: theme.colors.text }]}>
              {experiences.length > 0 ? `${experiences.length} registros` : 'Sin registrar'}
            </Text>
          </View>
          <View style={[styles.quickInfoItem, { backgroundColor: theme.colors.success[50] }]}>
            <Clock size={20} color={theme.colors.success[500]} />
            <Text style={[styles.quickInfoLabel, { color: theme.colors.textSecondary }]}>Disponibilidad</Text>
            <Text style={[styles.quickInfoValue, { color: theme.colors.text }]}>
              {worker.availability || 'Flexible'}
            </Text>
          </View>
          <View style={[styles.quickInfoItem, { backgroundColor: theme.colors.secondary[50] }]}>
            <Award size={20} color={theme.colors.secondary[500]} />
            <Text style={[styles.quickInfoLabel, { color: theme.colors.textSecondary }]}>Modalidad</Text>
            <Text style={[styles.quickInfoValue, { color: theme.colors.text }]}>
              {worker.preferred_modality || 'Presencial'}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'resumen' && { borderBottomColor: theme.colors.primary[500] }]}
            onPress={() => setActiveTab('resumen')}
          >
            <Text style={[styles.tabText, activeTab === 'resumen' && { color: theme.colors.primary[500] }]}>
              Resumen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'experiencia' && { borderBottomColor: theme.colors.primary[500] }]}
            onPress={() => setActiveTab('experiencia')}
          >
            <Text style={[styles.tabText, activeTab === 'experiencia' && { color: theme.colors.primary[500] }]}>
              Experiencia
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'educacion' && { borderBottomColor: theme.colors.primary[500] }]}
            onPress={() => setActiveTab('educacion')}
          >
            <Text style={[styles.tabText, activeTab === 'educacion' && { color: theme.colors.primary[500] }]}>
              Educación
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'resumen' && (
          <View style={styles.tabContent}>
            {/* Summary */}
            {worker.summary && (
              <Card style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Acerca de</Text>
                <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                  {worker.summary}
                </Text>
              </Card>
            )}

            {/* Skills */}
            {worker.skills && worker.skills.length > 0 && (
              <Card style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Habilidades</Text>
                <View style={styles.skillsGrid}>
                  {worker.skills.map((skill: string, idx: number) => (
                    <Badge key={idx} text={skill} variant="primary" size="md" />
                  ))}
                </View>
              </Card>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <Card style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Globe size={18} color={theme.colors.primary[500]} />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Idiomas</Text>
                </View>
                {languages.map((lang, idx) => (
                  <View key={idx} style={styles.langRow}>
                    <Text style={[styles.langName, { color: theme.colors.text }]}>{lang.name}</Text>
                    <Badge text={lang.level} variant="neutral" size="sm" />
                  </View>
                ))}
              </Card>
            )}
          </View>
        )}

        {activeTab === 'experiencia' && (
          <View style={styles.tabContent}>
            {experiences.length > 0 ? experiences.map((exp, idx) => (
              <Card key={exp.id || idx} style={styles.experienceCard}>
                <View style={styles.expTimeline}>
                  <View style={[styles.expDot, { backgroundColor: theme.colors.primary[500] }]} />
                  {idx < experiences.length - 1 && <View style={[styles.expLine, { backgroundColor: theme.colors.neutral[200] }]} />}
                </View>
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
              </Card>
            )) : (
              <View style={styles.emptyContent}>
                <Briefcase size={40} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Sin experiencia registrada
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'educacion' && (
          <View style={styles.tabContent}>
            {education.length > 0 ? education.map((edu, idx) => (
              <Card key={edu.id || idx} style={styles.eduCard}>
                <Text style={[styles.eduDegree, { color: theme.colors.text }]}>{edu.degree}</Text>
                <Text style={[styles.eduInstitution, { color: theme.colors.textSecondary }]}>
                  {edu.institution}
                </Text>
                <Text style={[styles.eduYear, { color: theme.colors.textTertiary }]}>
                  {edu.start_year} - {edu.end_year || 'En curso'}
                </Text>
              </Card>
            )) : (
              <View style={styles.emptyContent}>
                <Award size={40} color={theme.colors.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Sin formación registrada
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Previous Applications */}
        {applications.length > 0 && (
          <Card style={styles.applicationsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Postulaciones a tus vacantes
            </Text>
            {applications.map((app, idx) => (
              <TouchableOpacity key={app.id} style={styles.appItem}>
                <View style={styles.appInfo}>
                  <Text style={[styles.appJob, { color: theme.colors.text }]}>{app.job?.title}</Text>
                  <Text style={[styles.appDate, { color: theme.colors.textSecondary }]}>
                    {formatDate(app.created_at)}
                  </Text>
                </View>
                <Badge
                  text={app.status}
                  variant={app.status === 'contratado' ? 'success' : app.status === 'rechazado' ? 'error' : 'warning'}
                />
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Invitar a vacante"
            onPress={inviteToJob}
            leftIcon={<FileText size={18} color="#FFFFFF" />}
            fullWidth
          />
          <View style={{ height: Spacing.md }} />
          <Button
            title="Enviar mensaje"
            variant="outline"
            onPress={startChat}
            leftIcon={<MessageCircle size={18} color={theme.colors.primary[500]} />}
            fullWidth
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', marginLeft: Spacing.sm },
  messageBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: Spacing.screenPadding },
  profileCard: { marginBottom: Spacing.md },
  profileHeader: { flexDirection: 'row' },
  profileInfo: { flex: 1, marginLeft: Spacing.md },
  profileName: { fontSize: 20, fontWeight: '700' },
  professionTag: { fontSize: 14, fontWeight: '500', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  locationText: { fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  ratingStars: { flexDirection: 'row', gap: 2 },
  ratingValue: { fontSize: 14, fontWeight: '600', marginLeft: 4 },
  ratingCount: { fontSize: 12 },
  quickInfo: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  quickInfoItem: { flex: 1, padding: Spacing.md, borderRadius: Spacing.radius.lg, alignItems: 'center' },
  quickInfoLabel: { fontSize: 11, marginTop: Spacing.xs },
  quickInfoValue: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', marginBottom: Spacing.md },
  tab: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabContent: { marginBottom: Spacing.lg },
  sectionCard: { marginBottom: Spacing.md },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.sm },
  summaryText: { fontSize: 14, lineHeight: 22 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  langName: { fontSize: 14 },
  experienceCard: { flexDirection: 'row', marginBottom: 0 },
  expTimeline: { width: 20, alignItems: 'center' },
  expDot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  expLine: { width: 2, flex: 1 },
  expContent: { flex: 1, paddingBottom: Spacing.md },
  expPosition: { fontSize: 15, fontWeight: '600' },
  expCompany: { fontSize: 14, marginTop: 2 },
  expPeriod: { fontSize: 12, marginTop: 2 },
  expDesc: { fontSize: 13, marginTop: Spacing.sm, lineHeight: 18 },
  eduCard: { marginBottom: Spacing.sm },
  eduDegree: { fontSize: 15, fontWeight: '600' },
  eduInstitution: { fontSize: 13, marginTop: 2 },
  eduYear: { fontSize: 12, marginTop: 2 },
  emptyContent: { alignItems: 'center', paddingVertical: Spacing.xl },
  emptyText: { fontSize: 14, marginTop: Spacing.sm },
  applicationsCard: { marginBottom: Spacing.lg },
  appItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  appInfo: { flex: 1 },
  appJob: { fontSize: 14, fontWeight: '500' },
  appDate: { fontSize: 12, marginTop: 2 },
  actionsSection: { marginTop: Spacing.md, paddingBottom: Spacing['2xl'] },
});
