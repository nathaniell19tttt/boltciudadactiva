import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, MapPin, Send, ChevronRight, Image, Globe } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function CommunityScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para publicar');
      return;
    }

    try {
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        content: newPost.trim(),
      });

      if (!error) {
        setNewPost('');
        fetchPosts();
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!user) return;

    try {
      if (currentlyLiked) {
        // Remove like
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        await supabase.rpc('decrement_post_likes', { post_id: postId });
      } else {
        // Add like (ignore conflict if already liked)
        await supabase
          .from('post_likes')
          .upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id,user_id' });

        await supabase.rpc('increment_post_likes', { post_id: postId });
      }

      fetchPosts();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return postDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const PostCard = ({ post }: { post: any }) => {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Avatar source={null} name="Usuario" size={40} />
          <View style={styles.postHeaderInfo}>
            <View style={styles.postAuthorRow}>
              <Text style={[styles.postAuthor, { color: theme.colors.text }]}>Usuario de la comunidad</Text>
              {post.verified && <Badge text="Verificado" variant="success" size="sm" />}
            </View>
            <View style={styles.postMetaRow}>
              <Text style={[styles.postTime, { color: theme.colors.textTertiary }]}>
                {formatTime(post.created_at)}
              </Text>
              {post.location && (
                <>
                  <MapPin size={12} color={theme.colors.textTertiary} />
                  <Text style={[styles.postLocation, { color: theme.colors.textTertiary }]}>
                    {post.location}
                  </Text>
                </>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.postContent, { color: theme.colors.text }]}>
          {post.content}
        </Text>

        {/* Images placeholder */}
        {post.images && post.images.length > 0 && (
          <View style={styles.postImages}>
            {post.images.map((img: string, idx: number) => (
              <View key={idx} style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Image size={32} color={theme.colors.textTertiary} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setLiked(!liked);
              handleLike(post.id, liked);
            }}
          >
            <Heart size={20} color={liked ? theme.colors.error[500] : theme.colors.textSecondary} fill={liked ? theme.colors.error[500] : 'transparent'} />
            <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
              {post.likes_count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
              {post.comments_count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setSaved(!saved)}
          >
            <Bookmark size={20} color={saved ? theme.colors.primary[500] : theme.colors.textSecondary} fill={saved ? theme.colors.primary[500] : 'transparent'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Apoyo Comunitario</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Comparte información útil con tu comunidad
        </Text>
      </View>

      {/* New Post Input */}
      {user && (
        <Card style={styles.newPostCard}>
          <View style={styles.newPostInput}>
            <Avatar source={(profile as any)?.photo_url} name={(profile as any)?.first_name || 'Yo'} size={40} />
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text }]}
              placeholder="¿Qué quieres compartir con la comunidad?"
              placeholderTextColor={theme.colors.textTertiary}
              value={newPost}
              onChangeText={setNewPost}
              multiline
              numberOfLines={2}
            />
          </View>
          <View style={styles.newPostActions}>
            <TouchableOpacity style={styles.attachButton}>
              <Image size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachButton}>
              <Globe size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Button
              title="Publicar"
              size="sm"
              onPress={handleCreatePost}
              disabled={!newPost.trim()}
            />
          </View>
        </Card>
      )}

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No hay publicaciones aún. Sé el primero en compartir algo.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.screenPadding, paddingBottom: Spacing.sm },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, marginTop: Spacing.xs },
  newPostCard: { marginHorizontal: Spacing.screenPadding, marginBottom: Spacing.md },
  newPostInput: { flexDirection: 'row', alignItems: 'flex-start' },
  input: { flex: 1, marginLeft: Spacing.sm, padding: Spacing.md, borderRadius: Spacing.radius.lg, textAlignVertical: 'top', minHeight: 60 },
  newPostActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md },
  attachButton: { padding: Spacing.sm },
  listContent: { padding: Spacing.screenPadding },
  postCard: { marginBottom: Spacing.lg },
  postHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  postHeaderInfo: { flex: 1, marginLeft: Spacing.sm },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  postAuthor: { fontSize: 14, fontWeight: '600' },
  postMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  postTime: { fontSize: 12 },
  postLocation: { fontSize: 12 },
  moreButton: { padding: Spacing.xs },
  postContent: { fontSize: 14, lineHeight: 22, marginTop: Spacing.sm },
  postImages: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  imagePlaceholder: { width: 80, height: 80, borderRadius: Spacing.radius.md, justifyContent: 'center', alignItems: 'center' },
  postActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  actionText: { fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
