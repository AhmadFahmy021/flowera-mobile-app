/**
 * Format angka menjadi mata uang Rupiah — padanan `utils/format.ts` di web
 * (`Intl.NumberFormat` dengan gaya currency IDR tanpa desimal).
 */

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Rp 0';
  return rupiahFormatter.format(amount);
}
