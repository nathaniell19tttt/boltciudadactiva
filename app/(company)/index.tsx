import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  FileText,
  Users,
  Calendar,
  Megaphone,
  TrendingUp,
  Eye,
  UserPlus,
  Briefcase,
  CheckCircle,
  ChevronRight,
  MapPin,
  Star,
  Inbox,
} from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, SearchBar, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

export default function CompanyHomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    interviews: 0,
    views: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [talentRecommendations, setTalentRecommendations] = useState<any[]>([]);

  const companyProfile = profile as any;

  const fetchData = async () => {
    if (!companyProfile?.id) return;

    try {
      // Fetch stats
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, views, applications_count')
        .eq('company_id', companyProfile.id)
        .eq('status', 'active');

      if (jobs) {
        const activeJobs = jobs.length;
        const totalViews = jobs.reduce((sum, j) => sum + (j.views || 0), 0);
        const totalApps = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);
        setStats(prev => ({ ...prev, activeJobs, views: totalViews, applications: totalApps }));
      }

      // Fetch recent applications
      const { data: applications } = await supabase
        .from('applications')
        .select('*, job:jobs(title), worker:worker_profiles(*)')
        .in('job_id', jobs?.map(j => j.id) || [])
        .order('created_at', { ascending: false })
        .limit(5);

      if (applications) setRecentApplications(applications);

      // Fetch talent recommendations
      const { data: workers } = await supabase
        .from('worker_profiles')
        .select('*')
        .order('rating', { ascending: false })
        .limit(4);

      if (workers) setTalentRecommendations(workers);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [companyProfile?.id]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const quickActions = [
    {
      label: 'Publicar vacante',
      description: 'Crea una nueva oferta de trabajo',
      icon: FileText,
      route: '/(company)/vacancies/create',
      color: theme.colors.primary[500],
    },
    {
      label: 'Buscar talento',
      description: 'Encuentra el candidato ideal',
      icon: Users,
      route: '/(company)/talent',
      color: theme.colors.secondary[500],
    },
    {
      label: 'Agendar entrevista',
      description: 'Programa reuniones con candidatos',
      icon: Calendar,
      route: '/(company)/interviews',
      color: theme.colors.success[500],
    },
    {
      label: 'Promocionar',
      description: 'Destaca tu empresa',
      icon: Megaphone,
      route: '/(company)/promotions',
      color: theme.colors.info[500],
    },
  ];

  const statusColors: Record<string, string> = {
    received: theme.colors.primary[500],
    reviewing: theme.colors.warning[500],
    interview: theme.colors.success[500],
    hired: theme.colors.success[600],
    rejected: theme.colors.error[500],
  };

  const statusLabels: Record<string, string> = {
    received: 'Recibida',
    reviewing: 'En revisión',
    interview: 'Entrevista',
    hired: 'Contratado',
    rejected: 'No seleccionado',
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View style={styles.welcomeContent}>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {companyProfile?.name || 'Mi Empresa'}
            </Text>
          </View>
          <Avatar
            source={companyProfile?.logo_url}
            name={companyProfile?.name || 'Empresa'}
            size={50}
          />
        </View>

        {companyProfile?.verified && (
          <View style={[styles.verifiedBanner, { backgroundColor: theme.colors.success[50] }]}>
            <CheckCircle size={18} color={theme.colors.success[600]} />
            <Text style={[styles.verifiedText, { color: theme.colors.success[700] }]}>
              Empresa verificada
            </Text>
          </View>
        )}

        <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
          Encuentra el talento ideal para hacer crecer tu negocio.
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickActionCard, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <action.icon size={24} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.colors.text }]}>
                {action.label}
              </Text>
              <Text style={[styles.quickActionDesc, { color: theme.colors.textSecondary }]}>
                {action.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.primary[50] }]}>
            <Briefcase size={24} color={theme.colors.primary[500]} />
            <Text style={[styles.statValue, { color: theme.colors.primary[700] }]}>
              {stats.activeJobs}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.primary[600] }]}>
              Vacantes activas
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.secondary[50] }]}>
            <UserPlus size={24} color={theme.colors.secondary[500]} />
            <Text style={[styles.statValue, { color: theme.colors.secondary[700] }]}>
              {stats.applications}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.secondary[600] }]}>
              Postulaciones
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.success[50] }]}>
            <Eye size={24} color={theme.colors.success[500]} />
            <Text style={[styles.statValue, { color: theme.colors.success[700] }]}>
              {stats.views}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.success[600] }]}>
              Visualizaciones
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Talent Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Talento recomendado
          </Text>
          <TouchableOpacity onPress={() => router.push('/(company)/talent')}>
            <Text style={[styles.seeAll, { color: theme.colors.primary[500] }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {talentRecommendations.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {talentRecommendations.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                onPress={() => router.push(`/(company)/talent/${worker.id}`)}
              >
                <Card style={styles.talentCard}>
                  <View style={styles.talentHeader}>
                    <Avatar
                      source={worker.photo_url}
                      name={`${worker.first_name} ${worker.last_name}`}
                      size={50}
                    />
                    <View style={styles.talentInfo}>
                      <Text style={[styles.talentName, { color: theme.colors.text }]}>
                        {worker.first_name} {worker.last_name}
                      </Text>
                      <Text style={[styles.talentProfession, { color: theme.colors.textSecondary }]}>
                        {worker.profession || 'Sin profesión'}
                      </Text>
                      <View style={styles.talentMeta}>
                        {worker.rating > 0 && (
                          <>
                            <Star size={12} color={theme.colors.warning[500]} fill={theme.colors.warning[500]} />
                            <Text style={[styles.talentRating, { color: theme.colors.textSecondary }]}>
                              {worker.rating.toFixed(1)}
                            </Text>
                          </>
                        )}
                        {worker.district && (
                          <>
                            <Text style={[styles.talentSeparator, { color: theme.colors.textTertiary }]}>•</Text>
                            <MapPin size={12} color={theme.colors.textTertiary} />
                            <Text style={[styles.talentLocation, { color: theme.colors.textTertiary }]}>
                              {worker.district}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                  <Button title="Ver perfil" variant="outline" size="sm" fullWidth onPress={() => router.push(`/(company)/talent/${worker.id}`)} />
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Card style={styles.emptyState}>
            <Users size={32} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No hay talentos disponibles
            </Text>
          </Card>
        )}
      </View>

      {/* Recent Applications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Postulaciones recientes
          </Text>
          <TouchableOpacity onPress={() => router.push('/(company)/applications')}>
            <Text style={[styles.seeAll, { color: theme.colors.primary[500] }]}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {recentApplications.length > 0 ? (
          recentApplications.map((app) => (
            <TouchableOpacity key={app.id} onPress={() => router.push(`/(company)/talent/${app.worker_id}`)}>
              <Card style={styles.appCard}>
                <View style={styles.appHeader}>
                  <Avatar
                    source={app.worker?.photo_url}
                    name={`${app.worker?.first_name} ${app.worker?.last_name}`}
                    size={45}
                  />
                  <View style={styles.appInfo}>
                    <Text style={[styles.appName, { color: theme.colors.text }]}>
                      {app.worker?.first_name} {app.worker?.last_name}
                    </Text>
                    <Text style={[styles.appJob, { color: theme.colors.textSecondary }]}>
                      {app.job?.title}
                    </Text>
                  </View>
                  <Badge
                    text={statusLabels[app.status] || app.status}
                    variant={app.status === 'hired' ? 'success' : app.status === 'rejected' ? 'error' : 'primary'}
                    size="sm"
                  />
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.emptyState}>
            <Inbox size={32} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No hay postulaciones recientes
            </Text>
          </Card>
        )}
      </View>

      {/* CTA Banner */}
      <View style={styles.section}>
        <Card style={[styles.ctaBanner, { backgroundColor: theme.colors.primary[500] }]}>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>
              ¿Necesitas más visibilidad?
            </Text>
            <Text style={styles.ctaDesc}>
              Destaca tu empresa y llega a más candidatos
            </Text>
          </View>
          <Button
            title="Promocionar ahora"
            onPress={() => router.push('/(company)/promotions')}
            style={styles.ctaButton}
          />
        </Card>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeSection: {
    padding: Spacing.screenPadding,
    paddingTop: Spacing.md,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.full,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagline: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.screenPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickActionCard: {
    width: (width - Spacing.screenPadding * 2 - Spacing.md) / 2,
    borderRadius: Spacing.radius.xl,
    padding: Spacing.base,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  quickActionDesc: {
    fontSize: 11,
  },
  statCard: {
    width: 140,
    borderRadius: Spacing.radius.xl,
    padding: Spacing.base,
    marginRight: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  talentCard: {
    width: 200,
    marginRight: Spacing.md,
  },
  talentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  talentInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  talentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  talentProfession: {
    fontSize: 12,
    marginTop: 2,
  },
  talentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  talentRating: {
    fontSize: 11,
    marginLeft: 2,
  },
  talentSeparator: {
    marginHorizontal: 4,
  },
  talentLocation: {
    fontSize: 11,
    marginLeft: 2,
  },
  appCard: {
    marginBottom: Spacing.sm,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
  },
  appJob: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.md,
  },
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  ctaDesc: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    marginLeft: Spacing.md,
  },
  bottomSpacing: {
    height: Spacing['3xl'],
  },
});
