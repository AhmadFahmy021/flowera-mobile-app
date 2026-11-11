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
