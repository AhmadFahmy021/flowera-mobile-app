/**
 * Data produk untuk home & halaman detail (`/product/[id]`).
 *
 * Bentuk data sengaja mengikuti respons `GET /api/user/product/detail/:id`
 * di web (`product`, `product_variant`, `addon_product`, `store`) dan
 * ditambah field tampilan ala marketplace (terjual, rating toko, ulasan).
 * `fetchProductById` async supaya bisa diganti panggilan API tanpa mengubah
 * layar. Katalog masih in-memory seperti `@/data/auth/accounts`.
 */

/* ──────────────────────────── Types ──────────────────────────── */

export interface ProductImage {
  id: number;
  imageUrl: string;
  isDefault: boolean;
}

export interface ProductVariant {
  id: number;
  title: string;
  subTitle?: string;
  price: number;
  imageUrl?: string;
}

export interface ProductAddon {
  id: number;
  title: string;
  price: number;
}

export interface ProductStore {
  id: number;
  name: string;
  city: string;
}

export interface ProductReview {
  id: number;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ProductRecord {
  id: number;
  name: string;
  slug: string;
  /** Kategori untuk chip "Belanja Sesuai Kebutuhan" di home. */
  category: string;
  price: number;
  description: string;
  rating: number;
  isLifeFlower: boolean;
  /** Jumlah produk terjual, ditampilkan di blok harga. */
  sold: number;
  /** Rating & jumlah penilai toko, ditampilkan pada pill di atas gambar. */
  storeRating: number;
  storeReviewers: number;
  /** 3 keunggulan singkat yang tampil di overlay gambar. */
  highlights: string[];
  /** Label promo di samping harga (mis. "Dengan Voucher"). */
  voucherLabel?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  addons: ProductAddon[];
  reviews: ProductReview[];
  store: ProductStore;
}

/* ──────────────────────────── Gambar (sama dengan aset web) ──────────────────────────── */

const SEASONAL_BLOOM_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCHU-MNzSwSUbbUPvKZvCkAJnjjr1Q74pczA_BThQ1vmUXiAhigqFmfVM6UJBm6PKYLM6lwwR3NMrcTTLt9dYI6OdgW0NKTbW4t9TA8qu-ZUJaBia7VZ6ym3L57bQlqRQnEc0s2CL8xzuJjMzuFph9CXFRr3tv-TDqJl2Ju2inAm_6q0EVgsVwlto2C5UtHP0eocusr5WBn4VLNDYxwoz6p-itwOP7TBGSVeE-XuAy14jdF2ULjhxN4qEUGFGCz-m7liS_ZWUqg-1Y';

const MIDNIGHT_GRACE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2gUwgvHVeY6k-Mj9af0voVS5A7taBgEpmlkFTl1zVrhEOYtXz_p2qiRwDkkPYfepg8PZFoARMelNrheS_Sfbk7gimiQT8hYb7mvqWroNJsZWJfRXzN70p5V1vSnIljQcRwcPvUMZoxPB4KpASwBXWz6Z2zi_jo4jghhbkeD6Wq56PRXeXB3QyWkn8VdlTpjSKyJzdX3UfhpWT_yr54S666YNUHSjPPHFKHehPl0B0oX3KWA-UD3jX489q-4DErQXTgD4RjbM-wB0';

const GOLDEN_HOUR_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALi3jtLys9GQK4zuPNTLeK5fH-p66mY-cHWAwD4bB86HAtWgVdzDsyjW0ILgI6Rl7fwyDwrXxOE5IkIo6NArfueTT8wzW5iZnUQYKUNqibjc3HH3X4mmsTmQLolHRVY_SVDTN6wSCyWscb_Akr9nuBg6CWJA1nqSAU0a7-WgNmmWMgJxd_LVZBsV2OEM1uB_ZHItrtYyIHzZ9eZBHmYaDUsC9Ml09B3EDEjzl0zNHW1jrY2nyPKjI-ByOqzX1zcjT5BLmQ86srKGs';

const ROSES_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAlxCGYf0kCA8GjMVjj3gy_tGqHvH3I5EgAqChbNHadQ5KfYii5hu1G636-M8SfpfmUxOnCy2dBHW4Sz5kWXjdTVHJ18dt5nIhhhf1fx7IQ2NqJcPEl-yyt3hTG6Kf0NUsJqNSOBrzgkUj6-nDBlaaNh0rwaQ-IeYxHXksU4_6unWJ_x34tXJIS2yCPvdEYGdS87TH7SLjNKXHJ5nA5pK9owKibCGZu5V7MBiF26Sg188Lw5AwuWYjb8fjfq3r6ky7505N_8yhkv8M';

const TULIPS_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDWjPJUIvA_CiWBA_DPTi_zwPbeE7INrhYaCdH7shUD5MgdLN6pFxP4AmjA-LQYBfgrhizB1Y3Lj4tZB3ETUG5B8Nc8IdQiG3kAJa0upreULqo8JWeb2ElL7jH8fk1rdzFuIoRigRmGgj2MGGWpmjBGPKPKZHHi9q72gBRvaaDX7_A5DDhIzYw5VVvQFbVezYwHKcG6dRYMNXt34eIsZ9UX2A5N4FcP6hjc9rDBVSpHjnMAY5iHGWRpQNo6-SnkJRdPzDlJKw-p8PI';

/* ──────────────────────────── Katalog ──────────────────────────── */

/** Array of Objects produk yang bisa dibuka lewat `/product/<id>`. */
export const PRODUCT_CATALOG: ProductRecord[] = [
  {
    id: 1,
    name: 'Seasonal Bloom Bouquet',
    slug: 'seasonal-bloom-bouquet',
    category: 'Hand Bouquet',
    price: 185000,
    description:
      'Buket peony pilihan yang dirangkai tangan setiap pagi, dipadukan dengan eucalyptus segar dan kertas pembungkus linen. Dikirim dalam kondisi prima dengan garansi kesegaran 3 hari.',
    rating: 4.8,
    isLifeFlower: true,
    sold: 328,
    storeRating: 4.9,
    storeReviewers: 828,
    highlights: ['Peony segar panen harian', 'Garansi kesegaran 3 hari', 'Gratis kartu ucapan'],
    voucherLabel: 'Dengan Voucher',
    images: [
      { id: 1, imageUrl: SEASONAL_BLOOM_IMAGE, isDefault: true },
      { id: 2, imageUrl: ROSES_IMAGE, isDefault: false },
    ],
    variants: [
      {
        id: 11,
        title: 'Signature',
        subTitle: 'Peony + eucalyptus',
        price: 185000,
        imageUrl: SEASONAL_BLOOM_IMAGE,
      },
      {
        id: 12,
        title: 'Deluxe',
        subTitle: '1.5x lebih banyak',
        price: 265000,
        imageUrl: ROSES_IMAGE,
      },
      {
        id: 13,
        title: 'Premium',
        subTitle: 'Termasuk vas keramik',
        price: 345000,
        imageUrl: TULIPS_IMAGE,
      },
    ],
    addons: [
      { id: 101, title: 'Kartu Ucapan', price: 15000 },
      { id: 102, title: 'Vas Kaca', price: 45000 },
      { id: 103, title: 'Cokelat Artisan', price: 35000 },
    ],
    reviews: [
      {
        id: 1001,
        author: 'Dinda',
        rating: 5,
        date: '18 Okt 2026',
        comment: 'Bunganya segar banget, wanginya lembut. Packing rapi dan sampai tepat waktu.',
      },
      {
        id: 1002,
        author: 'Raka',
        rating: 5,
        date: '15 Okt 2026',
        comment: 'Sesuai foto, kartu ucapannya bisa custom. Bakal order lagi bulan depan.',
      },
      {
        id: 1003,
        author: 'Nadia',
        rating: 4,
        date: '10 Okt 2026',
        comment: 'Cantik dan wangi, sayang vas tambahannya agak kecil untuk buket premium.',
      },
    ],
    store: { id: 1, name: 'Flowera Boutique', city: 'Jakarta Selatan' },
  },
  {
    id: 2,
    name: 'Midnight Grace',
    slug: 'midnight-grace',
    category: 'Vase Arrangement',
    price: 225000,
    description:
      'Kombinasi calla lily ungu tua dan rose burgundy yang mewah. Cocok untuk momen istimewa yang berkesan tenang dan elegan, dirangkai oleh florist bersertifikat.',
    rating: 4.9,
    isLifeFlower: true,
    sold: 152,
    storeRating: 4.8,
    storeReviewers: 512,
    highlights: ['Calla lily + rose burgundy', 'Dirangkai florist bersertifikat', 'Kartu emas eksklusif'],
    voucherLabel: 'Dengan Voucher',
    images: [
      { id: 21, imageUrl: MIDNIGHT_GRACE_IMAGE, isDefault: true },
      { id: 22, imageUrl: TULIPS_IMAGE, isDefault: false },
    ],
    variants: [
      {
        id: 21,
        title: 'Classic',
        subTitle: '10 tangkai',
        price: 225000,
        imageUrl: MIDNIGHT_GRACE_IMAGE,
      },
      {
        id: 22,
        title: 'Grand',
        subTitle: '18 tangkai + kartu emas',
        price: 315000,
        imageUrl: TULIPS_IMAGE,
      },
    ],
    addons: [
      { id: 201, title: 'Kartu Ucapan', price: 15000 },
      { id: 202, title: 'Lilin Aroma', price: 55000 },
    ],
    reviews: [
      {
        id: 2001,
        author: 'Sinta',
        rating: 5,
        date: '19 Okt 2026',
        comment: 'Mewah banget, warnanya persis seperti foto. Cocok untuk anniversary.',
      },
      {
        id: 2002,
        author: 'Alya',
        rating: 5,
        date: '12 Okt 2026',
        comment: 'Pengiriman cepat, bunga masih segar saat diterima.',
      },
    ],
    store: { id: 2, name: 'Dark Petal Studio', city: 'Bandung' },
  },
  {
    id: 3,
    name: 'Golden Hour',
    slug: 'golden-hour',
    category: 'Bunga Meja',
    price: 165000,
    description:
      'Sunflower cerah berpadu delphinium biru yang menghadirkan suasana sore keemasan. Pilihan tepat untuk merayakan kelulusan, ulang tahun, atau sekadar menyapa.',
    rating: 4.7,
    isLifeFlower: false,
    sold: 96,
    storeRating: 4.7,
    storeReviewers: 240,
    highlights: ['Sunflower + delphinium', 'Cocok untuk hadiah wisuda', 'Pita premium gratis'],
    voucherLabel: 'Dengan Voucher',
    images: [
      { id: 31, imageUrl: GOLDEN_HOUR_IMAGE, isDefault: true },
      { id: 32, imageUrl: ROSES_IMAGE, isDefault: false },
    ],
    variants: [
      {
        id: 31,
        title: 'Standard',
        subTitle: 'Sunflower + delphinium',
        price: 165000,
        imageUrl: GOLDEN_HOUR_IMAGE,
      },
      {
        id: 32,
        title: 'Grand',
        subTitle: 'Buket besar untuk panggung',
        price: 235000,
        imageUrl: ROSES_IMAGE,
      },
    ],
    addons: [
      { id: 301, title: 'Kartu Ucapan', price: 15000 },
      { id: 302, title: 'Pita Premium', price: 20000 },
    ],
    reviews: [
      {
        id: 3001,
        author: 'Bima',
        rating: 5,
        date: '17 Okt 2026',
        comment: 'Bunganya besar-besar dan cerah. Puas banget buat hadiah wisuda.',
      },
      {
        id: 3002,
        author: 'Citra',
        rating: 4,
        date: '9 Okt 2026',
        comment: 'Cantik, hanya saja pengiriman sedikit lebih lambat dari perkiraan.',
      },
    ],
    store: { id: 3, name: 'Sunlit Florist', city: 'Surabaya' },
  },
];

/* ──────────────────────────── Hero beranda ──────────────────────────── */

/** Satu slide carousel beranda (judul & deskripsi sama dengan versi web). */
export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: 'Seasonal Bloom',
    subtitle: 'Collection',
    description:
      'Experience the elegance of hand-picked peonies delivered fresh to your doorstep.',
    imageUrl: SEASONAL_BLOOM_IMAGE,
  },
  {
    id: 2,
    title: 'Midnight Grace',
    subtitle: 'Premium',
    description:
      'A luxurious arrangement of deep purple calla lilies and dark burgundy roses.',
    imageUrl: MIDNIGHT_GRACE_IMAGE,
  },
  {
    id: 3,
    title: 'Golden Hour',
    subtitle: 'Vibrant',
    description: "Brighten someone's day with sunflowers and blue delphiniums.",
    imageUrl: GOLDEN_HOUR_IMAGE,
  },
];

/* ──────────────────────────── Loader ──────────────────────────── */

/**
 * Mengambil satu produk berdasarkan id dari URL (`/product/[id]`).
 *
 * Fungsi dibuat `async` supaya layar sudah memakai alur loading/error yang
 * sama seperti web; saat API siap, isi fungsi tinggal diganti `fetch`.
 * Mengembalikan `null` bila id tidak valid atau produk tidak ada.
 */
export async function fetchProductById(id: string): Promise<ProductRecord | null> {
  const productId = Number.parseInt(id, 10);
  if (Number.isNaN(productId)) return null;
  return PRODUCT_CATALOG.find((item) => item.id === productId) ?? null;
}
