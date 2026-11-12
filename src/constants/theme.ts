import { Platform, StyleSheet, ViewStyle } from 'react-native';

export const Colors = {
  primary: '#8c4a5c',
  onPrimary: '#ffffff',
  primaryContainer: '#f5a3b7',
  onPrimaryContainer: '#743648',
  primaryFixed: '#ffd9e0',

  secondary: '#3a6847',
  onSecondary: '#ffffff',
  secondaryContainer: '#b9ecc1',

  tertiary: '#735c00',
  tertiaryContainer: '#dcb63e',

  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',

  surface: '#fff8f7',
  onSurface: '#201a1b',
  surfaceVariant: '#ecdfe1',
  onSurfaceVariant: '#524346',
  surfaceContainer: '#f8ebec',
  surfaceContainerLow: '#fef0f2',
  surfaceContainerHigh: '#f2e5e6',
  surfaceContainerHighest: '#ecdfe1',
  surfaceContainerLowest: '#ffffff',

  background: '#fff8f7',
  onBackground: '#201a1b',
  outline: '#847376',
  outlineVariant: '#d7c1c5',

  star: '#FFB129',
} as const;

export const Fonts = {
  headline: 'PlayfairDisplay_700Bold',
  headlineMedium: 'PlayfairDisplay_500Medium',
  headlineRegular: 'PlayfairDisplay_400Regular',

  bodyLight: 'Montserrat_300Light',
  body: 'Montserrat_400Regular',
  bodyMedium: 'Montserrat_500Medium',
  bodySemiBold: 'Montserrat_600SemiBold',
  bodyBold: 'Montserrat_700Bold',
} as const;

export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 20,
  five: 24,
  six: 32,
  seven: 48,
} as const;

export const StackSm = 12;
export const StackMd = 24;
export const StackLg = 48;
export const MarginMobile = 20;

export const MaxContentWidth = 800;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const ShadowSoft: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#1F4D2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  default: { elevation: 2 },
}) as ViewStyle;

export const ShadowFloat: ViewStyle = Platform.select<ViewStyle>({
  ios: {
    shadowColor: '#1F4D2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
  },
  default: { elevation: 6 },
}) as ViewStyle;

export const Typography = StyleSheet.create({
  headline: {
    fontFamily: Fonts.headline,
    color: Colors.onSurface,
  },
  headlineMd: {
    fontFamily: Fonts.headlineMedium,
    color: Colors.onSurface,
  },
  body: {
    fontFamily: Fonts.body,
    color: Colors.onSurface,
  },
  bodyMd: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
  labelMd: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.onSurface,
  },
  labelSm: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.onSurfaceVariant,
  },
});
