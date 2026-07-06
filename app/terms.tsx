import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';
import { Spacing } from '@/constants';

export default function TermsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const bg = isDark ? theme.colors.background : '#FFFFFF';

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: theme.colors.textSecondary }]}>{children}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <View style={[styles.backBtnInner, { backgroundColor: isDark ? theme.colors.surfaceVariant : '#F5F7FA' }]}>
            <ArrowLeft size={22} color={theme.colors.text} />
          </View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Términos y Condiciones</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: theme.colors.textTertiary }]}>
          Última actualización: julio 2026
        </Text>

        <Section title="1. Aceptación de los Términos">
          Al utilizar Ciudad Activa, aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestra plataforma.
        </Section>

        <Section title="2. Descripción del Servicio">
          Ciudad Activa es una plataforma digital que conecta a trabajadores con oportunidades laborales, capacitaciones, eventos comunitarios y recursos de desarrollo personal y profesional en Lima Norte y distritos aledaños.
        </Section>

        <Section title="3. Registro y Cuentas">
          Para usar ciertas funciones, debes registrarte con información veraz y actualizada. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta.{'\n\n'}Un mismo correo electrónico no puede ser registrado como trabajador y empresa simultáneamente.
        </Section>

        <Section title="4. Uso Aceptable">
          Te comprometes a no usar la plataforma para:{'\n'}• Publicar información falsa o engañosa{'\n'}• Acosar u hostigar a otros usuarios{'\n'}• Violar derechos de propiedad intelectual{'\n'}• Realizar actividades ilegales o fraudulentas{'\n'}• Interferir con el funcionamiento de la plataforma
        </Section>

        <Section title="5. Contenido del Usuario">
          Al publicar contenido en Ciudad Activa, nos otorgas una licencia no exclusiva para mostrar y distribuir dicho contenido dentro de la plataforma. Eres responsable del contenido que publicas y garantizas que no infringe derechos de terceros.
        </Section>

        <Section title="6. Ofertas de Empleo">
          Las empresas son responsables de la veracidad de las ofertas laborales publicadas. Ciudad Activa actúa como intermediario y no garantiza la calidad ni la disponibilidad de los empleos listados.
        </Section>

        <Section title="7. Privacidad">
          El uso de tus datos personales se rige por nuestra Política de Privacidad, la cual forma parte integral de estos términos.
        </Section>

        <Section title="8. Limitación de Responsabilidad">
          Ciudad Activa no será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la plataforma.
        </Section>

        <Section title="9. Modificaciones">
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos de cambios significativos a través de la plataforma o por correo electrónico.
        </Section>

        <Section title="10. Ley Aplicable">
          Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa será sometida a la jurisdicción de los tribunales de Lima.
        </Section>

        <Section title="11. Contacto">
          Si tienes preguntas sobre estos términos, contáctanos en: soporte@ciudadactiva.pe
        </Section>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: {},
  backBtnInner: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  scroll: { paddingHorizontal: 24, paddingTop: 20 },
  lastUpdated: { fontSize: 12, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sectionBody: { fontSize: 14, lineHeight: 22 },
});
