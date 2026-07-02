export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export const fontSize = {
  xs: 15,
  sm: 16,
  md: 17,
  lg: 18,
  xl: 24,
  xxl: 28,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// Multiplicadores: lineHeight.normal * fontSize.md = height real em px
export const lineHeight = {
  tight: 1.0,    // 100%
  normal: 1.2,   // 120%
  relaxed: 1.5,  // 150%
} as const;

// Estilos compostos prontos para usar em componentes — cor não incluída aqui,
// pois varia por contexto (use colors.text, colors.primary, etc.)
export const textStyles = {
  heading: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xxl,       // 28
    lineHeight: fontSize.xxl * lineHeight.normal,
  },
  subheading: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,       // 24
    lineHeight: fontSize.xl * lineHeight.normal,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,       // 18
    lineHeight: fontSize.lg * lineHeight.normal,
  },
  subtitle: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.md,       // 17
    lineHeight: fontSize.md * lineHeight.normal,
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,       // 16
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,       // 16
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  caption: {
  fontFamily: fontFamily.semibold,
   fontSize: fontSize.xs,       // 16
   lineHeight: fontSize.xs * lineHeight.relaxed,
  },
  input: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xl,       // 24
    lineHeight: fontSize.xl * lineHeight.normal,
  },
} as const;

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textStyles,
} as const;
