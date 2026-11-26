import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
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
import { useAuth } from '@/contexts/auth-context';
import { normalizeEmail, validateEmail } from '@/data/auth/validation';

export default function LoginScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { registered } = useLocalSearchParams<{ registered?: string }>();
  const { signIn, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleLoginSubmit = async (): Promise<void> => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorMessage(emailError);
      return;
    }
    if (password.length === 0) {
      setErrorMessage('Password wajib diisi.');
      return;
    }

    setErrorMessage('');
    setSubmitting(true);
    try {
      await signIn(normalizeEmail(email), password);
      router.replace('/home');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Gagal masuk. Silakan coba lagi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrorMessage('Isi email kamu dulu, lalu tekan "Lupa Password?" lagi.');
      return;
    }

    setErrorMessage('');
    setSendingReset(true);
    try {
      await resetPassword(normalizeEmail(email));
      setInfoMessage(`Tautan reset password sudah dikirim ke ${normalizeEmail(email)}.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Gagal mengirim tautan reset password.'
      );
    } finally {
      setSendingReset(false);
    }
  };

  return (
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
            <View style={styles.header}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
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
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={20} color={Colors.error} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {infoMessage ? (
              <View style={styles.infoBanner}>
                <MaterialIcons name="mark-email-read" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{infoMessage}</Text>
              </View>
            ) : null}

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

              <TouchableOpacity
                style={styles.forgotButton}
                activeOpacity={0.7}
                disabled={sendingReset}
                onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>
                  {sendingReset ? 'Mengirim...' : 'Lupa Password?'}
                </Text>
              </TouchableOpacity>

              <PrimaryButton
                label="Masuk"
                onPress={handleLoginSubmit}
                loading={submitting}
              />
            </View>

            <View style={styles.hintCard}>
              <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
              <Text style={styles.hintText}>
                Sesi login disimpan aman di perangkat, jadi kamu tidak perlu masuk
                ulang setiap membuka aplikasi.
              </Text>
            </View>

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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.errorContainer,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.error,
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  infoText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.onPrimaryContainer,
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
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(215, 193, 197, 0.35)',
    backgroundColor: Colors.surfaceContainerLowest,
    ...ShadowSoft,
  },
  hintText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
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
