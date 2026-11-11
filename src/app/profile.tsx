import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useState, useSyncExternalStore } from 'react';
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
import {
  getSessionSnapshot,
  setSession,
  subscribeToSession,
} from '@/data/auth/session';

type InfoRow = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
};

export default function ProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const user = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getSessionSnapshot
  );

  const handleBack = (): void => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  };

  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = (): void => {
    setSession(null);
    router.replace('/login');
  };

  const infoRows: InfoRow[] = user
    ? [
        { icon: 'mail', label: 'Email', value: user.email },
        { icon: 'badge', label: 'Peran', value: user.role },
        { icon: 'verified-user', label: 'Status', value: 'Aktif' },
      ]
    : [];

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
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 0) + StackMd },
        ]}
        showsVerticalScrollIndicator={false}>
        {user ? (
          <>
            <View style={styles.card}>
              <View style={styles.avatar}>
                <MaterialIcons
                  name={user.role === 'Florist' ? 'storefront' : 'person'}
                  size={36}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeLabel}>{user.role}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detail Akun</Text>
              <View style={styles.infoCard}>
                {infoRows.map((row, index) => (
                  <View key={row.label}>
                    {index > 0 ? <View style={styles.divider} /> : null}
                    <View style={styles.infoRow}>
                      <View style={styles.infoIcon}>
                        <MaterialIcons name={row.icon} size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.infoText}>
                        <Text style={styles.infoLabel}>{row.label}</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {row.value}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {confirmingLogout ? (
              <View style={styles.confirmCard}>
                <Text style={styles.confirmText}>Keluar dari akun ini?</Text>
                <View style={styles.confirmActions}>
                  <TouchableOpacity
                    style={[styles.confirmButton, styles.cancelButton]}
                    onPress={() => setConfirmingLogout(false)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Batal keluar">
                    <Text style={styles.cancelLabel}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, styles.confirmLogoutButton]}
                    onPress={handleLogout}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Konfirmasi keluar">
                    <Text style={styles.confirmLogoutLabel}>Ya, keluar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => setConfirmingLogout(true)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Keluar dari akun">
                <MaterialIcons name="logout" size={18} color={Colors.error} />
                <Text style={styles.logoutLabel}>Keluar</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="account-circle" size={64} color={Colors.outline} />
            <Text style={styles.emptyTitle}>Kamu belum masuk</Text>
            <Text style={styles.emptyText}>
              Masuk ke akun Flowera untuk melihat profil dan detail akunmu.
            </Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.replace('/login')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Masuk ke akun">
              <Text style={styles.loginLabel}>Masuk</Text>
            </TouchableOpacity>
          </View>
        )}
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

  card: {
    alignItems: 'center',
    gap: 8,
    padding: StackMd,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceContainerLowest,
    ...ShadowSoft,
  },
  avatar: {
    width: 80,
    height: 80,
    marginBottom: 4,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  name: {
    fontFamily: Fonts.headlineMedium,
    fontSize: 22,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  email: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  roleBadge: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
  },
  roleBadgeLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.primary,
  },

  section: {
    gap: StackSm,
  },
  sectionTitle: {
    fontFamily: Fonts.headlineMedium,
    fontSize: 20,
    color: Colors.onSurface,
  },
  infoCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(215, 193, 197, 0.35)',
    backgroundColor: Colors.surfaceContainerLowest,
    ...ShadowSoft,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.outline,
  },
  infoValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    backgroundColor: 'rgba(215, 193, 197, 0.35)',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  logoutLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.error,
  },

  confirmCard: {
    gap: StackSm,
    padding: StackMd,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(215, 193, 197, 0.35)',
    backgroundColor: Colors.surfaceContainerLowest,
    ...ShadowSoft,
  },
  confirmText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: StackSm,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  cancelButton: {
    borderColor: 'rgba(215, 193, 197, 0.6)',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  cancelLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  confirmLogoutButton: {
    borderColor: Colors.error,
    backgroundColor: Colors.error,
  },
  confirmLogoutLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.onError,
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
  loginButton: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  loginLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.onPrimary,
  },
});
