import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  MapPin, Briefcase, Clock, Building2, DollarSign,
  Users, Bookmark, Share2, Flag, ChevronLeft, Send, Eye
} from 'lucide-react-native';
import { useTheme } from '@/contexts';
import { useAuth } from '@/contexts';
import { Card, Avatar, Badge, Button } from '@/components/ui';
import { Spacing } from '@/constants';
import { supabase } from '@/lib/supabase';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuth();

  const [job, setJob] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, company:company_profiles(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        setJob(data);
        setCompany(data.company);

        // Verificar si ya postuló
        if (user && profile) {
          const { data: worker } = await supabase
            .from('worker_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (worker) {
            const { data: app } = await supabase
              .from('applications')
              .select('id')
              .eq('job_id', id)
              .eq('worker_id', worker.id)
              .single();
            setHasApplied(!!app);
          }
        }

        // Incrementar vistas
        await supabase
          .from('jobs')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', id);
      }
    } catch (err) {
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user || user.role !== 'trabajador') {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión como trabajador para postular');
      return;
    }

    Alert.alert(
      'Confirmar postulación',
      '¿Deseas postular a esta vacante? Se enviará tu CV y datos de perfil.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Postular',
          onPress: async () => {
            try {
              const { data: worker } = await supabase
                .from('worker_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

              if (worker) {
                const { error } = await supabase.from('applications').insert({
                  job_id: id,
                  worker_id: worker.id,
                  status: 'received',
                });

                if (!error) {
                  setHasApplied(true);
                  Alert.alert('¡Postulación enviada!', 'La empresa recibirá tu CV');
                }
              }
            } catch (err) {
              Alert.alert('Error', 'No se pudo enviar la postulación');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${job.title} - ${company?.name}\nCiudad Activa - Empleo en ${job.district}`,
        title: 'Compartir empleo'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
  };

  const handleReport = () => {
    Alert.alert('Reportar', '¿Por qué deseas reportar esta vacante?', [
      { text: 'Información falsa', onPress: () => Alert.alert('Gracias', 'Reporte enviado') },
      { text: 'Spam', onPress: () => Alert.alert('Gracias', 'Reporte enviado') },
      { text: 'Fraude', onPress: () => Alert.alert('Gracias', 'Reporte enviado') },
      { text: 'Cancelar', style: 'cancel' }
    ]);
  };

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return 'Consultar';
    if (job.salary_min && job.salary_max) return `S/ ${job.salary_min} - ${job.salary_max}`;
    if (job.salary_min) return `Desde S/ ${job.salary_min}`;
    return `Hasta S/ ${job.salary_max}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading || !job) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.text }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ChevronLeft size={28} color={theme.colors.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Company Header */}
        <TouchableOpacity onPress={() => router.push(`/company/${company?.id}`)} style={styles.companyHeader}>
          <Avatar source={company?.logo_url} name={company?.name} size={70} />
          <View style={styles.companyHeaderInfo}>
            <Text style={[styles.jobTitle, { color: theme.colors.text }]}>{job.title}</Text>
            <View style={styles.companyRow}>
              <Text style={[styles.companyName, { color: theme.colors.textSecondary }]}>
                {company?.name}
              </Text>
              {company?.verified && (
                <Badge text="Verificada" variant="success" size="sm" />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Salary Badge */}
        <View style={styles.salarySection}>
          <View style={[styles.salaryBadge, { backgroundColor: theme.colors.success[100] }]}>
            <DollarSign size={18} color={theme.colors.success[600]} />
            <Text style={[styles.salaryText, { color: theme.colors.success[700] }]}>
              {formatSalary()}
            </Text>
            <Text style={[styles.salaryType, { color: theme.colors.success[600] }]}>
              {job.salary_type === 'monthly' ? '/ mes' : job.salary_type === 'hourly' ? '/ hora' : ''}
            </Text>
          </View>
        </View>

        {/* Quick Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MapPin size={18} color={theme.colors.primary[500]} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>{job.district}, {job.province}</Text>
          </View>
          <View style={styles.infoRow}>
            <Briefcase size={18} color={theme.colors.primary[500]} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>{job.contract_type}</Text>
          </View>
          <View style={styles.infoRow}>
            <Clock size={18} color={theme.colors.primary[500]} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>{job.schedule}</Text>
          </View>
          {job.modality && (
            <View style={styles.infoRow}>
              <Building2 size={18} color={theme.colors.primary[500]} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>{job.modality}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Users size={18} color={theme.colors.primary[500]} />
            <Text style={[styles.infoText, { color: theme.colors.text }]}>{job.vacancies} vacante(s)</Text>
          </View>
          <View style={styles.infoRow}>
            <Eye size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{job.views} visualizaciones</Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]} onPress={handleShare}>
            <Share2 size={20} color={theme.colors.text} />
            <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>Compartir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: isSaved ? theme.colors.warning[100] : theme.colors.surfaceVariant }]}
            onPress={handleSave}
          >
            <Bookmark size={20} color={isSaved ? theme.colors.warning[600] : theme.colors.text} />
            <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>{isSaved ? 'Guardado' : 'Guardar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]} onPress={handleReport}>
            <Flag size={20} color={theme.colors.text} />
            <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>Reportar</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Descripción</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {job.description}
          </Text>
        </View>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Requisitos</Text>
            {job.requirements.map((req: string, idx: number) => (
              <View key={idx} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.primary[500] }]} />
                <Text style={[styles.listText, { color: theme.colors.textSecondary }]}>{req}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Beneficios</Text>
            {job.benefits.map((ben: string, idx: number) => (
              <View key={idx} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: theme.colors.success[500] }]} />
                <Text style={[styles.listText, { color: theme.colors.textSecondary }]}>{ben}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Empresa</Text>
          <Card style={styles.companyCard}>
            <View style={styles.companyCardHeader}>
              <Avatar source={company?.logo_url} name={company?.name} size={50} />
              <View style={styles.companyCardInfo}>
                <Text style={[styles.companyCardName, { color: theme.colors.text }]}>{company?.name}</Text>
                <Text style={[styles.companyCardIndustry, { color: theme.colors.textSecondary }]}>
                  {company?.industry}
                </Text>
              </View>
            </View>
            {company?.description && (
              <Text style={[styles.companyCardDesc, { color: theme.colors.textSecondary }]} numberOfLines={3}>
                {company.description}
              </Text>
            )}
            <Button
              title="Ver perfil de empresa"
              variant="outline"
              fullWidth
              size="sm"
              onPress={() => router.push(`/company/${company?.id}`)}
            />
          </Card>
        </View>

        {/* Footer */}
        <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
          Publicado: {formatDate(job.created_at)}
          {job.deadline && ` | Vence: ${formatDate(job.deadline)}`}
        </Text>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        {hasApplied ? (
          <Button
            title="Postulación enviada"
            variant="outline"
            fullWidth
            size="lg"
            disabled
            onPress={() => {}}
          />
        ) : (
          <Button
            title="Postular ahora"
            fullWidth
            size="lg"
            leftIcon={<Send size={20} color="#FFFFFF" />}
            onPress={handleApply}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { padding: Spacing.md },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing.md },
  companyHeader: { flexDirection: 'row', marginBottom: Spacing.lg },
  companyHeaderInfo: { flex: 1, marginLeft: Spacing.md, justifyContent: 'center' },
  jobTitle: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  companyName: { fontSize: 16 },
  salarySection: { marginBottom: Spacing.lg },
  salaryBadge: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Spacing.radius.xl, alignSelf: 'flex-start', gap: Spacing.sm },
  salaryText: { fontSize: 18, fontWeight: '700' },
  salaryType: { fontSize: 12 },
  infoCard: { marginBottom: Spacing.lg },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.md },
  infoText: { fontSize: 14, flex: 1 },
  actionButtons: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl, justifyContent: 'space-around' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Spacing.radius.lg, gap: Spacing.xs },
  actionBtnText: { fontSize: 12 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  description: { fontSize: 14, lineHeight: 22 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6, marginRight: Spacing.sm },
  listText: { fontSize: 14, flex: 1, lineHeight: 20 },
  companyCard: {},
  companyCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  companyCardInfo: { flex: 1, marginLeft: Spacing.md },
  companyCardName: { fontSize: 16, fontWeight: '600' },
  companyCardIndustry: { fontSize: 13 },
  companyCardDesc: { fontSize: 13, marginBottom: Spacing.md },
  footerText: { fontSize: 12, textAlign: 'center', marginTop: Spacing.md },
  bottomBar: { padding: Spacing.md, borderTopWidth: 1 },
  bottomSpacing: { height: 20 }
});
