export { Colors, lightTheme, darkTheme, type Theme } from './Colors';
export { Typography } from './Typography';
export { Spacing } from './Spacing';

// Configuración de la app
export const AppConfig = {
  name: 'Ciudad Activa',
  slogan: 'Conectando oportunidades que transforman vidas.',
  version: '2.0.0',

  // Ubicaciones predeterminadas
  defaultLocation: {
    district: 'Comas',
    province: 'Lima',
    department: 'Lima',
  },

  // Mensajes de error
  messages: {
    required: 'Este campo es obligatorio',
    invalidEmail: 'Ingresa un correo válido',
    invalidPhone: 'Ingresa un teléfono válido',
    invalidDNI: 'El DNI debe tener 8 dígitos',
    invalidRUC: 'El RUC debe tener 11 dígitos',
    passwordMismatch: 'Las contraseñas no coinciden',
    weakPassword: 'La contraseña debe tener al menos 8 caracteres',
    emailExists: 'El correo ya está registrado',
    loginError: 'Credenciales incorrectas',
    networkError: 'Error de conexión. Verifica tu internet.',
    genericError: 'Ha ocurrido un error. Intenta nuevamente.',
  },

  // Roles
  roles: {
    worker: 'trabajador',
    company: 'empresa',
    admin: 'administrador',
    moderator: 'moderador',
  },

  // Estados de postulación
  applicationStatus: {
    received: 'Recibida',
    reviewing: 'En revisión',
    interview: 'Entrevista programada',
    test: 'Prueba técnica',
    waiting: 'En espera',
    hired: 'Contratado',
    rejected: 'No seleccionado',
  },
};
