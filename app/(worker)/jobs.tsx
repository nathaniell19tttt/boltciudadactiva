import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Briefcase, Clock, Building2, Filter, X, ChevronDown } from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { Card, Avatar, Badge, SearchBar, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';
import { useJobs } from '@/hooks';

const contractTypes = ['Todos', 'Prácticas', 'Temporal', 'Indefinido', 'Freelance'];
const modalities = ['Todos', 'Presencial', 'Remoto', 'Híbrido'];

export default function JobsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { jobs, loading, filters, updateFilters, refresh } = useJobs();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContract, setSelectedContract] = useState('Todos');
  const [selectedModality, setSelectedModality] = useState('Todos');

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Consultar';
    if (min && max) return `S/ ${min} - ${max}`;
    if (min) return `Desde S/ ${min}`;
    return `Hasta S/ ${max}`;
  };

  const formatDate = (date: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff} días`;
    return new Date(date).toLocaleDateString('es-ES');
  };

  const JobCard = ({ job }: { job: any }) => (
    <TouchableOpacity onPress={() => router.push(`/(worker)/jobs/${job.id}`)}>
      <Card style={styles.jobCard}>
        <View style={styles.jobHeader}>
          <Avatar
            source={job.company?.logo_url}
            name={job.company?.name}
            size={50}
          />
          <View style={styles.jobHeaderInfo}>
            <Text style={[styles.companyName, { color: theme.colors.textSecondary }]}>
              {job.company?.name}
            </Text>
            {job.company?.verified && (
              <Badge text="Verificada" variant="success" size="sm" />
            )}
          </View>
        </View>

        <Text style={[styles.jobTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {job.title}
        </Text>

        <View style={styles.jobMetaContainer}>
          <View style={styles.jobMetaItem}>
            <MapPin size={14} color={theme.colors.textTertiary} />
            <Text style={[styles.jobMetaText, { color: theme.colors.textTertiary }]}>
              {job.district}, {job.province}
            </Text>
          </View>
          <View style={styles.jobMetaItem}>
            <Briefcase size={14} color={theme.colors.textTertiary} />
            <Text style={[styles.jobMetaText, { color: theme.colors.textTertiary }]}>
              {job.contract_type}
            </Text>
          </View>
          <View style={styles.jobMetaItem}>
            <Clock size={14} color={theme.colors.textTertiary} />
            <Text style={[styles.jobMetaText, { color: theme.colors.textTertiary }]}>
              {formatDate(job.created_at)}
            </Text>
          </View>
        </View>

        <View style={styles.jobFooter}>
          <Text style={[styles.salary, { color: theme.colors.primary[600] }]}>
            {formatSalary(job.salary_min, job.salary_max)}
          </Text>
          <View style={styles.tags}>
            {job.modality && (
              <Badge text={job.modality} variant="secondary" size="sm" />
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <SearchBar
          value={filters.search || ''}
          onChangeText={(text) => updateFilters({ search: text })}
          placeholder="Buscar por cargo, empresa..."
          onClear={() => updateFilters({ search: '' })}
        />
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? theme.colors.primary[500] : theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Tipo de contrato</Text>
            <View style={styles.filterOptions}>
              {contractTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    selectedContract === type && { backgroundColor: theme.colors.primary[500] },
                    { borderColor: theme.colors.border }
                  ]}
                  onPress={() => {
                    setSelectedContract(type);
                    updateFilters({ contract_type: type === 'Todos' ? undefined : type.toLowerCase() });
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: selectedContract === type ? '#FFFFFF' : theme.colors.text }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Modalidad</Text>
            <View style={styles.filterOptions}>
              {modalities.map((mod) => (
                <TouchableOpacity
                  key={mod}
                  style={[
                    styles.filterOption,
                    selectedModality === mod && { backgroundColor: theme.colors.primary[500] },
                    { borderColor: theme.colors.border }
                  ]}
                  onPress={() => {
                    setSelectedModality(mod);
                    updateFilters({ modality: mod === 'Todos' ? undefined : mod.toLowerCase() });
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    { color: selectedModality === mod ? '#FFFFFF' : theme.colors.text }
                  ]}>
                    {mod}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Jobs List */}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Building2 size={48} color={theme.colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No hay empleos
            </Text>
            <Text style={[styles.emptyDesc, { color: theme.colors.textSecondary }]}>
              No se encontraron empleos con los filtros actuales
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
    flexDirection: 'row',
    padding: Spacing.screenPadding,
    alignItems: 'center',
    gap: Spacing.md,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  filterSection: {
    marginBottom: Spacing.md,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.radius.full,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 13,
  },
  listContent: {
    padding: Spacing.screenPadding,
    paddingTop: 0,
  },
  jobCard: {
    marginBottom: Spacing.md,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobHeaderInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  companyName: {
    fontSize: 13,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  jobMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobMetaText: {
    fontSize: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  salary: {
    fontSize: 15,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
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
