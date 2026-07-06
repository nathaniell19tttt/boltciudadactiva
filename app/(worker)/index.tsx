import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, TrendingUp, Clock, ChevronRight, Search, Briefcase, GraduationCap, Calendar, Users } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, SearchBar, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function WorkerHomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const workerProfile = profile as any;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const fetchHomeData = async () => {
    try {
      // Fetch recommended jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*, company:company_profiles(id, name, logo_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (jobsData) setJobs(jobsData);

      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('rating', { ascending: false })
        .limit(3);

      if (coursesData) setCourses(coursesData);

      // Fetch events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);

      if (eventsData) setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHomeData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const stats = [
    { label: 'Empleos nuevos', value: '15', color: theme.colors.primary[500] },
    { label: 'Postulaciones', value: '3', color: theme.colors.secondary[500] },
    { label: 'Vistas perfil', value: '8', color: theme.colors.success[500] },
  ];

  const quickActions = [
    { label: 'Empleos', icon: Briefcase, route: '/(worker)/jobs', color: theme.colors.primary[500] },
    { label: 'Cursos', icon: GraduationCap, route: '/(worker)/courses', color: theme.colors.secondary[500] },
    { label: 'Eventos', icon: Calendar, route: '/(worker)/events', color: theme.colors.success[500] },
    { label: 'Comunidad', icon: Users, route: '/(worker)/community', color: theme.colors.info[500] },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeHeader}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              {getGreeting()},
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {workerProfile?.first_name || 'Usuario'}
            </Text>
          </View>
          <Avatar
            source={workerProfile?.photo_url}
            name={workerProfile ? `${workerProfile.first_name} ${workerProfile.last_name}` : 'Usuario'}
            size={50}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statItem, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar empleos, cursos, eventos..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Acciones rápidas</Text>
        </View>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickActionItem, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <action.icon size={24} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.colors.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recommended Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Empleos recomendados</Text>
          <TouchableOpacity onPress={() => router.push('/(worker)/jobs')}>
            <Text style={[styles.seeAll, { color: theme.colors.primary[500] }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <TouchableOpacity key={job.id} onPress={() => router.push(`/(worker)/jobs/${job.id}`)}>
              <Card style={styles.jobCard}>
                <View style={styles.jobCardContent}>
                  <Avatar
                    source={job.company?.logo_url}
                    name={job.company?.name}
                    size={50}
                  />
                  <View style={styles.jobInfo}>
                    <Text style={[styles.jobTitle, { color: theme.colors.text }]} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={[styles.jobCompany, { color: theme.colors.textSecondary }]}>
                      {job.company?.name}
                    </Text>
                    <View style={styles.jobMeta}>
                      {job.district && (
                        <>
                          <MapPin size={12} color={theme.colors.textTertiary} />
                          <Text style={[styles.jobMetaText, { color: theme.colors.textTertiary }]}>
                            {job.district}
                          </Text>
                        </>
                      )}
                      {job.contract_type && (
                        <>
                          <Text style={[styles.jobMetaSeparator, { color: theme.colors.textTertiary }]}>•</Text>
                          <Briefcase size={12} color={theme.colors.textTertiary} />
                          <Text style={[styles.jobMetaText, { color: theme.colors.textTertiary }]}>
                            {job.contract_type}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <ChevronRight size={20} color={theme.colors.textTertiary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No hay empleos disponibles
            </Text>
          </View>
        )}
      </View>

      {/* Courses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Capacitaciones</Text>
          <TouchableOpacity onPress={() => router.push('/(worker)/courses')}>
            <Text style={[styles.seeAll, { color: theme.colors.primary[500] }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {courses.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {courses.map((course) => (
              <Card key={course.id} style={styles.courseCard}>
                <Text style={[styles.courseTitle, { color: theme.colors.text }]} numberOfLines={2}>
                  {course.title}
                </Text>
                <Text style={[styles.courseInstructor, { color: theme.colors.textSecondary }]}>
                  {course.instructor}
                </Text>
                <View style={styles.courseMeta}>
                  {course.level && (
                    <Badge text={course.level} variant="primary" size="sm" />
                  )}
                  <Text style={[styles.coursePrice, { color: theme.colors.success[600] }]}>
                    {course.price === 0 ? 'Gratis' : `S/ ${course.price}`}
                  </Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        ) : null}
      </View>

      {/* Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Próximos eventos</Text>
          <TouchableOpacity onPress={() => router.push('/(worker)/events')}>
            <Text style={[styles.seeAll, { color: theme.colors.primary[500] }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} style={styles.eventCard}>
              <View style={styles.eventContent}>
                <View style={[styles.eventDate, { backgroundColor: theme.colors.primary[100] }]}>
                  <Text style={[styles.eventDay, { color: theme.colors.primary[700] }]}>
                    {new Date(event.date).getDate()}
                  </Text>
                  <Text style={[styles.eventMonth, { color: theme.colors.primary[500] }]}>
                    {new Date(event.date).toLocaleDateString('es-ES', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventTitle, { color: theme.colors.text }]} numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text style={[styles.eventLocation, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                    {event.location}
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textTertiary} />
              </View>
            </Card>
          ))
        ) : null}
      </View>

      {/* Tip Card */}
      <View style={styles.section}>
        <Card style={[styles.tipCard, { backgroundColor: theme.colors.primary[50] }]}>
          <TrendingUp size={24} color={theme.colors.primary[500]} />
          <View style={styles.tipContent}>
            <Text style={[styles.tipTitle, { color: theme.colors.primary[700] }]}>
              Completa tu perfil
            </Text>
            <Text style={[styles.tipDesc, { color: theme.colors.primary[600] }]}>
              Un perfil completo aumenta tus posibilidades de ser contratado
            </Text>
          </View>
          <Button title="Mejorar" size="sm" onPress={() => router.push('/(worker)/profile')} />
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
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    borderRadius: Spacing.radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: Spacing.xs,
  },
  statLabelWorker: {
    fontSize: 12,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.lg,
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
    gap: Spacing.md,
  },
  quickActionItem: {
    flex: 1,
    borderRadius: Spacing.radius.xl,
    padding: Spacing.base,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  jobCard: {
    marginBottom: Spacing.sm,
  },
  jobCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  jobCompany: {
    fontSize: 13,
    marginTop: 2,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  jobMetaText: {
    fontSize: 12,
    marginLeft: 2,
  },
  jobMetaSeparator: {
    marginHorizontal: 4,
  },
  courseCard: {
    width: 180,
    marginRight: Spacing.md,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  courseInstructor: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coursePrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventCard: {
    marginBottom: Spacing.sm,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDate: {
    width: 50,
    height: 50,
    borderRadius: Spacing.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventMonth: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    padding: Spacing['2xl'],
    borderRadius: Spacing.radius.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  bottomSpacing: {
    height: Spacing['3xl'],
  },
});
