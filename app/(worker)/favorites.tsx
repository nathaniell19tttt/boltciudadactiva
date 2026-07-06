import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Share2, User, Calendar, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function FavoritesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('*, post:community_posts(*, author:worker_profiles(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setFavorites(data);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const removeFavorite = async (postId: string) => {
    if (!user) return;

    await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    fetchFavorites();
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

  const PostCard = ({ item }: { item: any }) => {
    const post = item.post;
    if (!post) return null;

    const author = post.author;

    return (
      <Card style={styles.postCard}>
        <View style={styles.postHeader}>
          <Avatar
            source={author?.photo_url}
            name={`${author?.first_name || ''} ${author?.last_name || ''}`}
            size={44}
          />
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: theme.colors.text }]}>
              {author?.first_name} {author?.last_name}
            </Text>
            <View style={styles.postMeta}>
              <Clock size={12} color={theme.colors.textTertiary} />
              <Text style={[styles.postTime, { color: theme.colors.textTertiary }]}>
                {formatTimeAgo(post.created_at)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.likeBtn} onPress={() => removeFavorite(post.id)}>
            <Heart size={22} color={theme.colors.error[500]} fill={theme.colors.error[500]} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.postContent, { color: theme.colors.text }]}>
          {post.content}
        </Text>

        {post.image_url && (
          <View style={styles.postImage}>
            <Text style={[styles.imagePlaceholder, { color: theme.colors.textSecondary }]}>
              [Imagen]
            </Text>
          </View>
        )}

        <View style={styles.postFooter}>
          <View style={styles.statItem}>
            <Heart size={16} color={theme.colors.error[500]} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {post.likes_count || 0}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
              {post.comments_count || 0}
            </Text>
          </View>
          <TouchableOpacity style={styles.shareBtn}>
            <Share2 size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mis Favoritos</Text>
          <Text style={[styles.headerCount, { color: theme.colors.textSecondary }]}>
            {favorites.length} publicaciones
          </Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Heart size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Sin publicaciones favoritas
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Dale me gusta a las publicaciones para guardarlas aquí
            </Text>
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => router.push('/(worker)/community')}
            >
              <Text style={styles.exploreBtnText}>Ver comunidad</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.screenPadding, paddingBottom: Spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerCount: { fontSize: 14 },
  listContent: { padding: Spacing.screenPadding },
  postCard: { marginBottom: Spacing.md },
  postHeader: { flexDirection: 'row', alignItems: 'center' },
  authorInfo: { flex: 1, marginLeft: Spacing.md },
  authorName: { fontSize: 15, fontWeight: '600' },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  postTime: { fontSize: 12 },
  likeBtn: { padding: Spacing.sm },
  postContent: { fontSize: 14, lineHeight: 20, marginTop: Spacing.md },
  postImage: { height: 180, backgroundColor: '#F5F5F5', borderRadius: Spacing.radius.md, marginTop: Spacing.md, justifyContent: 'center', alignItems: 'center' },
  imagePlaceholder: { fontSize: 13 },
  postFooter: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', gap: Spacing.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13 },
  shareBtn: { marginLeft: 'auto', padding: Spacing.sm },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center', paddingHorizontal: Spacing.xl },
  exploreBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Spacing.radius.full, marginTop: Spacing.lg },
  exploreBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
