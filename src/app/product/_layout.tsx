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
