import { ApiBaseUrl, resolveAssetUrl } from '@/constants/api';

import type {
  ProductAddon,
  ProductImage,
  ProductRecord,
  ProductStore,
  ProductVariant,
} from './types';

interface ApiImage {
  id: number;
  image_url: string;
  isDefault?: boolean;
}

interface ApiStore {
  id: number;
  name: string;
  city?: string | null;
}

interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  rating?: string | number | null;
  price: number;
  isLifeFlower?: boolean | number;
  product_image?: ApiImage[] | null;
  store?: ApiStore | null;
}

interface ApiVariant {
  id: number;
  title: string;
  subTitle?: string;
  price: number;
  product_image?: ApiImage[] | ApiImage | null;
}

interface ApiAddon {
  id: number;
  title: string;
  price: number;
}

interface ApiProductDetail {
  status: string;
  data: {
    product: ApiProduct;
    product_variant?: ApiVariant[] | null;
    addon_product?: ApiAddon[] | null;
    store?: ApiStore | null;
  };
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapImages(images: ApiImage[] | null | undefined): ProductImage[] {
  return (images ?? []).map((image) => ({
    id: image.id,
    imageUrl: resolveAssetUrl(image.image_url) ?? '',
    isDefault: Boolean(image.isDefault),
  }));
}

function getVariantImage(images: ApiVariant['product_image']): string | undefined {
  const image = Array.isArray(images) ? images[0] : images;
  return image?.image_url ? resolveAssetUrl(image.image_url) ?? undefined : undefined;
}

function mapProductDetail(response: ApiProductDetail): ProductRecord {
  const { product, product_variant = [], addon_product = [], store } = response.data;
  const apiStore = store ?? product.store;
  const mappedStore: ProductStore | null = apiStore
    ? {
        id: apiStore.id,
        name: apiStore.name,
        city: apiStore.city?.trim() || 'Lokasi belum tersedia',
      }
    : null;

  const variants: ProductVariant[] = (product_variant ?? []).map((variant) => ({
    id: variant.id,
    title: variant.title,
    subTitle: variant.subTitle,
    price: toNumber(variant.price),
    imageUrl: getVariantImage(variant.product_image),
  }));

  const addons: ProductAddon[] = (addon_product ?? []).map((addon) => ({
    id: addon.id,
    title: addon.title,
    price: toNumber(addon.price),
  }));

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: '',
    price: toNumber(product.price),
    description: product.description?.trim() || '',
    rating: toNumber(product.rating),
    stock: null,
    discountPercentage: 0,
    tags: [],
    images: mapImages(product.product_image),
    variants,
    addons,
    reviews: [],
    store: mappedStore,
  };
}

export async function fetchProductById(id: string): Promise<ProductRecord | null> {
  const productId = Number.parseInt(id, 10);
  if (!Number.isInteger(productId) || productId <= 0) return null;

  let response: Response;
  try {
    response = await fetch(`${ApiBaseUrl}/user/product/detail/${productId}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke server Flowera. Periksa koneksimu.');
  }

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Server Flowera menolak permintaan (HTTP ${response.status}).`);
  }

  const payload = (await response.json()) as ApiProductDetail;
  if (payload.status !== 'success' || !payload.data?.product) {
    throw new Error('Format data produk dari server Flowera tidak valid.');
  }

  return mapProductDetail(payload);
}
