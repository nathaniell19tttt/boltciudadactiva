import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, Clock, CheckCircle, XCircle, Calendar, MessageCircle, ChevronRight, Briefcase } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function ApplicationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const { data: worker } = await supabase
        .from('worker_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (worker) {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            job:jobs(*, company:company_profiles(id, name, logo_url)),
            worker:worker_profiles(*)
          `)
          .eq('worker_id', worker.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setApplications(data);
        }
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const getStatusConfig = (status: string) => {
    const config: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'neutral' | 'error'; icon: any }> = {
      received: { label: 'Recibida', variant: 'primary', icon: FileText },
      reviewing: { label: 'En revisión', variant: 'warning', icon: Clock },
      interview: { label: 'Entrevista', variant: 'success', icon: Calendar },
      test: { label: 'Prueba técnica', variant: 'primary', icon: FileText },
      waiting: { label: 'En espera', variant: 'neutral', icon: Clock },
      hired: { label: 'Contratado', variant: 'success', icon: CheckCircle },
      rejected: { label: 'No seleccionado', variant: 'error', icon: XCircle },
    };
    return config[status] || config.received;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const ApplicationCard = ({ app }: { app: any }) => {
    const config = getStatusConfig(app.status);
    const StatusIcon = config.icon;

    return (
      <TouchableOpacity onPress={() => router.push(`/(worker)/jobs/${app.job_id}`)}>
        <Card style={styles.appCard}>
          <View style={styles.appHeader}>
            <Avatar source={app.job?.company?.logo_url} name={app.job?.company?.name} size={50} />
            <View style={styles.appInfo}>
              <Text style={[styles.jobTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {app.job?.title}
              </Text>
              <Text style={[styles.companyName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {app.job?.company?.name}
              </Text>
            </View>
          </View>

          <View style={styles.appStatus}>
            <Badge text={config.label} variant={config.variant} size="md" />
            <Text style={[styles.appliedDate, { color: theme.colors.textTertiary }]}>
              Postulado: {formatDate(app.created_at)}
            </Text>
          </View>

          <View style={styles.appActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.primary[50] }]}
              onPress={() => router.push(`/(worker)/jobs/${app.job_id}`)}
            >
              <Briefcase size={16} color={theme.colors.primary[500]} />
              <Text style={[styles.actionText, { color: theme.colors.primary[500] }]}>Ver vacante</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => router.push(`/(worker)/messages/${app.job?.company?.id}`)}
            >
              <MessageCircle size={16} color={theme.colors.text} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Mensaje</Text>
            </TouchableOpacity>
          </View>

          {app.notes && (
            <View style={[styles.notesBox, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.notesLabel, { color: theme.colors.text }]}>Notas:</Text>
              <Text style={[styles.notesText, { color: theme.colors.textSecondary }]}>
                {app.notes}
              </Text>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: theme.colors.primary[50] }]}>
          <Text style={[styles.statNumber, { color: theme.colors.primary[600] }]}>
            {applications.filter(a => a.status === 'received' || a.status === 'reviewing').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.primary[500] }]}>En proceso</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.colors.success[50] }]}>
          <Text style={[styles.statNumber, { color: theme.colors.success[600] }]}>
            {applications.filter(a => a.status === 'interview' || a.status === 'hired').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.success[500] }]}>Avanzaron</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.colors.error[50] }]}>
          <Text style={[styles.statNumber, { color: theme.colors.error[600] }]}>
            {applications.filter(a => a.status === 'rejected').length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.error[500] }]}>No seleccionado</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ApplicationCard app={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FileText size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin postulaciones</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Cuando postules a empleos, aparecerán aquí
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: { flexDirection: 'row', padding: Spacing.screenPadding, gap: Spacing.md },
  statBox: { flex: 1, padding: Spacing.md, borderRadius: Spacing.radius.lg, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: Spacing.xs },
  listContent: { padding: Spacing.screenPadding },
  appCard: { marginBottom: Spacing.md },
  appHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  appInfo: { flex: 1, marginLeft: Spacing.md },
  jobTitle: { fontSize: 15, fontWeight: '600' },
  companyName: { fontSize: 13, marginTop: 2 },
  appStatus: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  appliedDate: { fontSize: 12 },
  appActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.md, gap: 4 },
  actionText: { fontSize: 13 },
  notesBox: { padding: Spacing.sm, borderRadius: Spacing.radius.md, marginTop: Spacing.md },
  notesLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  notesText: { fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
});
