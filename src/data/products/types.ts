/**
 * Interface model produk yang dipakai layar (hasil mapping dari External API
 * pada `./api.ts`). Semua nominal sudah dalam Rupiah.
 */

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
  category: string;
  price: number;
  description: string;
  rating: number;
  stock: number;
  discountPercentage: number;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  addons: ProductAddon[];
  reviews: ProductReview[];
  store: ProductStore;
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
}
