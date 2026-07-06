// Ciudad Activa - Sistema de tipografía
export const Typography = {
  // Font families - se actualizarán cuando carguemos las fuentes
  primary: 'Inter',
  secondary: 'Inter',

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
  },

  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Predefined styles
  styles: {
    // Headers
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 38,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 30,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },

    // Body
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 18,
    },

    // Labels
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
    },
    labelLarge: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },

    // Caption
    caption: {
      fontSize: 10,
      fontWeight: '400' as const,
      lineHeight: 14,
    },

    // Button
    button: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    buttonLarge: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },
};

export default Typography;
