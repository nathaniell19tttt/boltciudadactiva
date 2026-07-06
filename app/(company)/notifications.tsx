import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, FileText, Calendar, MessageCircle, Star, Bell, Check, Trash2, X } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Screen, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CompanyNotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const companyProfile = profile as any;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearAll, setShowClearAll] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [companyProfile]);

  const loadNotifications = async () => {
    if (!companyProfile?.id) return;

    const { data, error } = await supabase
      .from('company_notifications')
      .select('*')
      .eq('company_id', companyProfile.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('company_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    loadNotifications();
  };

  const deleteNotification = async (notificationId: string) => {
    await supabase
      .from('company_notifications')
      .delete()
      .eq('id', notificationId);

    loadNotifications();
  };

  const markAllAsRead = async () => {
    if (!companyProfile?.id) return;

    await supabase
      .from('company_notifications')
      .update({ read: true })
      .eq('company_id', companyProfile.id)
      .eq('read', false);

    setShowClearAll(false);
    loadNotifications();
  };

  const clearAllNotifications = async () => {
    if (!companyProfile?.id) return;

    await supabase
      .from('company_notifications')
      .delete()
      .eq('company_id', companyProfile.id);

    setShowClearAll(false);
    setNotifications([]);
  };

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'new_application':
        return { icon: Users, color: theme.colors.primary[500], bgColor: theme.colors.primary[100] };
      case 'interview_scheduled':
        return { icon: Calendar, color: theme.colors.warning[500], bgColor: theme.colors.warning[100] };
      case 'interview_reminder':
        return { icon: Calendar, color: theme.colors.info[500], bgColor: theme.colors.info[100] };
      case 'new_message':
        return { icon: MessageCircle, color: theme.colors.success[500], bgColor: theme.colors.success[100] };
      case 'job_expired':
        return { icon: FileText, color: theme.colors.error[500], bgColor: theme.colors.error[100] };
      case 'new_review':
        return { icon: Star, color: theme.colors.secondary[500], bgColor: theme.colors.secondary[100] };
      default:
        return { icon: Bell, color: theme.colors.neutral[500], bgColor: theme.colors.neutral[100] };
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const NotificationCard = ({ notification }: { notification: any }) => {
    const config = getNotificationConfig(notification.type);
    const Icon = config.icon;

    const handlePress = () => {
      markAsRead(notification.id);

      switch (notification.type) {
        case 'new_application':
          router.push('/(company)/applications');
          break;
        case 'interview_scheduled':
        case 'interview_reminder':
          router.push('/(company)/interviews');
          break;
        case 'new_message':
          router.push('/(company)/messages');
          break;
        case 'job_expired':
          router.push('/(company)/vacancies');
          break;
      }
    };

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          { backgroundColor: notification.read ? 'transparent' : theme.colors.primary[50] },
        ]}
        onPress={handlePress}
      >
        <View style={[styles.iconWrap, { backgroundColor: config.bgColor }]}>
          <Icon size={20} color={config.color} />
        </View>

        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
            {notification.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={[styles.notificationTime, { color: theme.colors.textTertiary }]}>
            {formatTimeAgo(notification.created_at)}
          </Text>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteNotification(notification.id)}>
          <X size={18} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notificaciones</Text>
        {unreadCount > 0 && (
          <Badge text={`${unreadCount} nuevas`} variant="primary" />
        )}
      </View>

      {/* Actions */}
      {unreadCount > 0 && (
        <View style={styles.actionsBar}>
          <TouchableOpacity style={styles.actionBtn} onPress={markAllAsRead}>
            <Check size={16} color={theme.colors.primary[500]} />
            <Text style={[styles.actionBtnText, { color: theme.colors.primary[500] }]}>
              Marcar todas leídas
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationCard notification={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin notificaciones</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Aquí verás novedades sobre tus vacantes y candidats
            </Text>
          </View>
        }
      />

      {/* Clear All */}
      {notifications.length > 0 && (
        <View style={styles.clearAllContainer}>
          <Button title="Borrar todas" variant="outline" size="sm" onPress={clearAllNotifications} leftIcon={<Trash2 size={16} color={theme.colors.error[500]} />} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.screenPadding, paddingBottom: 0 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  actionsBar: { flexDirection: 'row', paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtnText: { fontSize: 13, fontWeight: '500' },
  listContent: { padding: Spacing.screenPadding },
  notificationCard: { flexDirection: 'row', paddingVertical: Spacing.md, borderRadius: Spacing.radius.lg, marginBottom: Spacing.sm },
  iconWrap: { width: 44, height: 44, borderRadius: Spacing.radius.md, justifyContent: 'center', alignItems: 'center' },
  notificationContent: { flex: 1, marginLeft: Spacing.md },
  notificationTitle: { fontSize: 15, fontWeight: '600' },
  notificationMessage: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  notificationTime: { fontSize: 11, marginTop: 4 },
  deleteBtn: { padding: Spacing.sm },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.xl },
  clearAllContainer: { padding: Spacing.screenPadding, alignItems: 'center' },
});
