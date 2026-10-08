import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
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
import { Image } from 'expo-image';

export default function LoginScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { registered } = useLocalSearchParams<{ registered?: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = () => {
    console.log('Login submitted:', { email, password });
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

              <PrimaryButton
                label="Masuk"
                onPress={handleLoginSubmit}
              />
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
    letterSpacing: 1,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.outlineVariant,
  },
  dividerText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    paddingHorizontal: 12,
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