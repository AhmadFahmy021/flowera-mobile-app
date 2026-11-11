import { ApiBaseUrl, resolveAssetUrl } from '@/constants/api';

/** Raw payload returned by `GET /api/user/home`. */
export interface ApiProductImage {
  id: number;
  image_url: string;
  isDefault: boolean;
}

export interface ApiStore {
  id: number;
  name: string;
  slug?: string;
  city?: string;
  logo?: string | null;
  address?: string;
  type?: string;
  rating?: string | number | null;
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  rating?: string | number | null;
  isLifeFlower?: boolean | number;
  image?: string | null;
  product_image?: ApiProductImage[] | null;
  store?: ApiStore | null;
}

export interface ApiProductCategory {
  id: number;
  title: string;
}

export interface ApiHomeResponse {
  productCategories?: ApiProductCategory[] | null;
  product?: ApiProduct[] | null;
  store?: ApiStore[] | null;
}

/** Raw payload returned by `GET /api/user/product/categories/:id`. */
export interface ApiCategoryProductResponse {
  status: string;
  data: ApiProduct[];
}

/** Object the home screen renders after the API payload is mapped. */
export interface HomeCategory {
  id: number;
  title: string;
}

export interface HomeStore {
  id: number;
  name: string;
  city: string;
  logoUrl: string | null;
  rating: number;
}

export interface HomeProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  rating: number;
  isLifeFlower: boolean;
  imageUrl: string | null;
  store: HomeStore | null;
}

export interface HomeData {
  categories: HomeCategory[];
  products: HomeProduct[];
  stores: HomeStore[];
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function mapStore(store: ApiStore): HomeStore {
  return {
    id: store.id,
    name: store.name,
    city: store.city?.trim() || 'Lokasi belum tersedia',
    logoUrl: resolveAssetUrl(store.logo),
    rating: toNumber(store.rating),
  };
}

export function mapProduct(product: ApiProduct): HomeProduct {
  const images = product.product_image ?? [];
  const primaryImage =
    images.find((image) => image.isDefault) ?? images[0] ?? null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description?.trim() || '',
    price: toNumber(product.price),
    rating: toNumber(product.rating),
    isLifeFlower: Boolean(product.isLifeFlower),
    imageUrl: resolveAssetUrl(primaryImage?.image_url ?? product.image),
    store: product.store ? mapStore(product.store) : null,
  };
}

export function mapHomeResponse(payload: ApiHomeResponse): HomeData {
  return {
    categories: (payload.productCategories ?? []).map((category) => ({
      id: category.id,
      title: category.title,
    })),
    products: (payload.product ?? []).map(mapProduct),
    stores: (payload.store ?? []).map(mapStore),
  };
}

async function requestJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${ApiBaseUrl}${path}`, {
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (cause) {
    if (signal?.aborted) throw cause;

    throw new Error('Tidak dapat terhubung ke server Flowera. Periksa koneksimu.');
  }

  if (!response.ok) {
    throw new Error(`Server menolak permintaan (HTTP ${response.status}).`);
  }

  return (await response.json()) as T;
}

/**
 * Fetches the beranda payload from the Flowera API and stores it in typed
 * objects. The external JSON never reaches the UI in its raw shape.
 */
export async function fetchHomeData(signal?: AbortSignal): Promise<HomeData> {
  const payload = await requestJson<ApiHomeResponse>('/user/home', signal);
  return mapHomeResponse(payload);
}

/**
 * Products for one category. The category endpoint omits the store relation,
 * so store and image data are borrowed from the already loaded home products.
 */
export async function fetchCategoryProducts(
  categoryId: number,
  knownProducts: HomeProduct[],
  signal?: AbortSignal
): Promise<HomeProduct[]> {
  const payload = await requestJson<ApiCategoryProductResponse>(
    `/user/product/categories/${categoryId}`,
    signal
  );
  const knownById = new Map(knownProducts.map((product) => [product.id, product]));

  return (payload.data ?? []).map((raw) => {
    const product = mapProduct(raw);
    const known = knownById.get(raw.id);

    return {
      ...product,
      imageUrl: product.imageUrl ?? known?.imageUrl ?? null,
      store: product.store ?? known?.store ?? null,
    };
  });
}
