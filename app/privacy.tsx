import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts';
import { Spacing } from '@/constants';

export default function PrivacyScreen() {
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Política de Privacidad</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.lastUpdated, { color: theme.colors.textTertiary }]}>
          Última actualización: julio 2026
        </Text>

        <Section title="1. Responsable del Tratamiento">
          Ciudad Activa es responsable del tratamiento de tus datos personales, de conformidad con la Ley N.° 29733, Ley de Protección de Datos Personales del Perú.
        </Section>

        <Section title="2. Datos que Recopilamos">
          Recopilamos los siguientes datos:{'\n'}• Información de identificación: nombre, DNI, correo electrónico, teléfono{'\n'}• Datos profesionales: profesión, experiencia, habilidades, educación{'\n'}• Datos de ubicación: distrito y provincia{'\n'}• Datos de uso: interacciones con la plataforma, búsquedas, aplicaciones a empleos{'\n'}• Datos técnicos: tipo de dispositivo, versión de la app
        </Section>

        <Section title="3. Finalidad del Tratamiento">
          Usamos tus datos para:{'\n'}• Conectarte con empleadores y oportunidades laborales{'\n'}• Personalizar tu experiencia en la plataforma{'\n'}• Enviarte notificaciones sobre vacantes relevantes{'\n'}• Mejorar nuestros servicios{'\n'}• Cumplir obligaciones legales
        </Section>

        <Section title="4. Compartición de Datos">
          Tus datos personales nunca serán vendidos a terceros. Podemos compartirlos con:{'\n'}• Empresas que publican ofertas laborales (solo datos del perfil profesional){'\n'}• Proveedores de servicios tecnológicos que nos ayudan a operar la plataforma{'\n'}• Autoridades cuando sea requerido por ley
        </Section>

        <Section title="5. Privacidad de Ubicación">
          Tu dirección exacta es privada. A las empresas solo se les mostrará tu distrito y provincia. Tu dirección completa nunca será compartida sin tu consentimiento.
        </Section>

        <Section title="6. Seguridad de los Datos">
          Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo cifrado, acceso restringido y monitoreo continuo. Sin embargo, ningún sistema es completamente infalible.
        </Section>

        <Section title="7. Retención de Datos">
          Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, tus datos serán eliminados dentro de los 30 días siguientes, salvo obligación legal de conservarlos.
        </Section>

        <Section title="8. Tus Derechos">
          Tienes derecho a:{'\n'}• Acceder a tus datos personales{'\n'}• Rectificar datos incorrectos{'\n'}• Solicitar la eliminación de tus datos{'\n'}• Oponerte al tratamiento de tus datos{'\n'}• Portabilidad de datos{'\n\n'}Para ejercer estos derechos, contáctanos en: privacidad@ciudadactiva.pe
        </Section>

        <Section title="9. Cookies y Tecnologías Similares">
          Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso de la plataforma y personalizar contenido. Puedes configurar tu dispositivo para rechazar cookies, aunque esto puede limitar algunas funcionalidades.
        </Section>

        <Section title="10. Menores de Edad">
          Ciudad Activa no está dirigida a menores de 18 años. No recopilamos intencionalmente datos de menores. Si detectamos que hemos recopilado datos de un menor, los eliminaremos de inmediato.
        </Section>

        <Section title="11. Cambios en la Política">
          Podemos actualizar esta política periódicamente. Te notificaremos por correo electrónico o a través de la aplicación sobre cambios significativos.
        </Section>

        <Section title="12. Contacto">
          Para consultas sobre privacidad, escríbenos a:{'\n'}privacidad@ciudadactiva.pe{'\n'}Ciudad Activa · Lima Norte, Perú
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
