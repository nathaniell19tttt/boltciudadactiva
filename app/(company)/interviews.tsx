import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Clock, MapPin, Video, User, Phone, MoreVertical, Plus, ChevronLeft, ChevronRight, Check, X, Edit2, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Button, Input, Screen } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function InterviewsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const companyProfile = profile as any;

  const [interviews, setInterviews] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form state
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('');
  const [interviewType, setInterviewType] = useState('presencial');
  const [location, setLocation] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadInterviews();
  }, [companyProfile, selectedDate]);

  const loadInterviews = async () => {
    if (!companyProfile?.id) return;

    const { data, error } = await supabase
      .from('interviews')
      .select('*, application:applications(*, job:jobs(title), worker:worker_profiles(*))')
      .eq('company_id', companyProfile.id)
      .eq('interview_date', selectedDate)
      .order('interview_time', { ascending: true });

    if (!error && data) {
      setInterviews(data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInterviews();
    setRefreshing(false);
  };

  const scheduleInterview = async () => {
    if (!selectedApplication || !interviewDate || !interviewTime) {
      Alert.alert('Error', 'Completa todos los campos requeridos');
      return;
    }

    const { error } = await supabase
      .from('interviews')
      .insert({
        application_id: selectedApplication.id,
        company_id: companyProfile.id,
        interview_date: interviewDate,
        interview_time: interviewTime,
        type: interviewType,
        location: location || null,
        video_link: videoLink || null,
        notes: notes || null,
        status: 'scheduled',
      });

    if (!error) {
      await supabase
        .from('applications')
        .update({ status: 'entrevista' })
        .eq('id', selectedApplication.id);

      setShowModal(false);
      resetForm();
      loadInterviews();
      Alert.alert('Listo', 'Entrevista programada correctamente');
    } else {
      Alert.alert('Error', error.message);
    }
  };

  const cancelInterview = async (interviewId: string) => {
    Alert.alert(
      'Cancelar entrevista',
      '¿Deseas cancelar esta entrevista?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: async () => {
            await supabase
              .from('interviews')
              .update({ status: 'cancelled' })
              .eq('id', interviewId);
            loadInterviews();
          },
        },
      ]
    );
  };

  const markCompleted = async (interviewId: string) => {
    await supabase
      .from('interviews')
      .update({ status: 'completed' })
      .eq('id', interviewId);
    loadInterviews();
  };

  const resetForm = () => {
    setSelectedApplication(null);
    setInterviewDate('');
    setInterviewTime('');
    setInterviewType('presencial');
    setLocation('');
    setVideoLink('');
    setNotes('');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { label: 'Programada', color: theme.colors.info[500], bgColor: theme.colors.info[100] };
      case 'completed':
        return { label: 'Completada', color: theme.colors.success[500], bgColor: theme.colors.success[100] };
      case 'cancelled':
        return { label: 'Cancelada', color: theme.colors.error[500], bgColor: theme.colors.error[100] };
      case 'rescheduled':
        return { label: 'Reprogramada', color: theme.colors.warning[500], bgColor: theme.colors.warning[100] };
      default:
        return { label: status, color: theme.colors.text, bgColor: theme.colors.surfaceVariant };
    }
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    return `${hour}:${minute}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const getDotColor = () => theme.colors.primary[500];

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const InterviewCard = ({ item }: { item: any }) => {
    const config = getStatusConfig(item.status);
    const worker = item.application?.worker;

    return (
      <Card style={styles.interviewCard}>
        <View style={styles.cardHeader}>
          <View style={styles.timeBox}>
            <Text style={[styles.timeText, { color: theme.colors.text }]}>
              {formatTime(item.interview_time)}
            </Text>
            <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>1h</Text>
          </View>

          <TouchableOpacity
            style={styles.workerInfo}
            onPress={() => worker && router.push(`/(company)/talent/${worker.id}`)}
          >
            <Avatar
              source={worker?.photo_url}
              name={`${worker?.first_name || ''} ${worker?.last_name || ''}`}
              size={44}
            />
            <View style={styles.workerDetails}>
              <Text style={[styles.workerName, { color: theme.colors.text }]}>
                {worker?.first_name} {worker?.last_name}
              </Text>
              <Text style={[styles.jobTitle, { color: theme.colors.primary[600] }]}>
                {item.application?.job?.title}
              </Text>
            </View>
          </TouchableOpacity>

          <Badge text={config.label} variant={item.status === 'completed' ? 'success' : item.status === 'cancelled' ? 'error' : 'info'} />
        </View>

        <View style={[styles.cardContent, { borderTopColor: theme.colors.border }]}>
          <View style={styles.detailRow}>
            {item.type === 'presencial' ? (
              <>
                <MapPin size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  {item.location || 'Ubicación pendiente'}
                </Text>
              </>
            ) : (
              <>
                <Video size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  Videollamada
                </Text>
              </>
            )}
          </View>

          {item.notes && (
            <Text style={[styles.notesText, { color: theme.colors.textTertiary }]}>
              {item.notes}
            </Text>
          )}
        </View>

        {item.status === 'scheduled' && (
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => markCompleted(item.id)}>
              <Check size={18} color={theme.colors.success[500]} />
              <Text style={[styles.actionBtnText, { color: theme.colors.success[500] }]}>Completar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => cancelInterview(item.id)}>
              <X size={18} color={theme.colors.error[500]} />
              <Text style={[styles.actionBtnText, { color: theme.colors.error[500] }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Entrevistas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Plus size={24} color={theme.colors.primary[500]} />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <Card style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navBtn}>
            <ChevronLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: theme.colors.text }]}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navBtn}>
            <ChevronRight size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {weekDays.map((day) => (
            <View key={day} style={styles.weekDayCell}>
              <Text style={[styles.weekDayText, { color: theme.colors.textSecondary }]}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {days.map((date, idx) => {
            const isToday = date?.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
            const isSelected = date?.toISOString().split('T')[0] === selectedDate;
            const hasInterview = date && interviews.some(i => i.interview_date === date.toISOString().split('T')[0]);

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: theme.colors.primary[500] },
                  isToday && !isSelected && { borderWidth: 1, borderColor: theme.colors.primary[500] },
                ]}
                onPress={() => date && setSelectedDate(date.toISOString().split('T')[0])}
                disabled={!date}
              >
                {date && (
                  <>
                    <Text style={[styles.dayText, isSelected && { color: '#FFFFFF' }]}>
                      {date.getDate()}
                    </Text>
                    {hasInterview && (
                      <View style={[styles.dot, { backgroundColor: isSelected ? '#FFFFFF' : getDotColor() }]} />
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Selected Date */}
      <View style={styles.selectedDateHeader}>
        <Text style={[styles.selectedDateText, { color: theme.colors.text }]}>
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <Text style={[styles.countText, { color: theme.colors.textSecondary }]}>
          {interviews.filter(i => i.status === 'scheduled').length} programadas
        </Text>
      </View>

      {/* Interviews List */}
      <FlatList
        data={interviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InterviewCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin entrevistas</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              No hay entrevistas programadas para este día
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.screenPadding, paddingBottom: 0 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  addBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  calendarCard: { margin: Spacing.screenPadding, marginTop: Spacing.md },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  navBtn: { padding: Spacing.sm },
  monthText: { fontSize: 16, fontWeight: '600' },
  weekDaysRow: { flexDirection: 'row', marginBottom: Spacing.sm },
  weekDayCell: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xs },
  weekDayText: { fontSize: 12, fontWeight: '500' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: Spacing.radius.md },
  dayText: { fontSize: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  selectedDateHeader: { paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.sm },
  selectedDateText: { fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
  countText: { fontSize: 13, marginTop: 2 },
  listContent: { padding: Spacing.screenPadding },
  interviewCard: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  timeBox: { width: 60, alignItems: 'center' },
  timeText: { fontSize: 16, fontWeight: '600' },
  durationText: { fontSize: 11, marginTop: 2 },
  workerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: Spacing.sm },
  workerDetails: { marginLeft: Spacing.sm, flex: 1 },
  workerName: { fontSize: 15, fontWeight: '600' },
  jobTitle: { fontSize: 13, marginTop: 2 },
  cardContent: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailText: { fontSize: 13 },
  notesText: { fontSize: 12, marginTop: Spacing.sm, fontStyle: 'italic' },
  cardActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.sm, backgroundColor: 'rgba(0,0,0,0.05)' },
  actionBtnText: { fontSize: 13, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
});
