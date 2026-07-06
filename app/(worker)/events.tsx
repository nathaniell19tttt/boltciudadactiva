import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Users, Clock, Bookmark } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { Card, Badge, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function EventsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true });

      if (!error && data) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const categoryColors: Record<string, string> = {
    feria: theme.colors.primary[500],
    charla: theme.colors.info[500],
    taller: theme.colors.success[500],
    capacitacion: theme.colors.secondary[500],
    networking: theme.colors.warning[500],
  };

  const EventCard = ({ event }: { event: any }) => (
    <TouchableOpacity onPress={() => router.push(`/(worker)/events/${event.id}` as any)}>
      <Card style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={[styles.dateBox, { backgroundColor: categoryColors[event.category] + '20' }]}>
            <Text style={[styles.dateDay, { color: categoryColors[event.category] }]}>
              {new Date(event.date).getDate()}
            </Text>
            <Text style={[styles.dateMonth, { color: categoryColors[event.category] }]}>
              {new Date(event.date).toLocaleDateString('es-ES', { month: 'short' })}
            </Text>
          </View>
          <View style={styles.eventInfo}>
            <Text style={[styles.eventTitle, { color: theme.colors.text }]} numberOfLines={2}>
              {event.title}
            </Text>
            {event.organizer && (
              <Text style={[styles.eventOrganizer, { color: theme.colors.textSecondary }]}>
                {event.organizer}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.eventDetails}>
          {event.time && (
            <View style={styles.detailItem}>
              <Clock size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                {event.time}
              </Text>
            </View>
          )}
          {event.location && (
            <View style={styles.detailItem}>
              <MapPin size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          )}
          {event.capacity && (
            <View style={styles.detailItem}>
              <Users size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                {event.registered_count || 0}/{event.capacity} cupos
              </Text>
            </View>
          )}
        </View>

        <View style={styles.eventFooter}>
          <Badge
            text={event.category || 'Evento'}
            variant="primary"
            size="sm"
          />
          <Button
            title="Inscribirse"
            size="sm"
            onPress={() => router.push(`/(worker)/events/${event.id}` as any)}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Eventos próximos
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              Ferias, talleres, charlas y más en tu comunidad
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Calendar size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No hay eventos próximos
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Vuelve pronto para ver nuevos eventos
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
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  listContent: {
    paddingBottom: Spacing['2xl'],
  },
  eventCard: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: Spacing.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: '700',
  },
  dateMonth: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventOrganizer: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
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
  },
});
