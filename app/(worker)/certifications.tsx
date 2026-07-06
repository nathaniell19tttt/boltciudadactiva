import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Award, Clock, CheckCircle, XCircle, Play, Download, Share2 } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Badge, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CertificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, [user]);

  const fetchEnrollments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*, course:courses(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setEnrollments(data);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEnrollments();
    setRefreshing(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completado', icon: CheckCircle, color: theme.colors.success[500], bgColor: theme.colors.success[100] };
      case 'in_progress':
        return { label: 'En progreso', icon: Play, color: theme.colors.warning[500], bgColor: theme.colors.warning[100] };
      case 'cancelled':
        return { label: 'Cancelado', icon: XCircle, color: theme.colors.error[500], bgColor: theme.colors.error[100] };
      default:
        return { label: 'Inscrito', icon: Clock, color: theme.colors.primary[500], bgColor: theme.colors.primary[100] };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const EnrollmentCard = ({ enrollment }: { enrollment: any }) => {
    const config = getStatusConfig(enrollment.status);
    const StatusIcon = config.icon;

    return (
      <Card style={styles.enrollmentCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusIcon, { backgroundColor: config.bgColor }]}>
            <StatusIcon size={20} color={config.color} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.courseTitle, { color: theme.colors.text }]} numberOfLines={2}>
              {enrollment.course?.title}
            </Text>
            <Text style={[styles.courseInstructor, { color: theme.colors.textSecondary }]}>
              {enrollment.course?.instructor}
            </Text>
          </View>
        </View>

        {/* Progress */}
        {enrollment.status === 'in_progress' && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.colors.text }]}>Progreso</Text>
              <Text style={[styles.progressValue, { color: theme.colors.primary[600] }]}>{enrollment.progress}%</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.neutral[200] }]}>
              <View style={[styles.progressFill, { backgroundColor: theme.colors.primary[500], width: `${enrollment.progress}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
              Inicio: {formatDate(enrollment.created_at)}
            </Text>
            {enrollment.completed_at && (
              <Text style={[styles.dateText, { color: theme.colors.success[600] }]}>
                Fin: {formatDate(enrollment.completed_at)}
              </Text>
            )}
          </View>
          <Badge text={config.label} variant={enrollment.status === 'completed' ? 'success' : enrollment.status === 'in_progress' ? 'warning' : 'neutral'} />

          {enrollment.status === 'completed' && enrollment.course?.certificate && (
            <View style={styles.actions}>
              <Button title="Certificado" size="sm" leftIcon={<Download size={16} color="#FFFFFF" />} onPress={() => {}} />
            </View>
          )}
        </View>
      </Card>
    );
  };

  // Stats
  const completed = enrollments.filter(e => e.status === 'completed').length;
  const inProgress = enrollments.filter(e => e.status === 'in_progress').length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={[styles.statBox, { backgroundColor: theme.colors.success[50] }]}>
          <Award size={24} color={theme.colors.success[500]} />
          <Text style={[styles.statNumber, { color: theme.colors.success[600] }]}>{completed}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.success[500] }]}>Completados</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: theme.colors.warning[50] }]}>
          <Play size={24} color={theme.colors.warning[500]} />
          <Text style={[styles.statNumber, { color: theme.colors.warning[600] }]}>{inProgress}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.warning[500] }]}>En progreso</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EnrollmentCard enrollment={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Award size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin certificaciones</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Inscribete en cursos para obtener certificados
            </Text>
            <Button
              title="Ver cursos"
              variant="outline"
              onPress={() => router.push('/(worker)/courses')}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', padding: Spacing.screenPadding, gap: Spacing.md },
  statBox: { flex: 1, padding: Spacing.md, borderRadius: Spacing.radius.xl, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '700', marginTop: Spacing.sm },
  statLabel: { fontSize: 12, marginTop: 4 },
  listContent: { padding: Spacing.screenPadding },
  enrollmentCard: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row' },
  statusIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: Spacing.md },
  courseTitle: { fontSize: 16, fontWeight: '600' },
  courseInstructor: { fontSize: 13, marginTop: 2 },
  progressSection: { marginTop: Spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  progressLabel: { fontSize: 13 },
  progressValue: { fontSize: 14, fontWeight: '600' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  footerInfo: { flex: 1 },
  dateText: { fontSize: 11 },
  actions: { marginTop: Spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
});
