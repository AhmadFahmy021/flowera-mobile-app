/**
 * Layout untuk rute produk (`/product/[id]`).
 *
 * Header bawaan Expo Router disembunyikan karena layar detail produk memakai
 * app bar kustom (tombol kembali + judul + aksi favorit) agar konsisten dengan
 * versi web. `<Stack.Screen>` di sini mendaftarkan judul layar untuk navigasi.
 */

import { Stack } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/theme';

export default function ProductLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen name="[id]" options={{ title: 'Detail Produk' }} />
    </Stack>
  );
}
