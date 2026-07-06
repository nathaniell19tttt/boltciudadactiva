import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, MapPin, Star, Briefcase, Clock, ChevronDown, X, Users } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Button, Input, Screen } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function TalentSearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { profile } = useAuth();
  const companyProfile = profile as any;

  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [profession, setProfession] = useState('');
  const [district, setDistrict] = useState('');
  const [modality, setModality] = useState('');
  const [availability, setAvailability] = useState('');
  const [minRating, setMinRating] = useState('');

  const professions = ['Electricista', 'Gasfitero', 'Carpintero', 'Cocinero', 'Vendedor', 'Albañil', 'Pintor', 'Soldador', 'Mecánico', 'Otros'];
  const districts = ['Comas', 'Carabayllo', 'Puente Piedra', 'Independencia', 'Los Olivos', 'San Martín', 'Otros'];
  const modalities = ['Presencial', 'Remoto', 'Híbrido'];
  const availabilities = ['Inmediata', '1 semana', '2 semanas', '1 mes'];

  useEffect(() => {
    searchWorkers();
  }, []);

  const searchWorkers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('worker_profiles')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,profession.ilike.%${search}%`);
      }
      if (profession) {
        query = query.eq('profession', profession);
      }
      if (district) {
        query = query.eq('district', district);
      }
      if (modality) {
        query = query.eq('preferred_modality', modality);
      }
      if (availability) {
        query = query.eq('availability', availability);
      }
      if (minRating) {
        query = query.gte('rating', parseFloat(minRating));
      }

      const { data, error } = await query.limit(50);

      if (!error && data) {
        setWorkers(data);
      }
    } catch (err) {
      console.error('Error searching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await searchWorkers();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setSearch('');
    setProfession('');
    setDistrict('');
    setModality('');
    setAvailability('');
    setMinRating('');
  };

  const activeFiltersCount = [profession, district, modality, availability, minRating].filter(Boolean).length;

  const WorkerCard = ({ worker }: { worker: any }) => (
    <Card style={styles.workerCard} onPress={() => router.push(`/(company)/talent/${worker.id}`)}>
      <View style={styles.cardHeader}>
        <Avatar
          source={worker.photo_url}
          name={`${worker.first_name} ${worker.last_name}`}
          size={56}
        />
        <View style={styles.workerInfo}>
          <Text style={[styles.workerName, { color: theme.colors.text }]}>
            {worker.first_name} {worker.last_name}
          </Text>
          <Text style={[styles.workerProfession, { color: theme.colors.primary[600] }]}>
            {worker.profession || 'Sin profesión'}
          </Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color={theme.colors.textSecondary} />
            <Text style={[styles.workerLocation, { color: theme.colors.textSecondary }]}>
              {worker.district}
            </Text>
          </View>
        </View>
        {worker.rating > 0 && (
          <View style={styles.ratingBox}>
            <Star size={14} color={theme.colors.warning[500]} fill={theme.colors.warning[500]} />
            <Text style={[styles.ratingText, { color: theme.colors.text }]}>
              {worker.rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {worker.skills && worker.skills.length > 0 && (
        <View style={styles.skillsRow}>
          {worker.skills.slice(0, 3).map((skill: string, idx: number) => (
            <Badge key={idx} text={skill} variant="neutral" size="sm" />
          ))}
          {worker.skills.length > 3 && (
            <Text style={[styles.moreSkills, { color: theme.colors.textSecondary }]}>
              +{worker.skills.length - 3}
            </Text>
          )}
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Clock size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            {worker.availability || 'Flexible'}
          </Text>
        </View>
        <Badge
          text={worker.preferred_modality || 'Presencial'}
          variant="primary"
          size="sm"
        />
      </View>
    </Card>
  );

  const FilterChip = ({ label, value, onClear }: { label: string; value: string; onClear: () => void }) => (
    <View style={[styles.filterChip, { backgroundColor: theme.colors.primary[100] }]}>
      <Text style={[styles.filterChipText, { color: theme.colors.primary[700] }]}>{value}</Text>
      <TouchableOpacity onPress={onClear}>
        <X size={14} color={theme.colors.primary[700]} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={[styles.searchBox, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Search size={20} color={theme.colors.textSecondary} />
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre, profesión..."
            placeholderTextColor={theme.colors.textTertiary}
            style={{ flex: 1, marginLeft: Spacing.sm }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && { backgroundColor: theme.colors.primary[500] }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? '#FFFFFF' : theme.colors.text} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active filters */}
      {activeFiltersCount > 0 && (
        <View style={styles.activeFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersContent}>
            {profession && <FilterChip label="Profesión" value={profession} onClear={() => setProfession('')} />}
            {district && <FilterChip label="Distrito" value={district} onClear={() => setDistrict('')} />}
            {modality && <FilterChip label="Modalidad" value={modality} onClear={() => setModality('')} />}
            {availability && <FilterChip label="Disponibilidad" value={availability} onClear={() => setAvailability('')} />}
            {minRating && <FilterChip label="Rating" value={`${minRating}+`} onClear={() => setMinRating('')} />}
            <TouchableOpacity style={styles.clearAllBtn} onPress={clearFilters}>
              <Text style={[styles.clearAllText, { color: theme.colors.error[500] }]}>Limpiar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <View style={[styles.filtersPanel, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.filtersTitle, { color: theme.colors.text }]}>Filtros</Text>

          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Profesión</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterOption, !profession && { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => setProfession('')}
            >
              <Text style={[styles.filterOptionText, !profession && { color: '#FFFFFF' }]}>Todas</Text>
            </TouchableOpacity>
            {professions.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.filterOption, profession === p && { backgroundColor: theme.colors.primary[500] }]}
                onPress={() => setProfession(p)}
              >
                <Text style={[styles.filterOptionText, profession === p && { color: '#FFFFFF' }]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Distrito</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterOption, !district && { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => setDistrict('')}
            >
              <Text style={[styles.filterOptionText, !district && { color: '#FFFFFF' }]}>Todos</Text>
            </TouchableOpacity>
            {districts.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.filterOption, district === d && { backgroundColor: theme.colors.primary[500] }]}
                onPress={() => setDistrict(d)}
              >
                <Text style={[styles.filterOptionText, district === d && { color: '#FFFFFF' }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Modalidad</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterOption, !modality && { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => setModality('')}
            >
              <Text style={[styles.filterOptionText, !modality && { color: '#FFFFFF' }]}>Todas</Text>
            </TouchableOpacity>
            {modalities.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.filterOption, modality === m && { backgroundColor: theme.colors.primary[500] }]}
                onPress={() => setModality(m)}
              >
                <Text style={[styles.filterOptionText, modality === m && { color: '#FFFFFF' }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Disponibilidad</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[styles.filterOption, !availability && { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => setAvailability('')}
            >
              <Text style={[styles.filterOptionText, !availability && { color: '#FFFFFF' }]}>Todas</Text>
            </TouchableOpacity>
            {availabilities.map((a) => (
              <TouchableOpacity
                key={a}
                style={[styles.filterOption, availability === a && { backgroundColor: theme.colors.primary[500] }]}
                onPress={() => setAvailability(a)}
              >
                <Text style={[styles.filterOptionText, availability === a && { color: '#FFFFFF' }]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Rating mínimo</Text>
          <View style={styles.filterOptions}>
            {['', '4', '4.5', '5'].map((r) => (
              <TouchableOpacity
                key={r || 'all'}
                style={[styles.filterOption, minRating === r && { backgroundColor: theme.colors.primary[500] }]}
                onPress={() => setMinRating(r)}
              >
                <Text style={[styles.filterOptionText, minRating === r && { color: '#FFFFFF' }]}>
                  {r ? `${r}+` : 'Todos'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Aplicar filtros" onPress={searchWorkers} size="lg" style={{ marginTop: Spacing.md }} />
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: theme.colors.text }]}>
          {workers.length} trabajadores encontrados
        </Text>
      </View>

      {/* Workers List */}
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WorkerCard worker={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Users size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sin resultados</Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              Ajusta los filtros para encontrar trabajadores
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchHeader: { flexDirection: 'row', paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.md, gap: Spacing.sm },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, borderRadius: Spacing.radius.lg },
  filterBtn: { width: 48, height: 48, borderRadius: Spacing.radius.lg, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#E53935', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  filterBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  activeFiltersRow: { paddingVertical: Spacing.sm },
  activeFiltersContent: { paddingHorizontal: Spacing.screenPadding, gap: Spacing.sm },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full },
  filterChipText: { fontSize: 13 },
  clearAllBtn: { paddingHorizontal: Spacing.md, justifyContent: 'center' },
  clearAllText: { fontSize: 13, fontWeight: '600' },
  filtersPanel: { padding: Spacing.screenPadding, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  filtersTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  filterLabel: { fontSize: 14, fontWeight: '500', marginTop: Spacing.sm, marginBottom: Spacing.xs },
  filterOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  filterOption: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.full, backgroundColor: '#E0E0E0' },
  filterOptionText: { fontSize: 13, color: '#424242' },
  resultsHeader: { paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.sm },
  resultsCount: { fontSize: 14 },
  listContent: { padding: Spacing.screenPadding },
  workerCard: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row' },
  workerInfo: { flex: 1, marginLeft: Spacing.md },
  workerName: { fontSize: 16, fontWeight: '600' },
  workerProfession: { fontSize: 14, marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  workerLocation: { fontSize: 12 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Spacing.radius.sm, backgroundColor: 'rgba(255,180,0,0.1)' },
  ratingText: { fontSize: 14, fontWeight: '600' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.md },
  moreSkills: { fontSize: 12, lineHeight: 26 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  emptyDesc: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },
});
