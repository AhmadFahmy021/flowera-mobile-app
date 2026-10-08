/**
 * Design tokens Flowera — diport dari `@theme` di app/globals.css web base.
 * Semua nilai warna/spacing di bawah sengaja sama persis dengan versi web
 * supaya tampilan mobile identik.
 */

import { Platform, StyleSheet, ViewStyle } from 'react-native';

/* ──────────────────────────── Warna ──────────────────────────── */

export const Colors = {
  /* Primary */
  primary: '#8c4a5c',
  onPrimary: '#ffffff',
  primaryContainer: '#f5a3b7',
  onPrimaryContainer: '#743648',
  primaryFixed: '#ffd9e0',

  /* Secondary */
  secondary: '#3a6847',
  onSecondary: '#ffffff',
  secondaryContainer: '#b9ecc1',

  /* Tertiary */
  tertiary: '#735c00',
  tertiaryContainer: '#dcb63e',

  /* Error */
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',

  /* Surface */
  surface: '#fff8f7',
  onSurface: '#201a1b',
  surfaceVariant: '#ecdfe1',
  onSurfaceVariant: '#524346',
  surfaceContainer: '#f8ebec',
  surfaceContainerLow: '#fef0f2',
  surfaceContainerHigh: '#f2e5e6',
  surfaceContainerHighest: '#ecdfe1',
  surfaceContainerLowest: '#ffffff',

  /* Background & Outline */
  background: '#fff8f7',
  onBackground: '#201a1b',
  outline: '#847376',
  outlineVariant: '#d7c1c5',

  /* Aksen tambahan (dipakai kartu produk di web) */
  star: '#FFB129',
} as const;

/* ──────────────────────────── Font ──────────────────────────── */

/**
 * Nama family mengikuti export @expo-google-fonts (lihat app/_layout.tsx).
 * Web: Playfair Display = headline, Montserrat = body.
 */
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

/* ──────────────────────────── Spacing ──────────────────────────── */
/* Sesuai token web: stack-sm 12, stack-md 24, stack-lg 48, margin-mobile 20 */

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

/* ──────────────────────────── Radius ──────────────────────────── */

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

/* ──────────────────────────── Shadow ──────────────────────────── */

/**
 * Padanan dari `shadow-soft` dan `shadow-float` di globals.css web:
 *   soft  → 0 4px 20px -2px rgba(31, 77, 46, 0.08)
 *   float → 0 8px 30px     rgba(31, 77, 46, 0.12)
 * iOS pakai shadow*, Android pakai elevation.
 */
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

/* ──────────────────────────── Tipografi siap pakai ──────────────────────────── */

/**
 * Web memakai kombinasi class seperti `font-headline font-bold text-[36px]`.
 * Helper di bawah merangkum pasangan font + warna yang sering dipakai.
 */
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
