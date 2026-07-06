import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle, Send, Image as ImageIcon, MapPin, Paperclip, Mic } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Input, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function MessagesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [user.id])
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setConversations(data);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Ayer';
    } else if (days < 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  const ConversationCard = ({ conversation }: { conversation: any }) => {
    // Get other participant info (mock for now)
    const otherName = 'Usuario';
    const otherAvatar = null;
    const lastMessage = 'No hay mensajes';
    const unreadCount = 0;

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => router.push(`/(worker)/messages/${conversation.id}`)}
      >
        <Avatar
          source={otherAvatar}
          name={otherName}
          size={50}
          online={Math.random() > 0.5}
        />
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, { color: theme.colors.text }]}>
              {otherName}
            </Text>
            <Text style={[styles.conversationTime, { color: theme.colors.textSecondary }]}>
              {formatTime(conversation.updated_at)}
            </Text>
          </View>
          <View style={styles.conversationFooter}>
            <Text style={[styles.lastMessage, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {lastMessage}
            </Text>
            {unreadCount > 0 && (
              <Badge text={unreadCount.toString()} variant="error" size="sm" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Mensajes
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Tus conversaciones con empresas
        </Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationCard conversation={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No tienes conversaciones
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Cuando postules a empleos, podrás chatear con las empresas
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
    padding: Spacing.screenPadding,
    paddingTop: 0,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversationTime: {
    fontSize: 12,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: Spacing.sm,
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
