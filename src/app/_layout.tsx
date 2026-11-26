import {
  Montserrat_300Light,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/contexts/auth-context';

SplashScreen.preventAutoHideAsync();

/** Splash ditahan sampai font siap dan sesi Supabase selesai dibaca. */
function RootNavigator({ fontsReady }: { fontsReady: boolean }): React.JSX.Element | null {
  const { session, loading } = useAuth();
  const ready = fontsReady && !loading;
  const isAuthenticated = session !== null;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff8f7' },
      }}>
      <Stack.Screen name="index" />
      {/* Halaman publik: boleh diakses tanpa login. */}
      <Stack.Screen name="home" />
      <Stack.Screen name="product" />

      {/* Hanya untuk pengguna yang belum login. */}
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>

      {/* Dijaga: otomatis dilempar keluar saat sesi berakhir. */}
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="profile" />
        <Stack.Screen name="order" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_400Regular,
    Montserrat_300Light,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  return (
    <AuthProvider>
      <RootNavigator fontsReady={fontsLoaded || Boolean(fontError)} />
    </AuthProvider>
  );
}
