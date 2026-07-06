import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle, Search, Clock, CheckCheck } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Screen, Input } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CompanyMessagesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const companyProfile = profile as any;

  const [conversations, setConversations] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadConversations();
  }, [companyProfile]);

  const loadConversations = async () => {
    if (!companyProfile?.user_id) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${companyProfile.user_id},participant_2.eq.${companyProfile.user_id}`)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        const enrichedConversations = await Promise.all(data.map(async (conv: any) => {
          const otherUserId = conv.participant_1 === companyProfile.user_id ? conv.participant_2 : conv.participant_1;

          const { data: worker } = await supabase
            .from('worker_profiles')
            .select('*')
            .eq('user_id', otherUserId)
            .single();

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { data: unreadCount } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', companyProfile.user_id)
            .eq('read', false);

          return {
            ...conv,
            otherUser: worker,
            lastMessage,
            unreadCount: unreadCount?.length || 0,
          };
        }));

        setConversations(enrichedConversations);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) {
      return past.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays < 7) {
      return past.toLocaleDateString('es-ES', { weekday: 'short' });
    }
    return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const filteredConversations = conversations.filter(conv => {
    if (!search) return true;
    const name = `${conv.otherUser?.first_name || ''} ${conv.otherUser?.last_name || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const ConversationCard = ({ item }: { item: any }) => (
    <Card style={styles.conversationCard} onPress={() => router.push(`/(company)/messages/${item.id}`)}>
      <View style={styles.conversationContent}>
        <Avatar
          source={item.otherUser?.photo_url}
          name={`${item.otherUser?.first_name || ''} ${item.otherUser?.last_name || ''}`}
          size={52}
          online={item.otherUser?.is_online}
        />
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, { color: theme.colors.text }]} numberOfLines={1}>
              {item.otherUser?.first_name} {item.otherUser?.last_name}
            </Text>
            <Text style={[styles.conversationTime, { color: theme.colors.textTertiary }]}>
              {item.lastMessage ? formatTime(item.lastMessage.created_at) : ''}
            </Text>
          </View>
          <View style={styles.conversationFooter}>
            <Text style={[styles.lastMessage, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {item.lastMessage?.content || 'Sin mensajes'}
            </Text>
            {item.unreadCount > 0 && (
              <Badge text={item.unreadCount.toString()} variant="primary" size="sm" />
            )}
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mensajes</Text>
        <Text style={[styles.headerCount, { color: theme.colors.textSecondary }]}>
          {conversations.length} conversaciones
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Search size={20} color={theme.colors.textSecondary} />
        <View style={styles.searchInput}>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar conversación..."
            placeholderTextColor={theme.colors.textTertiary}
            style={{ flex: 1, marginLeft: Spacing.sm }}
          />
        </View>
      </View>

      {/* Conversations */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin conversaciones</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Inicia una conversación desde el perfil de un candidato
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { padding: Spacing.screenPadding, paddingBottom: 0 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerCount: { fontSize: 14 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, marginHorizontal: Spacing.screenPadding, marginTop: Spacing.md, borderRadius: Spacing.radius.lg },
  searchInput: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  listContent: { padding: Spacing.screenPadding },
  conversationCard: { marginBottom: Spacing.sm },
  conversationContent: { flexDirection: 'row' },
  conversationInfo: { flex: 1, marginLeft: Spacing.md },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  conversationName: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: Spacing.sm },
  conversationTime: { fontSize: 12 },
  conversationFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  lastMessage: { fontSize: 13, flex: 1, marginRight: Spacing.sm },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.xl },
});
