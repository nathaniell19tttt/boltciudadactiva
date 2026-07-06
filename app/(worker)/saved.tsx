import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Bookmark, FileText, Calendar, Recycle, Users } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Badge } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function SavedScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchSavedItems();
  }, [user]);

  const fetchSavedItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSavedItems(data);
      }
    } catch (err) {
      console.error('Error fetching saved items:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavedItems();
    setRefreshing(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'job': return FileText;
      case 'event': return Calendar;
      case 'course': return Users;
      case 'recycling_center': return Recycle;
      case 'post': return Heart;
      default: return Bookmark;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'job': return theme.colors.primary[500];
      case 'event': return theme.colors.info[500];
      case 'course': return theme.colors.secondary[500];
      case 'recycling_center': return theme.colors.success[500];
      case 'post': return theme.colors.error[500];
      default: return theme.colors.neutral[500];
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'job': return 'Empleo';
      case 'event': return 'Evento';
      case 'course': return 'Curso';
      case 'recycling_center': return 'Reciclaje';
      case 'post': return 'Publicación';
      default: return type;
    }
  };

  const tabs = [
    { id: 'all', label: 'Todos' },
    { id: 'job', label: 'Empleos' },
    { id: 'event', label: 'Eventos' },
    { id: 'course', label: 'Cursos' },
    { id: 'recycling_center', label: 'Reciclaje' },
  ];

  const filteredItems = activeTab === 'all' ? savedItems : savedItems.filter(item => item.item_type === activeTab);

  const SavedItemCard = ({ item }: { item: any }) => {
    const Icon = getIcon(item.item_type);
    const iconColor = getIconColor(item.item_type);

    return (
      <TouchableOpacity style={styles.savedCard} onPress={() => {
        if (item.item_type === 'job') router.push(`/(worker)/jobs/${item.item_id}`);
      }}>
        <View style={[styles.itemIcon, { backgroundColor: iconColor + '20' }]}>
          <Icon size={22} color={iconColor} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: theme.colors.text }]}>Elemento guardado</Text>
          <Text style={[styles.itemType, { color: theme.colors.textSecondary }]}>
            {getTypeLabel(item.item_type)}
          </Text>
          <Text style={[styles.itemDate, { color: theme.colors.textTertiary }]}>
            Guardado el {new Date(item.created_at).toLocaleDateString('es-ES')}
          </Text>
        </View>
        <TouchableOpacity style={styles.removeBtn} onPress={async () => {
          await supabase.from('saved_items').delete().eq('id', item.id);
          fetchSavedItems();
        }}>
          <Bookmark size={22} color={theme.colors.primary[500]} fill={theme.colors.primary[500]} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Guardados</Text>
          <Text style={[styles.headerCount, { color: theme.colors.textSecondary }]}>{savedItems.length} elementos</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && { backgroundColor: theme.colors.primary[500] }]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && { color: '#FFFFFF' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SavedItemCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Bookmark size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {activeTab === 'all' ? 'Sin elementos guardados' : `Sin ${getTypeLabel(activeTab).toLowerCase()} guardados`}
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Los elementos que guardes aparecerán aquí
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerCount: { fontSize: 14 },
  tabs: { marginBottom: Spacing.sm },
  tabsContent: { paddingHorizontal: Spacing.screenPadding },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full, backgroundColor: '#E0E0E0', marginRight: Spacing.sm },
  tabText: { fontSize: 13, color: '#424242' },
  listContent: { padding: Spacing.screenPadding },
  savedCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  itemIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, marginLeft: Spacing.md },
  itemTitle: { fontSize: 15, fontWeight: '600' },
  itemType: { fontSize: 12, marginTop: 2 },
  itemDate: { fontSize: 11, marginTop: 4 },
  removeBtn: { padding: Spacing.sm },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
});
