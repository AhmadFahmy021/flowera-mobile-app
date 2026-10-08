export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const PHONE_REGEX = /^\+?\d{9,15}$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Buang spasi/dash supaya "0812-3456 7890" dikirim sebagai "081234567890". */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[\s-]/g, '').trim();
}

export function validateName(name: string): string | null {
  if (name.trim().length === 0) return 'Nama wajib diisi';
  return null;
}

export function validateEmail(email: string): string | null {
  const normalized = email.trim();
  if (normalized.length === 0) return 'Email wajib diisi';
  if (!EMAIL_REGEX.test(normalized)) return 'Format email tidak valid';
  return null;
}

export function validatePhoneNumber(phone: string): string | null {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.length === 0) return 'Nomor telepon wajib diisi';
  if (!PHONE_REGEX.test(normalized)) {
    return 'Nomor telepon tidak valid (9-15 digit angka)';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length === 0) return 'Password wajib diisi';
  if (password.length < PASSWORD_MIN_LENGTH) return 'Password minimal 8 karakter';
  return null;
}