import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Users, Briefcase, Eye, Clock, CheckCircle, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Badge, Screen } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const companyProfile = profile as any;

  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    activeVacancies: 0,
    totalApplications: 0,
    interviewsScheduled: 0,
    hiresCompleted: 0,
    profileViews: 0,
    avgTimeToHire: 0,
    conversionRate: 0,
    applicationsPerVacancy: 0,
  });
  const [vacanciesData, setVacanciesData] = useState<any[]>([]);
  const [applicationsData, setApplicationsData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [companyProfile, period]);

  const loadAnalytics = async () => {
    if (!companyProfile?.id) return;

    setLoading(true);

    try {
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case 'day': startDate = new Date(now.setDate(now.getDate() - 1)); break;
        case 'week': startDate = new Date(now.setDate(now.getDate() - 7)); break;
        case 'month': startDate = new Date(now.setMonth(now.getMonth() - 1)); break;
        case 'year': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      }

      // Vacantes activas
      const { data: vacancies } = await supabase
        .from('jobs')
        .select('*, applications(count)')
        .eq('company_id', companyProfile.id);

      if (vacancies) {
        setVacanciesData(vacancies);
        const active = vacancies.filter(v => v.status === 'active').length;
        setStats(prev => ({ ...prev, activeVacancies: active }));
      }

      // Postulaciones
      const { data: applications } = await supabase
        .from('applications')
        .select('*, job:jobs(company_id)')
        .eq('job.company_id', companyProfile.id)
        .gte('created_at', startDate.toISOString());

      if (applications) {
        setApplicationsData(applications);
        setStats(prev => ({
          ...prev,
          totalApplications: applications.length,
          interviewsScheduled: applications.filter(a => a.status === 'entrevista').length,
          hiresCompleted: applications.filter(a => a.status === 'contratado').length,
          conversionRate: applications.length > 0 ? Math.round((applications.filter(a => a.status === 'contratado').length / applications.length) * 100) : 0,
          applicationsPerVacancy: vacancies?.length ? Math.round(applications.length / vacancies.length) : 0,
        }));
      }

      // Profile views
      const { data: viewsData } = await supabase
        .from('profile_views')
        .select('*')
        .eq('company_id', companyProfile.id)
        .gte('created_at', startDate.toISOString());

      if (viewsData) {
        setStats(prev => ({ ...prev, profileViews: viewsData.length }));
      }

      // Time to hire
      const hiredApps = applications?.filter(a => a.status === 'contratado' && a.updated_at);
      if (hiredApps && hiredApps.length > 0) {
        const avgDays = hiredApps.reduce((sum, app) => {
          const days = Math.floor((new Date(app.updated_at).getTime() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / hiredApps.length;
        setStats(prev => ({ ...prev, avgTimeToHire: Math.round(avgDays) }));
      }

    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const periods = [
    { id: 'day', label: 'Hoy' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
    { id: 'year', label: 'Año' },
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: { title: string; value: string | number; subtitle?: string; icon: any; color: string; trend?: 'up' | 'down' | null }) => (
    <Card style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '20' }]}>
        <Icon size={22} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
        <View style={styles.statValueRow}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
          {trend === 'up' && <ArrowUpRight size={16} color={theme.colors.success[500]} />}
          {trend === 'down' && <ArrowDownRight size={16} color={theme.colors.error[500]} />}
        </View>
        {subtitle && (
          <Text style={[styles.statSubtitle, { color: theme.colors.textTertiary }]}>{subtitle}</Text>
        )}
      </View>
    </Card>
  );

  const VacancyAnalyticsCard = ({ vacancy }: { vacancy: any }) => {
    const appsCount = vacancy.applications?.[0]?.count || 0;
    const viewsCount = vacancy.views_count || 0;

    return (
      <Card style={styles.vacancyCard}>
        <Text style={[styles.vacancyTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {vacancy.title}
        </Text>
        <View style={styles.vacancyStats}>
          <View style={styles.vacancyStatItem}>
            <Users size={14} color={theme.colors.primary[500]} />
            <Text style={[styles.vacancyStatText, { color: theme.colors.textSecondary }]}>
              {appsCount} postulantes
            </Text>
          </View>
          <View style={styles.vacancyStatItem}>
            <Eye size={14} color={theme.colors.info[500]} />
            <Text style={[styles.vacancyStatText, { color: theme.colors.textSecondary }]}>
              {viewsCount} vistas
            </Text>
          </View>
          <Badge
            text={vacancy.status === 'active' ? 'Activa' : 'Inactiva'}
            variant={vacancy.status === 'active' ? 'success' : 'neutral'}
            size="sm"
          />
        </View>
      </Card>
    );
  };

  return (
    <Screen>
      {/* Period Selector */}
      <View style={styles.periodHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodTabs}>
          {periods.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[styles.periodTab, period === p.id && { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => setPeriod(p.id)}
            >
              <Text style={[styles.periodTabText, period === p.id && { color: '#FFFFFF' }]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Vacantes activas"
            value={stats.activeVacancies}
            icon={Briefcase}
            color={theme.colors.primary[500]}
          />
          <StatCard
            title="Postulaciones"
            value={stats.totalApplications}
            icon={Users}
            color={theme.colors.success[500]}
          />
          <StatCard
            title="Entrevistas"
            value={stats.interviewsScheduled}
            icon={Calendar}
            color={theme.colors.warning[500]}
          />
          <StatCard
            title="Contrataciones"
            value={stats.hiresCompleted}
            icon={CheckCircle}
            color={theme.colors.success[500]}
          />
        </View>

        {/* KPIs */}
        <Card style={styles.kpiCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Indicadores clave</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: theme.colors.primary[600] }]}>{stats.profileViews}</Text>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Vistas al perfil</Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: theme.colors.success[600] }]}>{stats.conversionRate}%</Text>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Tasa de conversión</Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: theme.colors.warning[600] }]}>{stats.avgTimeToHire}d</Text>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Tiempo promedio</Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: theme.colors.info[600] }]}>{stats.applicationsPerVacancy}</Text>
              <Text style={[styles.kpiLabel, { color: theme.colors.textSecondary }]}>Apps/vacante</Text>
            </View>
          </View>
        </Card>

        {/* Performance Chart Placeholder */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Rendimiento</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.primary[500] }]} />
                <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>Postulaciones</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: theme.colors.success[500] }]} />
                <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>Contrataciones</Text>
              </View>
            </View>
          </View>
          <View style={styles.chartPlaceholder}>
            <TrendingUp size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.chartPlaceholderText, { color: theme.colors.textTertiary }]}>
              Gráfico de rendimiento próximamente
            </Text>
          </View>
        </Card>

        {/* Vacancy Analytics */}
        <View style={styles.vacancySection}>
          <View style={styles.vacancySectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Vacantes</Text>
            <TouchableOpacity onPress={() => router.push('/(company)/vacancies')}>
              <Text style={[styles.viewAllText, { color: theme.colors.primary[500] }]}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {vacanciesData.slice(0, 5).map((vacancy) => (
            <VacancyAnalyticsCard key={vacancy.id} vacancy={vacancy} />
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  periodHeader: { paddingVertical: Spacing.sm },
  periodTabs: { paddingHorizontal: Spacing.screenPadding, gap: Spacing.sm },
  periodTab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full, backgroundColor: '#E0E0E0' },
  periodTabText: { fontSize: 14, color: '#424242', fontWeight: '500' },
  scrollContent: { padding: Spacing.screenPadding },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.lg },
  statCard: { width: '48%', flexDirection: 'row', paddingVertical: Spacing.md },
  statIconWrap: { width: 44, height: 44, borderRadius: Spacing.radius.md, justifyContent: 'center', alignItems: 'center' },
  statContent: { flex: 1, marginLeft: Spacing.sm },
  statTitle: { fontSize: 12 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statSubtitle: { fontSize: 11, marginTop: 2 },
  kpiCard: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: Spacing.md },
  kpiRow: { flexDirection: 'row', alignItems: 'center' },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiValue: { fontSize: 24, fontWeight: '700' },
  kpiLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  kpiDivider: { width: 1, height: 40, backgroundColor: 'rgba(0,0,0,0.1)' },
  chartCard: { marginBottom: Spacing.lg },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  chartLegend: { flexDirection: 'row', gap: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11 },
  chartPlaceholder: { height: 180, justifyContent: 'center', alignItems: 'center' },
  chartPlaceholderText: { fontSize: 13, marginTop: Spacing.sm },
  vacancySection: { marginBottom: Spacing.lg },
  vacancySectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  viewAllText: { fontSize: 14, fontWeight: '500' },
  vacancyCard: { marginBottom: Spacing.sm },
  vacancyTitle: { fontSize: 14, fontWeight: '600' },
  vacancyStats: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.sm },
  vacancyStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  vacancyStatText: { fontSize: 12 },
  bottomSpacing: { height: Spacing['2xl'] },
});
