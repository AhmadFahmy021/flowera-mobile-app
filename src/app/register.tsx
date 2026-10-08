/**
 * Screen Register (`/register`) — form sesuai `RegisterDto` Flowera API
 * (name, phone_number, email, password). Submit ke `POST /api/auth/register`
 * lewat `useAuth().register()`; sukses → redirect ke `/login`.
 */

import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FormField from '@/components/auth/form-field';
import PasswordStrength from '@/components/auth/password-strength';
import PrimaryButton from '@/components/auth/primary-button';
// import { useAuth } from '@/auth/auth-context';
import { Colors, Fonts, MarginMobile, StackMd } from '@/constants/theme';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhoneNumber,
} from '@/data/auth/validation';
// import { useAuth } from './auth/auth-context';

interface FieldErrors {
  name?: string;
  phone_number?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
//   const { register } = useAuth();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (): Promise<void> => {
    const errors: FieldErrors = {};

    const nameError = validateName(name);
    if (nameError) errors.name = nameError;

    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) errors.phone_number = phoneError;

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    if (confirmPassword.length === 0) {
      errors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setFormError(null);
    setSubmitting(true);
    try {
    //   await register({ name, phone_number: phoneNumber, email, password });
      router.replace({ pathname: '/login', params: { registered: '1' } });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Registrasi gagal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.header}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.title}>Buat Akun Baru</Text>
              <Text style={styles.subtitle}>
                Daftar gratis dan mulai kirim bunga untuk orang tersayang.
              </Text>
            </View>

            <View style={styles.form}>
              <FormField
                label="Nama Lengkap"
                value={name}
                onChangeText={setName}
                placeholder="Masukkan nama lengkap"
                icon="person"
                autoCapitalize="words"
                error={fieldErrors.name}
              />
              <FormField
                label="Nomor Telepon"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="08xxxxxxxxxx"
                icon="phone"
                keyboardType="phone-pad"
                autoCapitalize="none"
                error={fieldErrors.phone_number}
              />
              <FormField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="nama@email.com"
                icon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                error={fieldErrors.email}
              />

              <View style={styles.fieldGroup}>
                <FormField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimal 8 karakter"
                  icon="lock"
                  secureTextEntry
                  error={fieldErrors.password}
                />
                <PasswordStrength password={password} />
              </View>

              <FormField
                label="Konfirmasi Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Ulangi password"
                icon="lock"
                secureTextEntry
                match={passwordsMatch}
                error={
                  fieldErrors.confirmPassword ??
                  (passwordsMismatch ? 'Konfirmasi password tidak cocok' : undefined)
                }
              />

              {formError ? (
                <Text style={styles.formError}>{formError}</Text>
              ) : null}

              <PrimaryButton
                label="Buat Akun"
                onPress={handleSubmit}
                loading={submitting}
              />
            </View>

            <Text style={styles.footer}>
              Sudah punya akun?{' '}
              <Link href="/login" style={styles.link}>
                Masuk di sini
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
    justifyContent: 'center',
    paddingHorizontal: MarginMobile,
    paddingVertical: 24,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    gap: StackMd,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    height: 28,
    width: 198,
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 28,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  fieldGroup: {
    gap: 8,
  },
  form: {
    gap: 16,
  },
  formError: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
  },
  footer: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  link: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.primary,
  },
});
