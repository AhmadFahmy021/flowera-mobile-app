/**
 * Akses produk ke External API (DummyJSON) dan mapping response JSON menjadi
 * object `ProductRecord`.
 *
 * Kontrak bentuk response didokumentasikan lewat interface (`ProductApiItem`,
 * `ProductListApiResponse`) supaya data mentah dari server tidak dipakai
 * langsung oleh layar.
 */

import type {
  ProductAddon,
  ProductImage,
  ProductRecord,
  ProductReview,
  ProductStore,
  ProductVariant,
} from './types';

/* ──────────────────────────── Konfigurasi ──────────────────────────── */

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_PRODUCTS_API_URL ?? 'https://dummyjson.com'
).replace(/\/+$/, '');

/** Produk yang relevan untuk toko bunga: parfum floral & dekorasi rumah. */
const PRODUCT_CATEGORIES = ['fragrances', 'home-decoration'] as const;

const REQUEST_TIMEOUT_MS = 15000;

/** Kurs tampilan USD → IDR; API mengirim harga dalam USD. */
const USD_TO_IDR = 16000;

const CATEGORY_LABELS: Record<string, string> = {
  fragrances: 'Parfum',
  'home-decoration': 'Dekorasi Rumah',
};

/** API tidak menyediakan data toko, jadi toko ditentukan dari kategori. */
const STORE_BY_CATEGORY: Record<string, ProductStore> = {
  fragrances: { id: 1, name: 'Flowera Fragrance Atelier', city: 'Jakarta Selatan' },
  'home-decoration': { id: 2, name: 'Flowera Home Studio', city: 'Bandung' },
};

const DEFAULT_STORE: ProductStore = {
  id: 0,
  name: 'Flowera Official Store',
  city: 'Jakarta',
};

/* ──────────────────────────── Interface response ──────────────────────────── */

export interface ProductApiReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
}

export interface ProductApiItem {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand?: string;
  warrantyInformation: string;
  shippingInformation: string;
  reviews: ProductApiReview[];
  images: string[];
  thumbnail: string;
}

export interface ProductListApiResponse {
  products: ProductApiItem[];
  total: number;
  skip: number;
  limit: number;
}

/* ──────────────────────────── Mapping response → object ──────────────────────────── */

function toRupiah(priceUsd: number, discountPercentage: number): number {
  const finalPriceUsd = priceUsd * (1 - discountPercentage / 100);
  return Math.round((finalPriceUsd * USD_TO_IDR) / 500) * 500;
}

function formatReviewDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** Response JSON satu produk → `ProductRecord` (Object dengan Interface). */
export function mapProductApiToRecord(payload: ProductApiItem): ProductRecord {
  const images: ProductImage[] = payload.images.map((imageUrl, index) => ({
    id: payload.id * 100 + index,
    imageUrl,
    isDefault: index === 0,
  }));

  const reviews: ProductReview[] = payload.reviews.map((review, index) => ({
    id: payload.id * 100 + index,
    author: review.reviewerName,
    rating: review.rating,
    date: formatReviewDate(review.date),
    comment: review.comment,
  }));

  const variants: ProductVariant[] = [];
  const addons: ProductAddon[] = [];

  return {
    id: payload.id,
    name: payload.title,
    slug: payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    category: CATEGORY_LABELS[payload.category] ?? payload.category,
    price: toRupiah(payload.price, payload.discountPercentage),
    description: payload.description,
    rating: payload.rating,
    stock: payload.stock,
    discountPercentage: payload.discountPercentage,
    tags: payload.tags,
    images,
    variants,
    addons,
    reviews,
    store: STORE_BY_CATEGORY[payload.category] ?? DEFAULT_STORE,
  };
}

/* ──────────────────────────── HTTP ──────────────────────────── */

/**
 * Custom Promise: `fetch` bawaan tidak punya timeout, jadi request dibungkus
 * `new Promise` dan di-`resolve` saat response tiba atau di-`reject` saat
 * melewati batas waktu.
 */
function fetchWithTimeout(
  url: string,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();

  return new Promise<Response>((resolve, reject) => {
    const timer = setTimeout(() => {
      controller.abort();
      reject(new Error(`Permintaan ke ${url} melebihi ${timeoutMs} ms.`));
    }, timeoutMs);

    fetch(url, { signal: controller.signal })
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/** Custom async function: ambil JSON dari endpoint API dan ubah ke tipe `T`. */
async function requestJson<T>(path: string): Promise<T> {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`External API menolak permintaan (HTTP ${response.status}).`);
  }
  return (await response.json()) as T;
}

/* ──────────────────────────── Fungsi publik ──────────────────────────── */

/**
 * Custom async function + pre-built async function (`fetch`, `Promise.all`)
 * untuk mengambil katalog produk dari External API.
 */
export async function fetchProductCatalog(): Promise<ProductRecord[]> {
  const responses = await Promise.all(
    PRODUCT_CATEGORIES.map((category) =>
      requestJson<ProductListApiResponse>(`/products/category/${category}`)
    )
  );

  return responses.flatMap((response) =>
    response.products.map(mapProductApiToRecord)
  );
}

/** Pre-built async + `.then()`: detail satu produk berdasarkan id. */
export function fetchProductById(id: string): Promise<ProductRecord | null> {
  const productId = Number.parseInt(id, 10);
  if (Number.isNaN(productId)) {
    return Promise.resolve(null);
  }

  return requestJson<ProductApiItem>(`/products/${productId}`).then((payload) =>
    mapProductApiToRecord(payload)
  );
}
