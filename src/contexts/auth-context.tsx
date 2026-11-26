import type { Session, User } from '@supabase/supabase-js';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase';

export type ProfileRole = 'customer' | 'seller' | 'admin';

export interface Profile {
  id: string;
  name: string;
  phone_number: string | null;
  role: ProfileRole;
  avatar_url: string | null;
}

export interface SignUpInput {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** True selama sesi awal masih dibaca dari SecureStore. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Menerjemahkan pesan error Supabase Auth ke bahasa Indonesia. */
export function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Email atau password salah.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Cek kotak masuk email kamu.';
  }
  if (normalized.includes('user already registered')) {
    return 'Email sudah terdaftar. Silakan masuk atau pakai email lain.';
  }
  if (normalized.includes('password should be at least')) {
    return 'Password terlalu lemah. Gunakan minimal 8 karakter.';
  }
  if (normalized.includes('unable to validate email')) {
    return 'Format email tidak valid.';
  }
  if (normalized.includes('email_address_invalid') || normalized.includes('is invalid')) {
    return 'Alamat email tidak dapat digunakan. Coba email lain.';
  }
  if (normalized.includes('rate limit') || normalized.includes('too many requests')) {
    return 'Terlalu banyak percobaan. Coba lagi beberapa saat.';
  }
  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'Tidak dapat menghubungi server. Periksa koneksi internet kamu.';
  }
  return message;
}

function mapProfile(row: {
  id: string;
  name: string | null;
  phone_number: string | null;
  role: string | null;
  avatar_url: string | null;
}): Profile {
  const role = row.role === 'seller' || row.role === 'admin' ? row.role : 'customer';
  return {
    id: row.id,
    name: row.name?.trim() || 'Pengguna Flowera',
    phone_number: row.phone_number,
    role,
    avatar_url: row.avatar_url,
  };
}

/**
 * Profil dibaca dari tabel `profiles`; bila tabel/row belum ada (misalnya SQL
 * setup belum dijalankan) aplikasi tetap boleh jalan memakai metadata user.
 */
function fallbackProfile(user: User): Profile {
  const metadata = user.user_metadata ?? {};
  const role = metadata.role as string | undefined;
  return {
    id: user.id,
    name: (metadata.name as string | undefined)?.trim() || user.email?.split('@')[0] || 'Pengguna',
    phone_number: (metadata.phone_number as string | undefined) ?? null,
    role: role === 'seller' || role === 'admin' ? role : 'customer',
    avatar_url: null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Mencegah update state setelah komponen di-unmount.
  const mounted = useRef(true);

  const loadProfile = useCallback(async (user: User | null): Promise<void> => {
    if (!user) {
      if (mounted.current) setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, phone_number, role, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (!mounted.current) return;

    if (error || !data) {
      setProfile(fallbackProfile(user));
      return;
    }

    setProfile(mapProfile(data));
  }, []);

  useEffect(() => {
    mounted.current = true;

    // 1. Ambil sesi yang tersimpan (mis. setelah aplikasi ditutup).
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted.current) return;
        setSession(data.session);
        await loadProfile(data.session?.user ?? null);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });

    // 2. Berlangganan perubahan sesi secara real-time (login, logout, refresh).
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted.current) return;
      setSession(nextSession);
      setLoading(false);
      // Profil dimuat di luar callback agar tidak memblokir auth lock.
      void loadProfile(nextSession?.user ?? null);
    });

    return () => {
      mounted.current = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw new Error(translateAuthError(error.message));
  }, []);

  const signUp = useCallback(
    async ({
      name,
      phoneNumber,
      email,
      password,
    }: SignUpInput): Promise<{ needsEmailConfirmation: boolean }> => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim(), phone_number: phoneNumber, role: 'customer' },
        },
      });
      if (error) throw new Error(translateAuthError(error.message));

      // Bila konfirmasi email aktif, Supabase mengembalikan user tanpa session.
      return { needsEmailConfirmation: data.session === null };
    },
    []
  );

  const signOut = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(translateAuthError(error.message));
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (error) throw new Error(translateAuthError(error.message));
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    const { data } = await supabase.auth.getSession();
    await loadProfile(data.session?.user ?? null);
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshProfile,
    }),
    [session, profile, loading, signIn, signUp, signOut, resetPassword, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  }
  return context;
}

/** Label peran yang dipakai di UI (customer → Customer). */
export function roleLabel(role: ProfileRole): string {
  if (role === 'seller') return 'Florist';
  if (role === 'admin') return 'Admin';
  return 'Customer';
}
