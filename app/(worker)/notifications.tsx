import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, X, CheckCheck, Clock, Bell, Briefcase, MessageCircle, Calendar, GraduationCap, Users, Star } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { useNotifications } from '@/hooks';
import { Card, Avatar, Badge } from '@/components/ui';
import { Spacing } from '@/constants';

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, deleteNotification, clearAll } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'job': return Briefcase;
      case 'message': return MessageCircle;
      case 'application': return Document;
      case 'event': return Calendar;
      case 'course': return GraduationCap;
      default: return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'job': return theme.colors.primary[500];
      case 'message': return theme.colors.success[500];
      case 'application': return theme.colors.secondary[500];
      case 'event': return theme.colors.info[500];
      case 'course': return theme.colors.warning[500];
      default: return theme.colors.neutral[500];
    }
  };

  const formatTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const handleClearAll = () => {
    Alert.alert('Eliminar todas', '¿Eliminar todas las notificaciones?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => clearAll() }
    ]);
  };

  const NotificationItem = ({ notification }: { notification: any }) => {
    const Icon = getIcon(notification.type);
    const iconColor = getIconColor(notification.type);

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !notification.read && { backgroundColor: theme.colors.primary[50] }]}
        onPress={() => markAsRead(notification.id)}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
          <Icon size={20} color={iconColor} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, { color: theme.colors.text }]}>
            {notification.title}
          </Text>
          <Text style={[styles.notificationMessage, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={[styles.notificationTime, { color: theme.colors.textTertiary }]}>
            {formatTime(notification.created_at)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(notification.id)}
        >
          <X size={18} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Notificaciones</Text>
        {notifications.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Text style={[styles.clearText, { color: theme.colors.error[500] }]}>Limpiar todo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <View style={[styles.unreadBanner, { backgroundColor: theme.colors.primary[100] }]}>
          <Bell size={18} color={theme.colors.primary[600]} />
          <Text style={[styles.unreadText, { color: theme.colors.primary[700] }]}>
            Tienes {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
          </Text>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem notification={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bell size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin notificaciones</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Te avisaremos cuando haya novedades
            </Text>
          </View>
        }
      />
    </View>
  );
}

// Import missing icon
import { Bell as Document } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.screenPadding },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, fontSize: 20, fontWeight: '700', marginLeft: Spacing.sm },
  clearButton: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  clearText: { fontSize: 14, fontWeight: '500' },
  unreadBanner: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.screenPadding, marginBottom: Spacing.md, padding: Spacing.md, borderRadius: Spacing.radius.lg, gap: Spacing.sm },
  unreadText: { fontSize: 14, fontWeight: '500' },
  listContent: { padding: Spacing.screenPadding },
  notificationItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  notificationContent: { flex: 1, marginRight: Spacing.sm },
  notificationTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  notificationMessage: { fontSize: 13, lineHeight: 18 },
  notificationTime: { fontSize: 11, marginTop: Spacing.xs },
  deleteButton: { padding: Spacing.xs },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
});
