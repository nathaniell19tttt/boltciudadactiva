import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Recycle, MapPin, Phone, Clock, Navigation, Bookmark } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { Card, Badge, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

const typeFilters = ['Todos', 'Reciclaje', 'Centro de Acopio', 'Centro Ambiental'];
const typeColors: Record<string, string> = {
  reciclaje: '#4CAF50',
  acopio: '#2196F3',
  ambiental: '#9C27B0',
};

export default function RecyclingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('Todos');

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recycling_centers')
        .select('*');

      if (!error && data) {
        setCenters(data);
      }
    } catch (err) {
      console.error('Error fetching recycling centers:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCenters();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const filteredCenters = selectedType === 'Todos'
    ? centers
    : centers.filter(c => c.type?.toLowerCase() === selectedType.toLowerCase().replace('centro de ', '').replace('centro ', ''));

  const CenterCard = ({ center }: { center: any }) => (
    <Card style={styles.centerCard}>
      <View style={styles.centerHeader}>
        <View style={[styles.centerIcon, { backgroundColor: typeColors[center.type] + '20' }]}>
          <Recycle size={24} color={typeColors[center.type]} />
        </View>
        <View style={styles.centerInfo}>
          <Text style={[styles.centerName, { color: theme.colors.text }]}>
            {center.name}
          </Text>
          <Badge
            text={center.type}
            variant={center.type === 'reciclaje' ? 'success' : center.type === 'acopio' ? 'primary' : 'info'}
            size="sm"
          />
        </View>
      </View>

      <View style={styles.centerDetails}>
        {center.address && (
          <View style={styles.detailRow}>
            <MapPin size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {center.address}
            </Text>
          </View>
        )}
        {center.schedule && (
          <View style={styles.detailRow}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {center.schedule}
            </Text>
          </View>
        )}
        {center.phone && (
          <View style={styles.detailRow}>
            <Phone size={14} color={theme.colors.textSecondary} />
            <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
              {center.phone}
            </Text>
          </View>
        )}
      </View>

      {center.materials && center.materials.length > 0 && (
        <View style={styles.materialsContainer}>
          <Text style={[styles.materialsLabel, { color: theme.colors.text }]}>
            Materiales aceptados:
          </Text>
          <View style={styles.materials}>
            {center.materials.slice(0, 4).map((mat: string, idx: number) => (
              <Badge key={idx} text={mat} variant="neutral" size="sm" />
            ))}
            {center.materials.length > 4 && (
              <Text style={[styles.moreMaterials, { color: theme.colors.textSecondary }]}>
                +{center.materials.length - 4} más
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={styles.centerActions}>
        <Button
          title="Cómo llegar"
          variant="outline"
          size="sm"
          leftIcon={<Navigation size={16} color={theme.colors.primary[500]} />}
          onPress={() => {
            if (center.latitude && center.longitude) {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;
              Linking.openURL(url).catch(() => Alert.alert('Error', 'No se pudo abrir el mapa'));
            } else if (center.address) {
              const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(center.address)}`;
              Linking.openURL(url).catch(() => Alert.alert('Error', 'No se pudo abrir el mapa'));
            } else {
              Alert.alert('Sin ubicación', 'Este centro no tiene ubicación registrada');
            }
          }}
        />
        <Button
          title="Guardar"
          variant="ghost"
          size="sm"
          leftIcon={<Bookmark size={16} color={theme.colors.text} />}
          onPress={async () => {
            Alert.alert('Guardado', 'Centro agregado a tu lista');
          }}
        />
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>♻️</Text>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Puntos de Reciclaje
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Centros de acopio y puntos ambientales cercanos
        </Text>
      </View>

      {/* Type Filters */}
      <View style={styles.filterSection}>
        <FlatList
          data={typeFilters}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType === item && { backgroundColor: theme.colors.success[500] },
                { borderColor: theme.colors.border }
              ]}
              onPress={() => setSelectedType(item)}
            >
              <Text style={[
                styles.filterText,
                { color: selectedType === item ? '#FFFFFF' : theme.colors.text }
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Map Placeholder */}
      <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text style={[styles.mapText, { color: theme.colors.textSecondary }]}>
          Mapa interactivo próximamente
        </Text>
      </View>

      {/* Centers List */}
      <FlatList
        data={filteredCenters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CenterCard center={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Recycle size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No hay centros de reciclaje
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              No se encontraron centros con el filtro actual
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
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterList: {
    paddingHorizontal: Spacing.screenPadding,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  filterText: {
    fontSize: 13,
  },
  mapPlaceholder: {
    height: 150,
    marginHorizontal: Spacing.screenPadding,
    borderRadius: Spacing.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mapText: {
    fontSize: 14,
  },
  listContent: {
    padding: Spacing.screenPadding,
    paddingTop: 0,
  },
  centerCard: {
    marginBottom: Spacing.md,
  },
  centerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  centerDetails: {
    marginTop: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: 13,
    flex: 1,
  },
  materialsContainer: {
    marginTop: Spacing.md,
  },
  materialsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  materials: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  moreMaterials: {
    fontSize: 12,
    marginLeft: Spacing.xs,
  },
  centerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
