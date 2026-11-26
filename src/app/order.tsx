import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Colors,
  Fonts,
  MarginMobile,
  Radius,
  ShadowSoft,
  StackLg,
  StackMd,
  StackSm,
} from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';

interface OrderStep {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
}

const ORDER_STEPS: OrderStep[] = [
  {
    icon: 'shopping-basket',
    title: 'Pilih bunga favoritmu',
    description: 'Jelajahi katalog dan tambahkan produk ke keranjang.',
  },
  {
    icon: 'local-shipping',
    title: 'Tentukan pengiriman',
    description: 'Isi alamat dan jadwal kirim sesuai kebutuhan.',
  },
  {
    icon: 'payments',
    title: 'Selesaikan pembayaran',
    description: 'Bayar dengan metode favoritmu, pesanan langsung diproses.',
  },
];

export default function OrderScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const handleBack = (): void => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pesanan Saya</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 0) + StackMd },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.greetingCard}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={30} color={Colors.primary} />
          </View>
          <View style={styles.greetingText}>
            <Text style={styles.greetingLabel}>Masuk sebagai</Text>
            <Text style={styles.greetingValue} numberOfLines={1}>
              {profile?.name ?? user?.email ?? 'Pengguna Flowera'}
            </Text>
            <Text style={styles.greetingEmail} numberOfLines={1}>
              {user?.email ?? '-'}
            </Text>
          </View>
        </View>

        <View style={styles.emptyState}>
          <MaterialIcons name="receipt-long" size={56} color={Colors.outline} />
          <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
          <Text style={styles.emptyText}>
            Semua pesanan yang kamu buat akan muncul di halaman ini.
          </Text>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => router.replace('/home')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Mulai belanja">
            <Text style={styles.primaryActionLabel}>Mulai Belanja</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cara Memesan</Text>
          <View style={styles.stepList}>
            {ORDER_STEPS.map((step, index) => (
              <View key={step.title} style={styles.stepRow}>
                <View style={styles.stepIcon}>
                  <MaterialIcons name={step.icon} size={18} color={Colors.primary} />
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>
                    {index + 1}. {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: MarginMobile,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(215, 193, 197, 0.35)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  headerTitle: {
    fontFamily: Fonts.headlineMedium,
    fontSize: 20,
    color: Colors.onSurface,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: MarginMobile,
    paddingTop: StackMd,
    gap: StackMd,
  },
  greetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: StackMd,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    ...ShadowSoft,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
  },
  greetingText: {
    flex: 1,
    gap: 2,
  },
  greetingLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.outline,
  },
  greetingValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.onSurface,
  },
  greetingEmail: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: StackMd,
    paddingVertical: StackLg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(215, 193, 197, 0.35)',
    backgroundColor: Colors.surfaceContainerLowest,
    ...ShadowSoft,
  },
  emptyTitle: {
    fontFamily: Fonts.headlineMedium,
    fontSize: 18,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  primaryAction: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  primaryActionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.onPrimary,
  },
  section: {
    gap: StackSm,
  },
  sectionTitle: {
    fontFamily: Fonts.headlineMedium,
    fontSize: 20,
    color: Colors.onSurface,
  },
  stepList: {
    gap: 12,
    padding: StackMd,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(215, 193, 197, 0.35)',
    backgroundColor: Colors.surfaceContainerLowest,
    ...ShadowSoft,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
  },
  stepText: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  stepDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },
});
