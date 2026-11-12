import { useCallback, useEffect, useState } from 'react';

import {
  fetchCategoryProducts,
  fetchHomeData,
  type HomeData,
  type HomeProduct,
} from './api';

type HomeDataResult = {
  data: HomeData | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

type HomeState = {
  data: HomeData | null;
  isLoading: boolean;
  error: string | null;
};

export function useHomeData(): HomeDataResult {
  const [state, setState] = useState<HomeState>({
    data: null,
    isLoading: true,
    error: null,
  });
  const [reloadToken, setReloadToken] = useState<number>(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchHomeData(controller.signal)
      .then((result) => {
        if (active) setState({ data: result, isLoading: false, error: null });
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) return;
        setState({
          data: null,
          isLoading: false,
          error:
            cause instanceof Error
              ? cause.message
              : 'Gagal memuat data beranda. Periksa koneksi ke server.',
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [reloadToken]);

  const reload = useCallback((): void => {
    setState((previous) => ({ ...previous, isLoading: true, error: null }));
    setReloadToken((token) => token + 1);
  }, []);

  return { data: state.data, isLoading: state.isLoading, error: state.error, reload };
}

type CategoryProductsResult = {
  products: HomeProduct[] | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

type CategorySnapshot = {
  categoryId: number;
  products: HomeProduct[];
  error: string | null;
};

export function useCategoryProducts(
  categoryId: number | null,
  knownProducts: HomeProduct[],
): CategoryProductsResult {
  const [snapshot, setSnapshot] = useState<CategorySnapshot | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  useEffect(() => {
    if (categoryId === null) return;

    const controller = new AbortController();
    let active = true;

    fetchCategoryProducts(categoryId, knownProducts, controller.signal)
      .then((result) => {
        if (active) {
          setSnapshot({ categoryId, products: result, error: null });
        }
      })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) return;
        setSnapshot({
          categoryId,
          products: [],
          error:
            cause instanceof Error
              ? cause.message
              : 'Gagal memuat produk kategori. Coba lagi.',
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [categoryId, knownProducts, reloadToken]);

  const reload = useCallback((): void => {
    setSnapshot(null);
    setReloadToken((token) => token + 1);
  }, []);

  const matchesCategory = snapshot !== null && snapshot.categoryId === categoryId;

  return {
    products: matchesCategory ? snapshot.products : null,
    isLoading: categoryId !== null && !matchesCategory,
    error: matchesCategory ? snapshot.error : null,
    reload,
  };
}
