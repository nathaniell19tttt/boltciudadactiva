import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Filter, ChevronDown, CheckCircle, Clock, XCircle, Calendar, MessageCircle, Eye, User, Briefcase } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Button, Screen } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CompanyApplicationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const companyProfile = profile as any;

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [jobs, setJobs] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [companyProfile]);

  const loadData = async () => {
    if (!companyProfile?.id) return;

    setLoading(true);

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('company_id', companyProfile.id);
    if (jobsData) setJobs(jobsData);

    let query = supabase
      .from('applications')
      .select('*, job:jobs(title), worker:worker_profiles(*)')
      .in('job_id', jobsData?.map(j => j.id) || [])
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    if (jobFilter !== 'all') {
      query = query.eq('job_id', jobFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setApplications(data);
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const updateStatus = async (applicationId: string, newStatus: string) => {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', applicationId);

    if (!error) {
      loadData();
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'recibida':
        return { label: 'Recibida', icon: Clock, color: theme.colors.neutral[500], bgColor: theme.colors.neutral[100] };
      case 'en_revision':
        return { label: 'En revisión', icon: Eye, color: theme.colors.info[500], bgColor: theme.colors.info[100] };
      case 'entrevista':
        return { label: 'Entrevista', icon: Calendar, color: theme.colors.warning[500], bgColor: theme.colors.warning[100] };
      case 'contratado':
        return { label: 'Contratado', icon: CheckCircle, color: theme.colors.success[500], bgColor: theme.colors.success[100] };
      case 'rechazado':
        return { label: 'No seleccionado', icon: XCircle, color: theme.colors.error[500], bgColor: theme.colors.error[100] };
      default:
        return { label: status, icon: Clock, color: theme.colors.text, bgColor: theme.colors.surfaceVariant };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const statusFilters = [
    { id: 'all', label: 'Todas' },
    { id: 'recibida', label: 'Recibidas' },
    { id: 'en_revision', label: 'En revisión' },
    { id: 'entrevista', label: 'Entrevista' },
    { id: 'contratado', label: 'Contratados' },
    { id: 'rechazado', label: 'Rechazados' },
  ];

  const ApplicationCard = ({ application }: { application: any }) => {
    const config = getStatusConfig(application.status);
    const StatusIcon = config.icon;
    const worker = application.worker;

    return (
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity style={styles.workerInfo} onPress={() => router.push(`/(company)/talent/${worker?.id}`)}>
            <Avatar
              source={worker?.photo_url}
              name={`${worker?.first_name || ''} ${worker?.last_name || ''}`}
              size={52}
            />
            <View style={styles.workerDetails}>
              <Text style={[styles.workerName, { color: theme.colors.text }]}>
                {worker?.first_name} {worker?.last_name}
              </Text>
              <Text style={[styles.profession, { color: theme.colors.textSecondary }]}>
                {worker?.profession || 'Sin profesión'}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            <StatusIcon size={14} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <View style={[styles.jobRow, { borderTopColor: theme.colors.border }]}>
          <Briefcase size={16} color={theme.colors.primary[500]} />
          <Text style={[styles.jobTitle, { color: theme.colors.text }]}>
            {application.job?.title}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateInfo}>
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              Postuló el {formatDate(application.created_at)}
            </Text>
            {application.availability && (
              <Text style={[styles.availabilityText, { color: theme.colors.textTertiary }]}>
                Disponibilidad: {application.availability}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/(company)/talent/${worker?.id}`)}>
              <User size={16} color={theme.colors.primary[500]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => updateStatus(application.id, application.status === 'en_revision' ? 'entrevista' : 'en_revision')}
            >
              <Eye size={16} color={theme.colors.info[500]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <MessageCircle size={16} color={theme.colors.success[500]} />
            </TouchableOpacity>
          </View>
        </View>

        {application.status === 'entrevista' && application.interview_date && (
          <View style={[styles.interviewBanner, { backgroundColor: theme.colors.warning[50] }]}>
            <Calendar size={16} color={theme.colors.warning[600]} />
            <Text style={[styles.interviewText, { color: theme.colors.warning[700] }]}>
              Entrevista: {new Date(application.interview_date).toLocaleString('es-ES')}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: applications.length };
    applications.forEach(app => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <Screen>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Postulaciones</Text>
          <TouchableOpacity style={styles.filterToggleBtn} onPress={() => setShowFilters(!showFilters)}>
            <Filter size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[styles.statChip, statusFilter === filter.id && { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => { setStatusFilter(filter.id); loadData(); }}
            >
              <Text style={[styles.statChipText, statusFilter === filter.id && { color: '#FFFFFF' }]}>
                {filter.label} ({statusCounts[filter.id] || 0})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={[styles.filtersPanel, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Filtrar por vacante</Text>
          <View style={styles.jobFiltersRow}>
            <TouchableOpacity
              style={[styles.jobFilterBtn, jobFilter === 'all' && { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => { setJobFilter('all'); loadData(); }}
            >
              <Text style={[styles.jobFilterText, jobFilter === 'all' && { color: '#FFFFFF' }]}>Todas</Text>
            </TouchableOpacity>
            {jobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                style={[styles.jobFilterBtn, jobFilter === job.id && { backgroundColor: theme.colors.primary[500] }]}
                onPress={() => { setJobFilter(job.id); loadData(); }}
              >
                <Text style={[styles.jobFilterText, jobFilter === job.id && { color: '#FFFFFF' }]} numberOfLines={1}>
                  {job.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Applications List */}
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ApplicationCard application={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Users size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin postulaciones</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              {statusFilter !== 'all' ? 'No hay postulaciones con este estado' : 'Los candidatos aparecerán aquí'}
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.screenPadding, paddingBottom: Spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  filterToggleBtn: { padding: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  statChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full, backgroundColor: '#E0E0E0' },
  statChipText: { fontSize: 13, color: '#424242' },
  filtersPanel: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  filterLabel: { fontSize: 13, fontWeight: '500', marginBottom: Spacing.sm },
  jobFiltersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  jobFilterBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full, backgroundColor: '#E0E0E0' },
  jobFilterText: { fontSize: 13, color: '#424242' },
  listContent: { padding: Spacing.screenPadding },
  card: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  workerDetails: { marginLeft: Spacing.md, flex: 1 },
  workerName: { fontSize: 15, fontWeight: '600' },
  profession: { fontSize: 13, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Spacing.radius.sm },
  statusText: { fontSize: 11, fontWeight: '500' },
  jobRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1 },
  jobTitle: { fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
  dateInfo: {},
  dateText: { fontSize: 12 },
  availabilityText: { fontSize: 11, marginTop: 2 },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  interviewBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md, padding: Spacing.md, borderRadius: Spacing.radius.md },
  interviewText: { fontSize: 13, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
});
