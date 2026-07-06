import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Users, Star, Play, Bookmark, Filter } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { Card, Badge, SearchBar } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

const categories = ['Todos', 'Atención al cliente', 'Cocina', 'Ventas', 'Marketing', 'Tecnología'];
const levels = ['Todos', 'Básico', 'Intermedio', 'Avanzado'];

export default function CoursesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedLevel, setSelectedLevel] = useState('Todos');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('courses')
        .select('*')
        .order('rating', { ascending: false });

      if (selectedCategory !== 'Todos') {
        query = query.eq('category', selectedCategory);
      }
      if (selectedLevel !== 'Todos') {
        query = query.eq('level', selectedLevel.toLowerCase());
      }

      const { data, error } = await query;

      if (!error && data) {
        setCourses(data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel]);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CourseCard = ({ course }: { course: any }) => (
    <TouchableOpacity onPress={() => router.push(`/(worker)/courses/${course.id}` as any)}>
      <Card style={styles.courseCard}>
        <View style={styles.courseHeader}>
          <View style={[styles.courseImagePlaceholder, { backgroundColor: theme.colors.primary[100] }]}>
            <Play size={24} color={theme.colors.primary[500]} fill={theme.colors.primary[500]} />
          </View>
          <View style={styles.courseInfo}>
            <Text style={[styles.courseTitle, { color: theme.colors.text }]} numberOfLines={2}>
              {course.title}
            </Text>
            <Text style={[styles.courseInstructor, { color: theme.colors.textSecondary }]}>
              {course.instructor}
            </Text>
            <View style={styles.courseMeta}>
              {course.rating > 0 && (
                <View style={styles.ratingContainer}>
                  <Star size={14} color={theme.colors.warning[500]} fill={theme.colors.warning[500]} />
                  <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                    {course.rating.toFixed(1)}
                  </Text>
                </View>
              )}
              <Text style={[styles.studentsText, { color: theme.colors.textSecondary }]}>
                <Users size={12} color={theme.colors.textSecondary} /> {course.students_count || 0}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.courseFooter}>
          <View style={styles.courseTags}>
            {course.level && (
              <Badge text={course.level} variant="primary" size="sm" />
            )}
            {course.duration_hours && (
              <View style={styles.durationTag}>
                <Clock size={12} color={theme.colors.textSecondary} />
                <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>
                  {course.duration_hours}h
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.coursePrice, { color: course.price === 0 ? theme.colors.success[600] : theme.colors.primary[600] }]}>
            {course.price === 0 ? 'Gratis' : `S/ ${course.price}`}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search */}
      <View style={styles.header}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar cursos y capacitaciones..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Categoría</Text>
        <FlatList
          data={categories}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedCategory === item && { backgroundColor: theme.colors.primary[500] },
                { borderColor: theme.colors.border }
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[
                styles.filterText,
                { color: selectedCategory === item ? '#FFFFFF' : theme.colors.text }
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Level Filter */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Nivel</Text>
        <FlatList
          data={levels}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedLevel === item && { backgroundColor: theme.colors.secondary[500] },
                { borderColor: theme.colors.border }
              ]}
              onPress={() => setSelectedLevel(item)}
            >
              <Text style={[
                styles.filterText,
                { color: selectedLevel === item ? '#FFFFFF' : theme.colors.text }
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Courses List */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CourseCard course={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No se encontraron cursos
            </Text>
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
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.sm,
  },
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
  },
  filterList: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  filterText: {
    fontSize: 13,
  },
  listContent: {
    padding: Spacing.screenPadding,
    paddingTop: 0,
  },
  courseCard: {
    marginBottom: Spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
  },
  courseImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: Spacing.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  courseInstructor: {
    fontSize: 13,
    marginTop: 2,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  studentsText: {
    fontSize: 12,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  courseTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
  coursePrice: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    fontSize: 14,
  },
});
