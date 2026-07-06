// Ciudad Activa - Paleta de colores institucional
export const Colors = {
  // Colores principales
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#1976D2', // Azul institucional principal
    600: '#1565C0',
    700: '#0D47A1',
    800: '#0B3C87',
    900: '#072A5E',
  },
  secondary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Naranja institucional
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Verde
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Rojo
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  warning: {
    50: '#FFFDE7',
    100: '#FFF9C4',
    200: '#FFF59D',
    300: '#FFF176',
    400: '#FFEE58',
    500: '#FFEB3B', // Amarillo
    600: '#FDD835',
    700: '#FBC02D',
    800: '#F9A825',
    900: '#F57F17',
  },
  info: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0', // Morado
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Tema completo para modo claro y oscuro
export const lightTheme = {
  dark: false,
  colors: {
    ...Colors,
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    card: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    textTertiary: '#9E9E9E',
    border: '#E0E0E0',
    borderLight: '#F5F5F5',
    overlay: 'rgba(0, 0, 0, 0.5)',
    inputBackground: '#F5F5F5',
    inputBorder: '#E0E0E0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    ...Colors,
    background: '#121212',
    surface: '#1E1E1E',
    surfaceVariant: '#2C2C2C',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    border: '#333333',
    borderLight: '#2C2C2C',
    overlay: 'rgba(0, 0, 0, 0.7)',
    inputBackground: '#2C2C2C',
    inputBorder: '#404040',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export type Theme = typeof lightTheme;
