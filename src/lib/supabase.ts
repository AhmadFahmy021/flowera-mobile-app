import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum diatur di .env'
  );
}

/**
 * SecureStore menolak nilai yang terlalu panjang di sebagian perangkat,
 * sedangkan JWT Supabase bisa melewati batas tersebut. Nilai dipecah menjadi
 * beberapa bagian dan jumlahnya dicatat pada key `<key>__count`.
 */
const CHUNK_SIZE = 1800;
const COUNT_SUFFIX = '__count';

const secureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const countRaw = await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`);
    const count = countRaw ? Number.parseInt(countRaw, 10) : 0;

    if (!count) return SecureStore.getItemAsync(key);

    const parts: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const part = await SecureStore.getItemAsync(`${key}__${index}`);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    const previous = Number.parseInt(
      (await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`)) ?? '0',
      10
    );
    const nextCount = value.length > CHUNK_SIZE ? Math.ceil(value.length / CHUNK_SIZE) : 0;

    if (nextCount === 0) {
      await SecureStore.setItemAsync(key, value);
    } else {
      for (let index = 0; index < nextCount; index += 1) {
        await SecureStore.setItemAsync(
          `${key}__${index}`,
          value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
        );
      }
      await SecureStore.setItemAsync(`${key}${COUNT_SUFFIX}`, String(nextCount));
    }

    // Hapus sisa bagian dari penyimpanan sebelumnya.
    if (previous > nextCount) {
      for (let index = nextCount; index < previous; index += 1) {
        await SecureStore.deleteItemAsync(`${key}__${index}`);
      }
    }
    if (nextCount === 0) {
      await SecureStore.deleteItemAsync(`${key}${COUNT_SUFFIX}`);
    }
  },

  async removeItem(key: string): Promise<void> {
    const count = Number.parseInt(
      (await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`)) ?? '0',
      10
    );
    for (let index = 0; index < count; index += 1) {
      await SecureStore.deleteItemAsync(`${key}__${index}`);
    }
    await SecureStore.deleteItemAsync(`${key}${COUNT_SUFFIX}`);
    await SecureStore.deleteItemAsync(key);
  },
};

/** SecureStore tidak tersedia di web, jadi browser memakai localStorage. */
const webStorageAdapter = {
  getItem: async (key: string): Promise<string | null> =>
    typeof window === 'undefined' ? null : window.localStorage.getItem(key),
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

export const authStorage =
  Platform.OS === 'web' ? webStorageAdapter : secureStoreAdapter;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Aplikasi native tidak punya URL untuk membaca sesi.
    detectSessionInUrl: false,
    flowType: 'implicit',
  },
});

// Auto refresh harus berhenti saat app di background agar tidak error jaringan.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
