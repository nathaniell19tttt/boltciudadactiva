import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Clock,
  ChevronRight,
  Briefcase,
  GraduationCap,
  Calendar,
  Bookmark,
  BookmarkCheck,
  Bell,
  Star,
  ArrowRight,
  Building2,
} from 'lucide-react-native';
import { useAuth } from '@/contexts';
import { useDemo } from '@/contexts/DemoContext';
import { useDemoRestriction } from '@/hooks';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

const BLUE_DARK = '#173A7A';
const BLUE_MID = '#2454A6';
const ORANGE = '#FF8A00';
const GREEN = '#16A34A';
const GRAY_BG = '#F5F7FB';
const TEXT_MAIN = '#1F2937';
const TEXT_SEC = '#6B7280';
const WHITE = '#FFFFFF';

const EVENT_COLORS = ['#FF8A00', '#173A7A', '#16A34A', '#E11D48'];

// Compact job card for 2-column layout
function JobCard({
  job,
  onPress,
  onSave,
  saved,
}: {
  job: any;
  onPress: () => void;
  onSave: () => void;
  saved: boolean;
}) {
  const initials = (job.company?.name || job.company_name || 'E').charAt(0).toUpperCase();
  const bgColors = ['#173A7A', '#9D174D', '#166534', '#7C3AED', '#B45309'];
  const colorIdx = initials.charCodeAt(0) % bgColors.length;

  return (
    <TouchableOpacity style={styles.jobCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.jobCardHeader}>
        <View style={[styles.jobInitialCircle, { backgroundColor: bgColors[colorIdx] }]}>
          <Text style={styles.jobInitialText}>{initials}</Text>
        </View>
        <TouchableOpacity onPress={onSave} style={styles.jobBookmarkBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {saved ? (
            <BookmarkCheck size={18} color={BLUE_DARK} />
          ) : (
            <Bookmark size={18} color={TEXT_SEC} />
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.jobCardTitle} numberOfLines={2}>{job.title}</Text>
      <Text style={styles.jobCardCompany} numberOfLines={1}>
        {job.company?.name || job.company_name || 'Empresa'}
      </Text>
      {job.district && (
        <View style={styles.jobCardMeta}>
          <MapPin size={11} color={TEXT_SEC} />
          <Text style={styles.jobCardMetaText} numberOfLines={1}>{job.district}</Text>
        </View>
      )}
      {(job.salary_min || job.salary_max) && (
        <Text style={styles.jobCardSalary}>
          S/{job.salary_min?.toLocaleString() || '?'} - {job.salary_max?.toLocaleString() || '?'}
        </Text>
      )}
      <View style={styles.jobTypeBadge}>
        <Text style={styles.jobTypeBadgeText}>
          {job.contract_type === 'part-time' ? 'Medio tiempo' : 'Tiempo completo'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Event card
function EventCard({ event, colorIdx, onSave, saved }: { event: any; colorIdx: number; onSave: () => void; saved: boolean }) {
  const bg = EVENT_COLORS[colorIdx % EVENT_COLORS.length];
  const date = event.date ? new Date(event.date) : null;
  const dayStr = date ? date.getDate().toString().padStart(2, '0') : '--';
  const monthStr = date
    ? date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()
    : '---';

  return (
    <View style={[styles.eventCard, { backgroundColor: bg }]}>
      <View style={styles.eventCardTop}>
        <Calendar size={20} color="rgba(255,255,255,0.9)" />
        <TouchableOpacity onPress={onSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {saved ? (
            <BookmarkCheck size={16} color={WHITE} />
          ) : (
            <Bookmark size={16} color="rgba(255,255,255,0.8)" />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.eventDateBadge}>
        <Text style={styles.eventDateDay}>{dayStr} {monthStr}</Text>
      </View>
      <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
      {event.location && (
        <View style={styles.eventMeta}>
          <MapPin size={11} color="rgba(255,255,255,0.8)" />
          <Text style={styles.eventMetaText} numberOfLines={1}>{event.location}</Text>
        </View>
      )}
      {event.time && (
        <View style={styles.eventMeta}>
          <Clock size={11} color="rgba(255,255,255,0.8)" />
          <Text style={styles.eventMetaText}>{event.time}</Text>
        </View>
      )}
    </View>
  );
}

// Course list row
function CourseRow({ course, onSave, saved }: { course: any; onSave: () => void; saved: boolean }) {
  const iconColors = ['#173A7A', '#16A34A', '#FF8A00', '#7C3AED', '#E11D48'];
  const idx = (course.title || '').length % iconColors.length;
  const bg = iconColors[idx];

  return (
    <View style={styles.courseRow}>
      <View style={[styles.courseIconCircle, { backgroundColor: bg }]}>
        <GraduationCap size={18} color={WHITE} />
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
        <View style={styles.courseMeta}>
          {course.instructor && (
            <View style={styles.courseMetaItem}>
              <View style={styles.instructorDot} />
              <Text style={styles.courseMetaText}>{course.instructor}</Text>
            </View>
          )}
          {course.modality && (
            <View style={styles.courseMetaItem}>
              <Clock size={10} color={TEXT_SEC} />
              <Text style={styles.courseMetaText}>{course.modality}</Text>
            </View>
          )}
          {course.duration && (
            <View style={styles.courseMetaItem}>
              <Clock size={10} color={TEXT_SEC} />
              <Text style={styles.courseMetaText}>{course.duration} horas</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.courseRight}>
        {(course.price === 0 || course.is_free) && (
          <View style={styles.freeBadge}>
            <Text style={styles.freeBadgeText}>Gratis</Text>
          </View>
        )}
        <TouchableOpacity onPress={onSave} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ marginTop: 6 }}>
          {saved ? (
            <BookmarkCheck size={16} color={BLUE_DARK} />
          ) : (
            <Bookmark size={16} color={TEXT_SEC} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function WorkerHomeScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { isDemo, isDevMode } = useDemo();
  const { checkAndProceed } = useDemoRestriction();
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  const workerProfile = profile as any;
  const displayName = (isDemo || isDevMode)
    ? 'Alexandra'
    : (workerProfile?.first_name || 'Usuario');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const fetchHomeData = async () => {
    try {
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*, company:company_profiles(id, name, logo_url)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(8);
      if (jobsData) setJobs(jobsData);

      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      if (coursesData) setCourses(coursesData);

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(4);
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

  const toggleSave = (id: string) => {
    if (!checkAndProceed()) return;
    setSavedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Featured job = first active job
  const featuredJob = jobs[0];
  const remainingJobs = jobs.slice(1, 5);

  // Columns: 2 cards per row
  const jobRows: any[][] = [];
  for (let i = 0; i < remainingJobs.length; i += 2) {
    jobRows.push(remainingJobs.slice(i, i + 2));
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BLUE_DARK} />}
    >
      {/* Header greeting card */}
      <View style={styles.greetingCard}>
        <View>
          <Text style={styles.greetingLabel}>{getGreeting()}</Text>
          <Text style={styles.greetingName}>¡Hola, {displayName}!</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(worker)/notifications')}
          style={styles.bellButton}
        >
          <Bell size={22} color={WHITE} />
        </TouchableOpacity>
      </View>

      {/* Featured opportunity */}
      {featuredJob ? (
        <View style={styles.featuredCard}>
          {/* Decorative circles */}
          <View style={styles.deco1} />
          <View style={styles.deco2} />

          <View style={styles.featuredBadge}>
            <Star size={11} color={ORANGE} fill={ORANGE} />
            <Text style={styles.featuredBadgeText}>Oportunidad destacada</Text>
          </View>

          <TouchableOpacity
            onPress={() => toggleSave(`featured-${featuredJob.id}`)}
            style={styles.featuredBookmark}
          >
            {savedItems.has(`featured-${featuredJob.id}`) ? (
              <BookmarkCheck size={20} color={WHITE} />
            ) : (
              <Bookmark size={20} color="rgba(255,255,255,0.8)" />
            )}
          </TouchableOpacity>

          <Text style={styles.featuredTitle} numberOfLines={2}>{featuredJob.title}</Text>
          <Text style={styles.featuredCompany}>
            {featuredJob.company?.name || 'Empresa'}
          </Text>

          <View style={styles.featuredMeta}>
            {featuredJob.district && (
              <View style={styles.featuredMetaItem}>
                <MapPin size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.featuredMetaText}>{featuredJob.district}</Text>
              </View>
            )}
            {featuredJob.contract_type && (
              <View style={styles.featuredMetaItem}>
                <Clock size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.featuredMetaText}>{featuredJob.contract_type}</Text>
              </View>
            )}
          </View>

          {(featuredJob.salary_min || featuredJob.salary_max) && (
            <Text style={styles.featuredSalary}>
              S/{featuredJob.salary_min?.toLocaleString() || '?'} – {featuredJob.salary_max?.toLocaleString() || '?'}
            </Text>
          )}

          <TouchableOpacity
            style={styles.featuredButton}
            onPress={() => {
              if (!checkAndProceed()) return;
              router.push(`/(worker)/jobs/${featuredJob.id}`);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.featuredButtonText}>Ver detalle</Text>
            <ArrowRight size={16} color={BLUE_DARK} />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Recommended Jobs */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Empleos recomendados</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push('/(worker)/jobs')}
          >
            <Text style={styles.seeAllText}>Ver todos</Text>
            <ChevronRight size={14} color={BLUE_MID} />
          </TouchableOpacity>
        </View>

        {remainingJobs.length > 0 ? (
          jobRows.map((row, ri) => (
            <View key={ri} style={styles.jobRow}>
              {row.map((job) => (
                <View key={job.id} style={styles.jobCardWrapper}>
                  <JobCard
                    job={job}
                    onPress={() => router.push(`/(worker)/jobs/${job.id}`)}
                    onSave={() => toggleSave(`job-${job.id}`)}
                    saved={savedItems.has(`job-${job.id}`)}
                  />
                </View>
              ))}
              {row.length < 2 && <View style={styles.jobCardWrapper} />}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Briefcase size={28} color={TEXT_SEC} />
            <Text style={styles.emptyText}>No hay empleos disponibles</Text>
          </View>
        )}
      </View>

      {/* Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Eventos próximos</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push('/(worker)/events')}
          >
            <Text style={styles.seeAllText}>Ver todos</Text>
            <ChevronRight size={14} color={BLUE_MID} />
          </TouchableOpacity>
        </View>

        {events.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
            {events.map((event, idx) => (
              <View key={event.id} style={styles.eventCardWrapper}>
                <EventCard
                  event={event}
                  colorIdx={idx}
                  onSave={() => toggleSave(`event-${event.id}`)}
                  saved={savedItems.has(`event-${event.id}`)}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={28} color={TEXT_SEC} />
            <Text style={styles.emptyText}>No hay eventos próximos</Text>
          </View>
        )}
      </View>

      {/* Courses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Capacitaciones destacadas</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push('/(worker)/courses')}
          >
            <Text style={styles.seeAllText}>Ver todos</Text>
            <ChevronRight size={14} color={BLUE_MID} />
          </TouchableOpacity>
        </View>

        {courses.length > 0 ? (
          <View style={styles.coursesList}>
            {courses.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                onSave={() => toggleSave(`course-${course.id}`)}
                saved={savedItems.has(`course-${course.id}`)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <GraduationCap size={28} color={TEXT_SEC} />
            <Text style={styles.emptyText}>No hay capacitaciones disponibles</Text>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const CARD_GAP = 12;
const SECTION_PADDING = 20;
const CARD_WIDTH = (width - SECTION_PADDING * 2 - CARD_GAP) / 2;
const EVENT_CARD_W = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GRAY_BG,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  // Greeting card
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BLUE_DARK,
    marginHorizontal: SECTION_PADDING,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: BLUE_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  greetingLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginBottom: 2,
  },
  greetingName: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '800',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Featured card
  featuredCard: {
    backgroundColor: BLUE_MID,
    marginHorizontal: SECTION_PADDING,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: BLUE_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  deco1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  deco2: {
    position: 'absolute',
    bottom: -30,
    right: 40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,138,0,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,138,0,0.4)',
  },
  featuredBadgeText: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: '600',
  },
  featuredBookmark: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredTitle: {
    color: WHITE,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    lineHeight: 28,
  },
  featuredCompany: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredMetaText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  featuredSalary: {
    color: WHITE,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  featuredButtonText: {
    color: BLUE_DARK,
    fontSize: 14,
    fontWeight: '700',
  },
  // Sections
  section: {
    marginBottom: 28,
    paddingHorizontal: SECTION_PADDING,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_MAIN,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    color: BLUE_MID,
    fontSize: 13,
    fontWeight: '500',
  },
  // Job grid
  jobRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  jobCardWrapper: {
    flex: 1,
  },
  jobCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  jobInitialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInitialText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '800',
  },
  jobBookmarkBtn: {
    padding: 2,
  },
  jobCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_MAIN,
    marginBottom: 4,
    lineHeight: 19,
  },
  jobCardCompany: {
    fontSize: 12,
    color: TEXT_SEC,
    marginBottom: 6,
  },
  jobCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  jobCardMetaText: {
    fontSize: 11,
    color: TEXT_SEC,
    flex: 1,
  },
  jobCardSalary: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN,
    marginBottom: 8,
  },
  jobTypeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  jobTypeBadgeText: {
    fontSize: 10,
    color: BLUE_MID,
    fontWeight: '600',
  },
  // Events
  eventsScroll: {
    marginHorizontal: -SECTION_PADDING,
    paddingHorizontal: SECTION_PADDING,
  },
  eventCardWrapper: {
    marginRight: 12,
  },
  eventCard: {
    width: EVENT_CARD_W,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  eventCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventDateBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  eventDateDay: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
  eventTitle: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  eventMetaText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    flex: 1,
  },
  // Courses
  coursesList: {
    gap: 0,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  courseIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_MAIN,
    marginBottom: 4,
  },
  courseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instructorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D1D5DB',
  },
  courseMetaText: {
    fontSize: 11,
    color: TEXT_SEC,
  },
  courseRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  freeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeBadgeText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
    backgroundColor: WHITE,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_SEC,
  },
});
