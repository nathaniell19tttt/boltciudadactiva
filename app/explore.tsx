import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Briefcase, GraduationCap, Calendar, ChevronRight, Clock, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const PRIMARY = '#1976D2';
const TEXT_PRIMARY = '#1A1A2E';
const TEXT_SECONDARY = '#5C6370';
const SURFACE = '#F8F9FA';
const SUCCESS = '#16A34A';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*, company:company_profiles(id, name, logo_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (jobsData) setJobs(jobsData);

      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('rating', { ascending: false })
        .limit(4);

      if (coursesData) setCourses(coursesData);

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);

      if (eventsData) setEvents(eventsData);
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
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explorar oportunidades</Text>
          <Text style={styles.subtitle}>
            Descubre empleos, cursos y eventos disponibles para ti
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Briefcase size={20} color={PRIMARY} />
            <Text style={[styles.statNumber, { color: PRIMARY }]}>{jobs.length}</Text>
            <Text style={styles.statLabel}>Empleos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <GraduationCap size={20} color="#7B1FA2" />
            <Text style={[styles.statNumber, { color: '#7B1FA2' }]}>{courses.length}</Text>
            <Text style={styles.statLabel}>Cursos</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Calendar size={20} color={SUCCESS} />
            <Text style={[styles.statNumber, { color: SUCCESS }]}>{events.length}</Text>
            <Text style={styles.statLabel}>Eventos</Text>
          </View>
        </View>

        {/* Jobs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Briefcase size={20} color={PRIMARY} />
              <Text style={styles.sectionTitle}>Empleos disponibles</Text>
            </View>
          </View>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobCardContent}>
                  <View style={[styles.companyLogo, { backgroundColor: SURFACE }]}>
                    <Text style={styles.logoText}>
                      {job.company?.name?.charAt(0) || 'E'}
                    </Text>
                  </View>
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                    <Text style={styles.jobCompany}>{job.company?.name}</Text>
                    <View style={styles.jobMeta}>
                      {job.district && (
                        <View style={styles.metaItem}>
                          <MapPin size={12} color={TEXT_SECONDARY} />
                          <Text style={styles.metaText}>{job.district}</Text>
                        </View>
                      )}
                      {job.contract_type && (
                        <View style={styles.metaItem}>
                          <Clock size={12} color={TEXT_SECONDARY} />
                          <Text style={styles.metaText}>{job.contract_type}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <ChevronRight size={20} color={TEXT_SECONDARY} />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay empleos disponibles</Text>
            </View>
          )}
        </View>

        {/* Courses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <GraduationCap size={20} color="#7B1FA2" />
              <Text style={styles.sectionTitle}>Capacitaciones</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <View key={course.id} style={styles.courseCard}>
                  <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                  <Text style={styles.courseInstructor}>{course.instructor}</Text>
                  <View style={styles.courseMeta}>
                    {course.level && (
                      <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{course.level}</Text>
                      </View>
                    )}
                    <Text style={styles.coursePrice}>
                      {course.price === 0 ? 'Gratis' : `S/ ${course.price}`}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No hay cursos disponibles</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Calendar size={20} color={SUCCESS} />
              <Text style={styles.sectionTitle}>Proximos eventos</Text>
            </View>
          </View>
          {events.length > 0 ? (
            events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventContent}>
                  <View style={styles.eventDate}>
                    <Text style={styles.eventDay}>
                      {new Date(event.date).getDate()}
                    </Text>
                    <Text style={styles.eventMonth}>
                      {new Date(event.date).toLocaleDateString('es-ES', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={styles.eventLocation} numberOfLines={1}>{event.location}</Text>
                  </View>
                  <ChevronRight size={20} color={TEXT_SECONDARY} />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay eventos proximos</Text>
            </View>
          )}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Users size={32} color={PRIMARY} />
          <Text style={styles.ctaTitle}>Unete a nuestra comunidad</Text>
          <Text style={styles.ctaDesc}>
            Registrate para aplicar a empleos, inscribirte en cursos y participar en eventos
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/register')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>Crear cuenta gratis</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctaSecondary}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaSecondaryText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  jobCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  jobCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
  },
  jobInfo: {
    flex: 1,
    marginLeft: 14,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  jobCompany: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  courseCard: {
    width: 160,
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelBadge: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  coursePrice: {
    fontSize: 13,
    fontWeight: '600',
    color: SUCCESS,
  },
  eventCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    marginBottom: 10,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  eventDate: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '700',
    color: SUCCESS,
  },
  eventMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: SUCCESS,
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 14,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  eventLocation: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  emptyState: {
    padding: 32,
    backgroundColor: SURFACE,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  ctaSection: {
    margin: 20,
    padding: 28,
    backgroundColor: '#E3F2FD',
    borderRadius: 24,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginTop: 12,
    textAlign: 'center',
  },
  ctaDesc: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 20,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaSecondary: {
    marginTop: 12,
  },
  ctaSecondaryText: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: '600',
  },
});
