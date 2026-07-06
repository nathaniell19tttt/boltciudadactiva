import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Building2, MapPin, Link as LinkIcon, Users, Briefcase, Star, ChevronLeft, Share2, Bookmark, BadgeCheck, Globe, Mail, Phone
} from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Badge, Button, Avatar, Screen } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CompanyProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [company, setCompany] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setCompany(data);

        const { data: jobsData } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        setJobs(jobsData || []);

        if (user) {
          const { data: follow } = await supabase
            .from('company_follows')
            .select('id')
            .eq('company_id', id)
            .eq('user_id', user.id)
            .single();
          setIsFollowing(!!follow);
        }
      }
    } catch (err) {
      console.error('Error fetching company:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompanyDetails();
    setRefreshing(false);
  };

  const handleFollow = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    if (isFollowing) {
      await supabase
        .from('company_follows')
        .delete()
        .eq('company_id', id)
        .eq('user_id', user.id);
      setIsFollowing(false);
    } else {
      await supabase
        .from('company_follows')
        .insert({ company_id: id, user_id: user.id });
      setIsFollowing(true);
    }
  };

  const handleShare = async () => {
    try {
      const url = `https://ciudadactiva.pe/company/${id}`;
      await Share.share({
        message: `${company.name} - ${company.industry}\nVer perfil en Ciudad Activa`,
        title: 'Compartir empresa'
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !company) {
    return (
      <Screen>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.text }}>Cargando...</Text>
        </View>
      </Screen>
    );
  }

  const JobCard = ({ job }: { job: any }) => (
    <TouchableOpacity onPress={() => router.push(`/(worker)/jobs/${job.id}`)}>
      <Card style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <View style={styles.jobInfo}>
            <Text style={[styles.jobTitle, { color: theme.colors.text }]} numberOfLines={2}>{job.title}</Text>
            <View style={styles.jobMeta}>
              <MapPin size={12} color={theme.colors.textSecondary} />
              <Text style={[styles.jobMetaText, { color: theme.colors.textSecondary }]}>{job.district}</Text>
            </View>
          </View>
          <Text style={[styles.jobSalary, { color: theme.colors.success[600] }]}>
            {job.salary_min ? `S/ ${job.salary_min}` : 'Consultar'}
          </Text>
        </View>
        <View style={styles.jobFooter}>
          <Badge text={job.contract_type} variant="primary" size="sm" />
          <Text style={[styles.jobDate, { color: theme.colors.textTertiary }]}>
            {new Date(job.created_at).toLocaleDateString('es-ES')}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={28} color={theme.colors.text} />
      </TouchableOpacity>

      <FlatList
        data={activeTab === 'jobs' ? jobs : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Avatar source={company.logo_url} name={company.name} size={90} />
              <View style={styles.nameContainer}>
                <Text style={[styles.companyName, { color: theme.colors.text }]}>{company.name}</Text>
                {company.verified && (
                  <View style={styles.verifiedBadge}>
                    <BadgeCheck size={18} color={theme.colors.info[500]} />
                    <Text style={[styles.verifiedText, { color: theme.colors.info[500] }]}>Verificada</Text>
                  </View>
                )}
              </View>
              {company.industry && (
                <Text style={[styles.industry, { color: theme.colors.textSecondary }]}>{company.industry}</Text>
              )}
              {company.description && (
                <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={3}>
                  {company.description}
                </Text>
              )}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Briefcase size={18} color={theme.colors.primary[500]} />
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{jobs.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Vacantes</Text>
                </View>
                <View style={styles.statItem}>
                  <Users size={18} color={theme.colors.primary[500]} />
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>{company.followers_count || 0}</Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Seguidores</Text>
                </View>
                {company.rating > 0 && (
                  <View style={styles.statItem}>
                    <Star size={18} color={theme.colors.warning[500]} fill={theme.colors.warning[500]} />
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{company.rating.toFixed(1)}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Rating</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.actionButtons}>
              <Button
                title={isFollowing ? 'Siguiendo' : 'Seguir'}
                variant={isFollowing ? 'outline' : 'primary'}
                size="md"
                leftIcon={isFollowing ? <Bookmark size={18} color={theme.colors.primary[500]} fill={theme.colors.primary[500]} /> : undefined}
                onPress={handleFollow}
              />
              <TouchableOpacity style={[styles.shareBtn, { backgroundColor: theme.colors.surfaceVariant }]} onPress={handleShare}>
                <Share2 size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'about' && { borderBottomColor: theme.colors.primary[500], borderBottomWidth: 2 }]}
                onPress={() => setActiveTab('about')}
              >
                <Text style={[styles.tabText, { color: activeTab === 'about' ? theme.colors.primary[500] : theme.colors.textSecondary }]}>
                  Información
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'jobs' && { borderBottomColor: theme.colors.primary[500], borderBottomWidth: 2 }]}
                onPress={() => setActiveTab('jobs')}
              >
                <Text style={[styles.tabText, { color: activeTab === 'jobs' ? theme.colors.primary[500] : theme.colors.textSecondary }]}>
                  Vacantes ({jobs.length})
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          activeTab === 'jobs' ? (
            <View style={styles.emptyState}>
              <Briefcase size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin vacantes activas</Text>
              <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>Esta empresa no tiene vacantes disponibles en este momento</Text>
            </View>
          ) : null
        }
      />

      {activeTab === 'about' && (
        <ScrollView style={styles.aboutContent} contentContainerStyle={styles.aboutContentContainer}>
          <Card style={styles.infoCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Información</Text>
            {company.address && (
              <View style={styles.infoRow}>
                <Building2 size={18} color={theme.colors.primary[500]} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{company.address}</Text>
              </View>
            )}
            {company.district && company.province && (
              <View style={styles.infoRow}>
                <MapPin size={18} color={theme.colors.primary[500]} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{company.district}, {company.province}</Text>
              </View>
            )}
            {company.website && (
              <TouchableOpacity style={styles.infoRow}>
                <Globe size={18} color={theme.colors.primary[500]} />
                <Text style={[styles.infoText, { color: theme.colors.secondary[500] }]}>{company.website}</Text>
              </TouchableOpacity>
            )}
            {company.email && (
              <View style={styles.infoRow}>
                <Mail size={18} color={theme.colors.primary[500]} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{company.email}</Text>
              </View>
            )}
            {company.phone && (
              <View style={styles.infoRow}>
                <Phone size={18} color={theme.colors.primary[500]} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{company.phone}</Text>
              </View>
            )}
            {company.size && (
              <View style={styles.infoRow}>
                <Users size={18} color={theme.colors.primary[500]} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{company.size} empleados</Text>
              </View>
            )}
          </Card>

          {company.benefits && company.benefits.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Beneficios que ofrece</Text>
              <View style={styles.benefitsList}>
                {company.benefits.map((ben: string, idx: number) => (
                  <Badge key={idx} text={ben} variant="success" size="sm" />
                ))}
              </View>
            </View>
          )}

          {company.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sobre nosotros</Text>
              <Text style={[styles.fullDescription, { color: theme.colors.textSecondary }]}>
                {company.description}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: { padding: Spacing.md },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing['2xl'] },
  header: { alignItems: 'center', marginTop: Spacing.md },
  nameContainer: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.sm },
  companyName: { fontSize: 24, fontWeight: '700' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 12, fontWeight: '500' },
  industry: { fontSize: 14, marginTop: Spacing.sm },
  description: { fontSize: 14, textAlign: 'center', marginTop: Spacing.md, lineHeight: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing['2xl'], marginTop: Spacing.lg, marginBottom: Spacing.lg },
  statItem: { alignItems: 'center', gap: Spacing.xs },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11 },
  actionButtons: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  shareBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', marginBottom: Spacing.lg },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '500' },
  aboutContent: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 280 },
  aboutContentContainer: { paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing['2xl'] },
  infoCard: {},
  section: { marginTop: Spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  infoText: { fontSize: 14, flex: 1 },
  benefitsList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  fullDescription: { fontSize: 14, lineHeight: 22 },
  jobCard: { marginBottom: Spacing.md },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: '600', marginBottom: Spacing.xs },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobMetaText: { fontSize: 12 },
  jobSalary: { fontSize: 15, fontWeight: '700' },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  jobDate: { fontSize: 11 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'], paddingHorizontal: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
});
