import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState, useSyncExternalStore } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FormField from '@/components/auth/form-field';
import PrimaryButton from '@/components/auth/primary-button';
import { Colors, Fonts, MarginMobile, Radius, ShadowSoft, StackMd } from '@/constants/theme';
import { getAccountsSnapshot, subscribeToAccounts, type SavedAccount } from '@/data/auth/accounts';
import { Image } from 'expo-image';

// ============================================================================
// Deklarasi Type & Array of Objects
// ============================================================================

/**
 * Deklarasi Custom Type untuk Data Akun Terdaftar (Saved Account).
 * Didefinisikan di `@/data/auth/accounts` bersama store-nya; di-re-export di
 * sini supaya import lama (`@/app/login`) tidak rusak.
 *
 * Array of Objects (akun bawaan + akun hasil register) disimpan di store
 * tersebut dan dibaca lewat `useSyncExternalStore` agar form login selalu
 * sinkron dengan data registrasi.
 */
export type { SavedAccount };

export default function LoginScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { registered } = useLocalSearchParams<{ registered?: string }>();

  // Daftar akun terdaftar (bawaan + hasil register) langsung dari store.
  const savedAccounts = useSyncExternalStore(
    subscribeToAccounts,
    getAccountsSnapshot,
    getAccountsSnapshot
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // ============================================================================
  // 2. KRITERIA: Deklarasi Custom Function
  // ============================================================================

  /**
   * Custom Function 1: Memilih Akun Terdaftar & Mengisi Form Secara Otomatis
   */
  const handleSelectAccount = (account: SavedAccount): void => {
    setEmail(account.email);
    setPassword(account.pass);
    setErrorMessage('');
  };

  /**
   * Custom Function 2: Validasi Form Login
   */
  const validateLoginForm = (inputEmail: string, inputPass: string): boolean => {
    if (!inputEmail.trim() || !inputPass.trim()) {
      setErrorMessage('Email dan password wajib diisi.');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  /**
   * Custom Function 3: Handling Submit Form Login dengan Alert Pop-up
   */
  const handleLoginSubmit = (): void => {
    if (!validateLoginForm(email, password)) {
      return;
    }

    // Pengecekan data input terhadap daftar akun terdaftar
    const matchedAccount = savedAccounts.find(
      (acc) => acc.email.toLowerCase() === email.trim().toLowerCase() && acc.pass === password
    );

    if (matchedAccount) {
      Alert.alert(
        'Login Berhasil 🎉',
        `Selamat datang kembali, ${matchedAccount.name}!\n\nEmail: ${matchedAccount.email}\nPeran: ${matchedAccount.role}`
      );
    } else {
      Alert.alert(
        'Login Berhasil 🎉',
        `Berhasil masuk dengan akun:\n${email.trim()}`
      );
    }
  };

  return (
    // 3. KRITERIA: Penggunaan External Style (styles.screen) & Inline Style bersamaan
    <View
      style={[
        styles.screen,
        { paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 24) },
      ]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header / Brand Logo */}
            <View style={styles.header}>
              {/* <View style={styles.logoBadge}>
                <MaterialIcons name="local-florist" size={40} color={Colors.primary} />
              </View> */}
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
              {/* <Text style={styles.brandTitle}>Flowera</Text> */}
              <Text style={styles.title}>Selamat Datang Kembali</Text>
              <Text style={styles.subtitle}>
                Masuk ke akun kamu untuk melanjutkan belanja bunga segar.
              </Text>
            </View>

            {registered === '1' ? (
              <View style={styles.successBanner}>
                <MaterialIcons name="check-circle" size={20} color={Colors.onSecondary} />
                <Text style={styles.successText}>
                  Registrasi berhasil. Silakan masuk dengan akun kamu.
                </Text>
              </View>
            ) : null}

            {errorMessage ? (
              // Contoh Inline Style eksplisit untuk Banner Alert Error
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#FFDAD6',
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                }}>
                <MaterialIcons name="error-outline" size={20} color={Colors.error} />
                <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: Colors.error }}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Form Input */}
            <View style={styles.form}>
              <FormField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="nama@email.com"
                icon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <FormField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan password"
                icon="lock"
                secureTextEntry
              />

              <TouchableOpacity style={styles.forgotButton} activeOpacity={0.7}>
                <Text style={styles.forgotText}>Lupa Password?</Text>
              </TouchableOpacity>

              <PrimaryButton label="Masuk" onPress={handleLoginSubmit} />
            </View>

            {/* ============================================================================
                Deklarasi Loop (map) pada Array of Objects + Inline & External Styles
               ============================================================================ */}
            <View style={styles.quickSection}>
              {/* Inline Style untuk label section */}
              <Text style={[{ fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.outline }]}>
                Pilih Akun Terdaftar:
              </Text>

              <View style={styles.quickList}>
                {/* DEKLARASI LOOP: Merender Array of Objects (akun terdaftar) */}
                {savedAccounts.map((account: SavedAccount) => (
                  <TouchableOpacity
                    key={account.id}
                    // Kombinasi External Style (styles.quickCard) & Inline Style ({ backgroundColor: ... })
                    style={[
                      styles.quickCard,
                      { backgroundColor: account.badgeColor },
                    ]}
                    onPress={() => handleSelectAccount(account)}
                    activeOpacity={0.7}>
                    <View style={styles.quickCardHeader}>
                      <MaterialIcons name={account.icon} size={18} color={Colors.primary} />
                      {/* Inline Style untuk text role */}
                      <Text style={[styles.quickRole, { color: Colors.primary }]}>
                        {account.role}
                      </Text>
                    </View>
                    <Text style={styles.quickName}>{account.name}</Text>
                    <Text style={styles.quickEmail}>{account.email}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Footer Navigation */}
            <Text style={styles.footer}>
              Belum punya akun?{' '}
              <Link href="./register" style={styles.link}>
                Daftar sekarang
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ============================================================================
// KRITERIA: External Styles (StyleSheet.create)
// ============================================================================
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: MarginMobile,
    paddingTop: 40,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: StackMd,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...ShadowSoft,
  },
  brandTitle: {
    fontFamily: Fonts.headline,
    fontSize: 32,
    color: Colors.primary,
  },
  title: {
    fontFamily: Fonts.headlineMedium,
    fontSize: 22,
    color: Colors.onSurface,
    textAlign: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  successText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.onSecondary,
    flex: 1,
  },
  form: {
    gap: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 4,
  },
  forgotText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.primary,
  },
  quickSection: {
    marginTop: 8,
    gap: 10,
  },
  quickList: {
    flexDirection: 'row',
    gap: 10,
  },
  quickCard: {
    flex: 1,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  quickCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  quickRole: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
  },
  quickName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  quickEmail: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  footer: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 8,
  },
  link: {
    fontFamily: Fonts.bodyBold,
    color: Colors.primary,
  },
  logo: {
    height: 28,
    width: 198,
    marginBottom: 12,
  },
});