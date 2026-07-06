import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Calendar, MapPin, Users, Clock, Share2, Bookmark, ChevronLeft, Ticket, User, Building2, Link as LinkIcon
} from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Badge, Button, Avatar } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuth();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setEvent(data);

        if (user) {
          const { data: registration } = await supabase
            .from('event_registrations')
            .select('id')
            .eq('event_id', id)
            .eq('user_id', user.id)
            .single();
          setIsRegistered(!!registration);
        }

        await supabase
          .from('events')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id);
      }
    } catch (err) {
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para inscribirte a eventos');
      return;
    }

    if (event.registered_count >= event.capacity) {
      Alert.alert('Sin cupo', 'Este evento ya no tiene cupos disponibles');
      return;
    }

    Alert.alert(
      'Confirmar inscripción',
      '¿Deseas inscribirte a este evento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Inscribirse',
          onPress: async () => {
            try {
              const { error } = await supabase.from('event_registrations').insert({
                event_id: id,
                user_id: user.id,
                status: 'registered',
              });

              if (!error) {
                setIsRegistered(true);
                await supabase
                  .from('events')
                  .update({ registered_count: (event.registered_count || 0) + 1 })
                  .eq('id', id);
                Alert.alert('¡Inscrito!', 'Tu inscripción ha sido confirmada');
              }
            } catch (err) {
              Alert.alert('Error', 'No se pudo completar la inscripción');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${event.title} - ${formatDate(event.date)}\n${event.location}\nCiudad Activa - Evento en tu comunidad`,
        title: 'Compartir evento'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr;
  };

  const categoryColors: Record<string, string> = {
    feria: theme.colors.primary[500],
    charla: theme.colors.info[500],
    taller: theme.colors.success[500],
    capacitacion: theme.colors.secondary[500],
    networking: theme.colors.warning[500],
  };

  if (loading || !event) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text }}>Cargando...</Text>
      </View>
    );
  }

  const availableSpots = event.capacity - (event.registered_count || 0);
  const isFull = availableSpots <= 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={28} color={theme.colors.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.eventIconContainer, { backgroundColor: categoryColors[event.category] + '20' }]}>
          <Calendar size={40} color={categoryColors[event.category]} />
        </View>

        <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{event.title}</Text>

        <View style={styles.badgeRow}>
          <Badge
            text={event.category || 'Evento'}
            variant="primary"
            size="md"
          />
          {isFull && (
            <Badge text="Agotado" variant="error" size="md" />
          )}
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Calendar size={20} color={theme.colors.primary[500]} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Fecha</Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>{formatDate(event.date)}</Text>
            </View>
          </View>
          {event.time && (
            <View style={styles.infoRow}>
              <Clock size={20} color={theme.colors.primary[500]} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Hora</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{formatTime(event.time)}</Text>
              </View>
            </View>
          )}
          {event.location && (
            <View style={styles.infoRow}>
              <MapPin size={20} color={theme.colors.primary[500]} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Lugar</Text>
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>{event.location}</Text>
              </View>
            </View>
          )}
          <View style={styles.infoRow}>
            <Users size={20} color={theme.colors.primary[500]} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Cupos disponibles</Text>
              <Text style={[styles.infoValue, { color: isFull ? theme.colors.error[500] : theme.colors.success[600] }]}>
                {availableSpots} de {event.capacity}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]} onPress={handleShare}>
            <Share2 size={20} color={theme.colors.text} />
            <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>Compartir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: isSaved ? theme.colors.warning[100] : theme.colors.surfaceVariant }]}
            onPress={handleSave}
          >
            <Bookmark size={20} color={isSaved ? theme.colors.warning[600] : theme.colors.text} />
            <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>{isSaved ? 'Guardado' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>

        {event.organizer && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Organizador</Text>
            <Card style={styles.organizerCard}>
              <View style={styles.organizerHeader}>
                <Avatar name={event.organizer} size={50} />
                <View style={styles.organizerInfo}>
                  <Text style={[styles.organizerName, { color: theme.colors.text }]}>{event.organizer}</Text>
                  {event.organizer_type && (
                    <Text style={[styles.organizerType, { color: theme.colors.textSecondary }]}>
                      {event.organizer_type}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Descripción</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {event.description || 'Sin descripción disponible'}
          </Text>
        </View>

        {event.requirements && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Requisitos</Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {event.requirements}
            </Text>
          </View>
        )}

        {event.benefits && event.benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Incluye</Text>
            {event.benefits.map((ben: string, idx: number) => (
              <View key={idx} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.success[500] }]} />
                <Text style={[styles.listText, { color: theme.colors.textSecondary }]}>{ben}</Text>
              </View>
            ))}
          </View>
        )}

        {event.registration_link && (
          <Card style={styles.linkCard}>
            <LinkIcon size={18} color={theme.colors.primary[500]} />
            <Text style={[styles.linkText, { color: theme.colors.secondary[600] }]}>
              Registro externo disponible
            </Text>
          </Card>
        )}

        <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
          Publicado el {new Date(event.created_at).toLocaleDateString('es-ES')}
        </Text>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        {isRegistered ? (
          <Button
            title="Ya estás inscrito"
            variant="outline"
            fullWidth
            size="lg"
            disabled
            onPress={() => {}}
          />
        ) : (
          <Button
            title={isFull ? 'Sin cupos disponibles' : 'Inscribirse ahora'}
            fullWidth
            size="lg"
            disabled={isFull}
            leftIcon={<Ticket size={20} color="#FFFFFF" />}
            onPress={handleRegister}
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
  eventIconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg },
  eventTitle: { fontSize: 24, fontWeight: '700', marginBottom: Spacing.md },
  badgeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  infoCard: { marginBottom: Spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.md },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12 },
  infoValue: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  actionButtons: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl, justifyContent: 'space-around' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.lg, gap: Spacing.xs },
  actionBtnText: { fontSize: 13 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  description: { fontSize: 14, lineHeight: 22 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6, marginRight: Spacing.sm },
  listText: { fontSize: 14, flex: 1, lineHeight: 20 },
  organizerCard: {},
  organizerHeader: { flexDirection: 'row', alignItems: 'center' },
  organizerInfo: { marginLeft: Spacing.md },
  organizerName: { fontSize: 16, fontWeight: '600' },
  organizerType: { fontSize: 13, marginTop: 2 },
  linkCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  linkText: { fontSize: 14, fontWeight: '500' },
  footerText: { fontSize: 12, textAlign: 'center', marginTop: Spacing.md },
  bottomBar: { padding: Spacing.md, borderTopWidth: 1 },
  bottomSpacing: { height: 20 }
});
