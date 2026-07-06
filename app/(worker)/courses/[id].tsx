import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Clock, Users, Star, Play, Bookmark, ChevronLeft, Award, BookOpen, FileText, CheckCircle, Lock
} from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Badge, Button, Avatar } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuth();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setCourse(data);

        if (user) {
          const { data: enrollment } = await supabase
            .from('course_enrollments')
            .select('id, progress')
            .eq('course_id', id)
            .eq('user_id', user.id)
            .single();
          setIsEnrolled(!!enrollment);
        }
      }
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para inscribirte a cursos');
      return;
    }

    if (course.price > 0) {
      Alert.alert(
        'Curso de pago',
        `Este curso cuesta S/ ${course.price}. ¿Deseas continuar al proceso de pago?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: () => Alert.alert('Próximamente', 'Pasarela de pago disponible pronto') }
        ]
      );
      return;
    }

    Alert.alert(
      'Confirmar inscripción',
      '¿Deseas inscribirte a este curso gratuito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inscribirse',
          onPress: async () => {
            try {
              const { error } = await supabase.from('course_enrollments').insert({
                course_id: id,
                user_id: user.id,
                progress: 0,
                status: 'enrolled',
              });

              if (!error) {
                setIsEnrolled(true);
                await supabase
                  .from('courses')
                  .update({ students_count: (course.students_count || 0) + 1 })
                  .eq('id', id);
                Alert.alert('¡Inscrito!', 'Ya puedes comenzar el curso');
              }
            } catch (err) {
              Alert.alert('Error', 'No se pudo completar la inscripción');
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'básico': return theme.colors.success[500];
      case 'intermedio': return theme.colors.warning[500];
      case 'avanzado': return theme.colors.error[500];
      default: return theme.colors.primary[500];
    }
  };

  if (loading || !course) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text }}>Cargando...</Text>
      </View>
    );
  }

  const TabButton = ({ tabId, label, icon }: { tabId: string; label: string; icon: React.ReactNode }) => (
    <TouchableOpacity
      style={[styles.tabBtn, activeTab === tabId && { borderBottomColor: theme.colors.primary[500], borderBottomWidth: 2 }]}
      onPress={() => setActiveTab(tabId)}
    >
      {icon}
      <Text style={[styles.tabText, { color: activeTab === tabId ? theme.colors.primary[500] : theme.colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={28} color={theme.colors.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.courseImage, { backgroundColor: theme.colors.primary[100] }]}>
          <Play size={48} color={theme.colors.primary[500]} />
        </View>

        <Text style={[styles.courseTitle, { color: theme.colors.text }]}>{course.title}</Text>

        <View style={styles.instructorRow}>
          {course.instructor && (
            <>
              <Avatar name={course.instructor} size={36} />
              <Text style={[styles.instructorName, { color: theme.colors.textSecondary }]}>
                {course.instructor}
              </Text>
            </>
          )}
        </View>

        <View style={styles.statsRow}>
          {course.rating > 0 && (
            <View style={styles.statItem}>
              <Star size={18} color={theme.colors.warning[500]} fill={theme.colors.warning[500]} />
              <Text style={[styles.statText, { color: theme.colors.text }]}>{course.rating.toFixed(1)}</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Users size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{course.students_count || 0} estudiantes</Text>
          </View>
          {course.duration_hours && (
            <View style={styles.statItem}>
              <Clock size={18} color={theme.colors.textSecondary} />
              <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{course.duration_hours}h</Text>
            </View>
          )}
        </View>

        <View style={styles.badgeRow}>
          {course.level && (
            <Badge text={course.level} variant="primary" size="md" />
          )}
          {course.category && (
            <Badge text={course.category} variant="secondary" size="md" />
          )}
        </View>

        <Text style={[styles.priceText, { color: course.price === 0 ? theme.colors.success[600] : theme.colors.primary[600] }]}>
          {course.price === 0 ? 'Gratis' : `S/ ${course.price}`}
        </Text>

        <View style={styles.tabs}>
          <TabButton tabId="overview" label="Resumen" icon={<BookOpen size={18} color={activeTab === 'overview' ? theme.colors.primary[500] : theme.colors.textSecondary} />} />
          <TabButton tabId="content" label="Contenido" icon={<FileText size={18} color={activeTab === 'content' ? theme.colors.primary[500] : theme.colors.textSecondary} />} />
          <TabButton tabId="reviews" label="Reviews" icon={<Star size={18} color={activeTab === 'reviews' ? theme.colors.primary[500] : theme.colors.textSecondary} />} />
        </View>

        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Descripción</Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {course.description || 'Sin descripción disponible'}
            </Text>

            {course.objectives && course.objectives.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Qué aprenderás</Text>
                {course.objectives.map((obj: string, idx: number) => (
                  <View key={idx} style={styles.objectiveItem}>
                    <CheckCircle size={16} color={theme.colors.success[500]} />
                    <Text style={[styles.objectiveText, { color: theme.colors.textSecondary }]}>{obj}</Text>
                  </View>
                ))}
              </View>
            )}

            {course.requirements && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Requisitos</Text>
                <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                  {course.requirements}
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'content' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contenido del curso</Text>
            {course.modules && course.modules.length > 0 ? (
              course.modules.map((module: any, idx: number) => (
                <Card key={idx} style={styles.moduleCard}>
                  <View style={styles.moduleHeader}>
                    <View style={[styles.moduleIcon, { backgroundColor: theme.colors.primary[100] }]}>
                      <Play size={16} color={theme.colors.primary[500]} />
                    </View>
                    <View style={styles.moduleInfo}>
                      <Text style={[styles.moduleTitle, { color: theme.colors.text }]}>{module.title}</Text>
                      <Text style={[styles.moduleDuration, { color: theme.colors.textSecondary }]}>
                        {module.duration || '30 min'}
                      </Text>
                    </View>
                    {isEnrolled ? (
                      <CheckCircle size={20} color={theme.colors.success[500]} />
                    ) : (
                      <Lock size={20} color={theme.colors.textTertiary} />
                    )}
                  </View>
                </Card>
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Contenido disponible próximamente
                </Text>
              </Card>
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Opiniones de estudiantes</Text>
            {course.reviews_count > 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  {course.reviews_count} reseñas
                </Text>
              </Card>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  Sin reseñas aún
                </Text>
              </Card>
            )}
          </View>
        )}

        {course.certificate_available && (
          <Card style={styles.certificateCard}>
            <Award size={24} color={theme.colors.success[500]} />
            <View style={styles.certificateInfo}>
              <Text style={[styles.certificateTitle, { color: theme.colors.text }]}>Certificado disponible</Text>
              <Text style={[styles.certificateDesc, { color: theme.colors.textSecondary }]}>
                Al completar el curso recibirás un certificado digital
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Bookmark size={24} color={isSaved ? theme.colors.warning[500] : theme.colors.text} fill={isSaved ? theme.colors.warning[500] : 'transparent'} />
        </TouchableOpacity>
        {isEnrolled ? (
          <Button
            title="Continuar curso"
            fullWidth
            size="lg"
            leftIcon={<Play size={20} color="#FFFFFF" />}
            onPress={() => Alert.alert('Próximamente', 'Reproductor de videos disponible pronto')}
          />
        ) : (
          <Button
            title={course.price === 0 ? 'Inscribirse gratis' : `Comprar por S/ ${course.price}`}
            fullWidth
            size="lg"
            onPress={handleEnroll}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { padding: Spacing.md },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing.md },
  courseImage: { width: '100%', height: 200, borderRadius: Spacing.radius.xl, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  courseTitle: { fontSize: 24, fontWeight: '700', marginBottom: Spacing.sm },
  instructorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  instructorName: { fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  statText: { fontSize: 13 },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  priceText: { fontSize: 28, fontWeight: '700', marginBottom: Spacing.lg },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', marginBottom: Spacing.lg },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, gap: Spacing.xs },
  tabText: { fontSize: 13, fontWeight: '500' },
  tabContent: { marginBottom: Spacing.xl },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  description: { fontSize: 14, lineHeight: 22 },
  objectiveItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm, gap: Spacing.sm },
  objectiveText: { fontSize: 14, flex: 1, lineHeight: 20 },
  moduleCard: { marginBottom: Spacing.sm },
  moduleHeader: { flexDirection: 'row', alignItems: 'center' },
  moduleIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  moduleInfo: { flex: 1, marginLeft: Spacing.md },
  moduleTitle: { fontSize: 14, fontWeight: '500' },
  moduleDuration: { fontSize: 12, marginTop: 2 },
  emptyCard: {},
  emptyText: { fontSize: 14, textAlign: 'center' },
  certificateCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  certificateInfo: { flex: 1 },
  certificateTitle: { fontSize: 15, fontWeight: '600' },
  certificateDesc: { fontSize: 12, marginTop: 2 },
  bottomBar: { padding: Spacing.md, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  saveBtn: { padding: Spacing.sm },
  bottomSpacing: { height: 20 }
});
