import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Avatar, Badge } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

interface EnrichedConversation {
  id: string;
  updated_at: string;
  otherName: string;
  otherAvatar: string | null;
  lastMessage: string;
  unreadCount: number;
  participants: string[];
}

export default function MessagesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<EnrichedConversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // 1. Fetch conversations where user is a participant (either seat)
      const { data: convData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error || !convData) return;

      // 2. For each conversation enrich with other participant's profile + last message
      const enriched = await Promise.all(
        convData.map(async (conv) => {
          const otherId: string | null =
            conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;

          let otherName = 'Usuario';
          let otherAvatar: string | null = null;

          if (otherId) {
            // Worker-to-company: try company_profiles first
            const { data: company } = await supabase
              .from('company_profiles')
              .select('name, logo_url')
              .eq('user_id', otherId)
              .single();
            if (company) {
              otherName = company.name || 'Empresa';
              otherAvatar = company.logo_url || null;
            } else {
              const { data: worker } = await supabase
                .from('worker_profiles')
                .select('first_name, last_name, photo_url')
                .eq('user_id', otherId)
                .single();
              if (worker) {
                otherName = `${worker.first_name || ''} ${worker.last_name || ''}`.trim() || 'Usuario';
                otherAvatar = worker.photo_url || null;
              }
            }
          }

          // Last message
          const { data: lastMsgData } = await supabase
            .from('messages')
            .select('content, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const lastMessage = lastMsgData
            ? (lastMsgData.sender_id === user.id ? `Tú: ${lastMsgData.content}` : lastMsgData.content)
            : 'Sin mensajes aún';

          // Unread count
          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', user.id)
            .eq('read', false);

          return {
            id: conv.id,
            updated_at: conv.updated_at,
            otherName,
            otherAvatar,
            lastMessage,
            unreadCount: count || 0,
            participants: [conv.participant_1, conv.participant_2].filter(Boolean),
          };
        })
      );

      setConversations(enriched);
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

  const ConversationCard = ({ conversation }: { conversation: EnrichedConversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => router.push(`/(worker)/messages/${conversation.id}`)}
    >
      <Avatar source={conversation.otherAvatar} name={conversation.otherName} size={50} />
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationName, { color: theme.colors.text }]}>
            {conversation.otherName}
          </Text>
          <Text style={[styles.conversationTime, { color: theme.colors.textSecondary }]}>
            {formatTime(conversation.updated_at)}
          </Text>
        </View>
        <View style={styles.conversationFooter}>
          <Text style={[styles.lastMessage, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {conversation.lastMessage}
          </Text>
          {conversation.unreadCount > 0 && (
            <Badge text={conversation.unreadCount.toString()} variant="error" size="sm" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
