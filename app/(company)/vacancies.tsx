import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Eye, Users, Clock, MoreVertical, Calendar, Pause, Play, Copy, Trash2, FileText } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Button, SearchBar } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function VacanciesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const companyProfile = profile as any;

  const fetchJobs = async () => {
    if (!companyProfile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', companyProfile.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [companyProfile?.id]);

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', jobId);

      if (!error) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      }
    } catch (err) {
      console.error('Error updating job:', err);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (!error) {
        setJobs(prev => prev.filter(j => j.id !== jobId));
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.success[500];
      case 'paused': return theme.colors.warning[500];
      case 'closed': return theme.colors.error[500];
      default: return theme.colors.neutral[500];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'paused': return 'Pausada';
      case 'closed': return 'Cerrada';
      case 'expired': return 'Expirada';
      default: return status;
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const JobCard = ({ job }: { job: any }) => (
    <Card style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobTitleRow}>
          <Text style={[styles.jobTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {job.title}
          </Text>
          <Badge
            text={getStatusLabel(job.status)}
            variant={job.status === 'active' ? 'success' : job.status === 'paused' ? 'warning' : 'neutral'}
            size="sm"
          />
        </View>
        <Text style={[styles.jobDate, { color: theme.colors.textSecondary }]}>
          Publicado: {formatDate(job.created_at)}
        </Text>
      </View>

      <View style={styles.jobStats}>
        <View style={styles.statItem}>
          <Eye size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {job.views || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>vistas</Text>
        </View>
        <View style={styles.statItem}>
          <Users size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {job.applications_count || 0}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>postulantes</Text>
        </View>
        {job.deadline && (
          <View style={styles.statItem}>
            <Clock size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {formatDate(job.deadline)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.jobTags}>
        {job.modality && (
          <Badge text={job.modality} variant="primary" size="sm" />
        )}
        {job.contract_type && (
          <Badge text={job.contract_type} variant="secondary" size="sm" />
        )}
        {job.district && (
          <Badge text={job.district} variant="neutral" size="sm" />
        )}
      </View>

      <View style={styles.jobActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary[50] }]}
          onPress={() => router.push(`/(company)/vacancies/${job.id}`)}
        >
          <Eye size={18} color={theme.colors.primary[500]} />
          <Text style={[styles.actionText, { color: theme.colors.primary[500] }]}>Ver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => router.push(`/(company)/talent?job=${job.id}`)}
        >
          <Users size={18} color={theme.colors.text} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Postulantes</Text>
        </TouchableOpacity>

        {job.status === 'active' ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.warning[50] }]}
            onPress={() => updateJobStatus(job.id, 'paused')}
          >
            <Pause size={18} color={theme.colors.warning[500]} />
            <Text style={[styles.actionText, { color: theme.colors.warning[500] }]}>Pausar</Text>
          </TouchableOpacity>
        ) : job.status === 'paused' ? (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.success[50] }]}
            onPress={() => updateJobStatus(job.id, 'active')}
          >
            <Play size={18} color={theme.colors.success[500]} />
            <Text style={[styles.actionText, { color: theme.colors.success[500] }]}>Activar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar vacantes..."
          onClear={() => setSearchQuery('')}
        />
        <Button
          title="Nueva"
          onPress={() => router.push('/(company)/vacancies/create')}
          leftIcon={<Plus size={18} color="#FFFFFF" />}
          size="md"
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.bigNumber, { color: theme.colors.primary[500] }]}>
            {jobs.filter(j => j.status === 'active').length}
          </Text>
          <Text style={[styles.smallLabel, { color: theme.colors.textSecondary }]}>Activas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text style={[styles.bigNumber, { color: theme.colors.success[500] }]}>
            {jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0)}
          </Text>
          <Text style={[styles.smallLabel, { color: theme.colors.textSecondary }]}>Postulaciones</Text>
        </View>
      </View>

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileText size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No hay vacantes
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Crea tu primera vacante para empezar a recibir postulaciones
            </Text>
            <Button
              title="Publicar vacante"
              onPress={() => router.push('/(company)/vacancies/create')}
              style={styles.emptyButton}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: Spacing.screenPadding,
    alignItems: 'center',
    gap: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Spacing.radius.lg,
    alignItems: 'center',
  },
  bigNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  smallLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    padding: Spacing.screenPadding,
    paddingTop: 0,
  },
  jobCard: {
    marginBottom: Spacing.md,
  },
  jobHeader: {
    marginBottom: Spacing.md,
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  jobDate: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  jobStats: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  jobTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  jobActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.md,
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  emptyDesc: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    minWidth: 180,
  },
});
