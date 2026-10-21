/**
 * Screen Detail Produk (`/product/[id]`) — layout ala marketplace.
 *
 * Susunan layar: gambar besar dengan overlay rating toko + nama + highlight,
 * strip variasi, blok harga (voucher, terjual, favorit), cicilan, pengiriman,
 * jaminan, add-on, deskripsi, ulasan, dan action bar tetap di bawah
 * (Chat / Keranjang / Beli Sekarang).
 *
 * Pemuatan data memakai `useState` + `useEffect` (kriteria praktikum):
 * - state  : product, loading, failed, selectedVariant, selectedAddons, galeri
 * - effect : memuat produk setiap `id` berubah / tombol "Coba Lagi" ditekan,
 *            dengan cleanup flag supaya tidak setState setelah layar dilepas.
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Colors,
  Fonts,
  MarginMobile,
  Radius,
  ShadowFloat,
  ShadowSoft,
  StackMd,
} from '@/constants/theme';
import {
  fetchProductById,
  type ProductAddon,
  type ProductRecord,
} from '@/data/products/catalog';
import { formatRupiah } from '@/utils/format';

/* ──────────────────────────── Types & helpers ──────────────────────────── */

/** Satu entri strip gambar: gambar produk atau gambar varian. */
type GalleryItem = {
  key: string;
  imageUrl: string;
  label: string;
  variantId: number | null;
};

/** Perkiraan tiba: besok s/d lusa, format "23 - 24 Okt". */
function formatDeliveryEta(): string {
  const formatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date();
  end.setDate(end.getDate() + 2);
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

/* ──────────────────────────── Screen ──────────────────────────── */

export default function ProductDetailScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // 1. KRITERIA: deklarasi state dengan hook useState
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [failed, setFailed] = useState<boolean>(false);
  const [reloadToken, setReloadToken] = useState<number>(0);
  const [selectedImageKey, setSelectedImageKey] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [reviewQuery, setReviewQuery] = useState<string>('');
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);

  // 2. KRITERIA: hook useEffect — memuat produk setiap `id` berubah / retry
  useEffect(() => {
    let active = true;

    const load = async (): Promise<void> => {
      setLoading(true);
      setFailed(false);

      try {
        const found = await fetchProductById(id ?? '');
        if (!active) return;

        const initialVariant = found?.variants[0] ?? null;
        setProduct(found);
        setSelectedAddons([]);
        setIsSaved(false);
        setReviewQuery('');
        setShowAllReviews(false);
        // Varian pertama langsung menampilkan gambarnya di galeri.
        setSelectedImageKey(initialVariant ? `variant-${initialVariant.id}` : '');
      } catch {
        if (!active) return;
        setProduct(null);
        setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    // Cleanup: cegah setState setelah layar ditinggalkan / id berganti
    return () => {
      active = false;
    };
  }, [id, reloadToken]);

  /**
   * Strip gambar: semua gambar produk (default lebih dulu), lalu satu entri
   * per varian. `useMemo` menghindari pembuatan ulang array pada render biasa.
   */
  const galleryItems = useMemo<GalleryItem[]>(() => {
    if (!product) return [];

    const items: GalleryItem[] = [...product.images]
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.id - b.id)
      .map((image) => ({
        key: `product-${image.id}`,
        imageUrl: image.imageUrl,
        label: product.name,
        variantId: null,
      }));

    product.variants.forEach((variant) => {
      items.push({
        key: `variant-${variant.id}`,
        imageUrl: variant.imageUrl ?? '',
        label: variant.title,
        variantId: variant.id,
      });
    });

    return items;
  }, [product]);

  const selectedItem =
    galleryItems.find((item) => item.key === selectedImageKey) ?? galleryItems[0] ?? null;
  const galleryIndex = selectedItem
    ? galleryItems.findIndex((item) => item.key === selectedItem.key)
    : 0;

  /** Varian terpilih diturunkan dari entri galeri yang aktif. */
  const selectedVariant = useMemo(
    () =>
      selectedItem?.variantId == null
        ? null
        : product?.variants.find((variant) => variant.id === selectedItem.variantId) ?? null,
    [selectedItem, product]
  );

  // Ulasan terfilter dari kolom pencarian ulasan
  const filteredReviews = useMemo(() => {
    const reviews = product?.reviews ?? [];
    const keyword = reviewQuery.trim().toLowerCase();
    if (!keyword) return reviews;
    return reviews.filter((review) =>
      `${review.author} ${review.comment}`.toLowerCase().includes(keyword)
    );
  }, [product, reviewQuery]);

  const visibleReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 2);

  const variantPrice = selectedVariant?.price ?? product?.price ?? 0;
  const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = variantPrice + addonsTotal;
  const deliveryEta = formatDeliveryEta();

  /* ── Custom functions ── */

  /** Memilih gambar strip; bila gambar milik varian, varian ikut terpilih. */
  const handleSelectGalleryItem = (item: GalleryItem): void => {
    setSelectedImageKey(item.key);
  };

  /** Menambah / melepas satu add-on dari pesanan. */
  const handleToggleAddon = (addon: ProductAddon): void => {
    setSelectedAddons((previous) =>
      previous.some((entry) => entry.id === addon.id)
        ? previous.filter((entry) => entry.id !== addon.id)
        : [...previous, addon]
    );
  };

  const handleRetry = (): void => setReloadToken((token) => token + 1);

  const handleBack = (): void => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  };

  const handleOpenChat = (): void => {
    Alert.alert('Chat', `Mulai chat dengan ${product?.store.name ?? 'penjual'}.`);
  };

  const handleAddToCart = (): void => {
    Alert.alert('Keranjang', 'Fitur keranjang sedang dalam pengembangan.');
  };

  const handleOrderNow = (): void => {
    if (!product) return;
    const summary = [
      product.name,
      `Varian: ${selectedVariant?.title ?? 'Harga dasar'}`,
      selectedAddons.length > 0
        ? `Add-on: ${selectedAddons.map((addon) => addon.title).join(', ')}`
        : null,
      `Total: ${formatRupiah(totalPrice)}`,
    ]
      .filter((line): line is string => line !== null)
      .join('\n');

    Alert.alert('Beli Sekarang', `${summary}\n\nHalaman checkout menyusul.`);
  };

  const handleMore = (): void => {
    Alert.alert('Opsi Produk', 'Bagikan produk, laporkan, atau simpan ke favorit.');
  };

  /* ── Render ── */

  const renderContent = (): React.JSX.Element => {
    if (loading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.stateText}>Memuat produk...</Text>
        </View>
      );
    }

    if (failed) {
      return (
        <View style={styles.centerState}>
          <View style={styles.stateIcon}>
            <MaterialIcons name="error-outline" size={36} color={Colors.error} />
          </View>
          <Text style={styles.stateTitle}>Gagal Memuat Produk</Text>
          <Text style={styles.stateText}>
            Terjadi kesalahan saat memuat data. Silakan coba lagi.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.85}>
            <Text style={styles.retryLabel}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!product) {
      return (
        <View style={styles.centerState}>
          <View style={styles.stateIcon}>
            <MaterialIcons name="search-off" size={36} color={Colors.outline} />
          </View>
          <Text style={styles.stateTitle}>Produk Tidak Ditemukan</Text>
          <Text style={styles.stateText}>
            Produk yang kamu cari tidak tersedia atau telah dihapus.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleBack} activeOpacity={0.85}>
            <Text style={styles.retryLabel}>Kembali</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 + insets.bottom + 88 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Gambar utama + overlay */}
          <View style={styles.hero}>
            {selectedItem?.imageUrl ? (
              <Image
                source={{ uri: selectedItem.imageUrl }}
                style={styles.heroImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.heroPlaceholder}>
                <MaterialIcons name="inventory-2" size={48} color={Colors.outline} />
              </View>
            )}

            {/* App bar transparan di atas gambar */}
            <View style={[styles.heroHeader, { top: Math.max(insets.top, 10) }]}>
              <TouchableOpacity
                style={styles.heroIconButton}
                onPress={handleBack}
                activeOpacity={0.8}>
                <MaterialIcons name="arrow-back" size={20} color={Colors.onSurface} />
              </TouchableOpacity>

              <View style={styles.heroBrandPill}>
                <Text style={styles.heroBrand}>Flowera</Text>
                {product.isLifeFlower ? (
                  <View style={styles.lifeBadge}>
                    <MaterialIcons name="eco" size={11} color={Colors.tertiary} />
                    <Text style={styles.lifeBadgeText}>Life Flower</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.heroHeaderRight}>
                <TouchableOpacity
                  style={styles.heroIconButton}
                  onPress={handleOpenChat}
                  activeOpacity={0.8}>
                  <MaterialIcons name="shopping-cart" size={19} color={Colors.onSurface} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.heroIconButton}
                  onPress={handleMore}
                  activeOpacity={0.8}>
                  <MaterialIcons name="more-horiz" size={20} color={Colors.onSurface} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Counter gambar */}
            <View style={[styles.imageCounter, { top: Math.max(insets.top, 10) + 52 }]}>
              <Text style={styles.imageCounterText}>
                {galleryIndex + 1}/{galleryItems.length}
              </Text>
            </View>

            {/* Kartu overlay: rating toko, nama, highlight */}
            <View style={styles.heroCard}>
              <View style={styles.storeRatingRow}>
                <MaterialIcons name="star" size={13} color={Colors.star} />
                <Text style={styles.storeRatingValue}>{product.storeRating.toFixed(1)}</Text>
                <Text style={styles.storeRatingText}>
                  penilaian toko dari {product.storeReviewers} pembeli
                </Text>
              </View>
              <Text style={styles.heroName}>{product.name}</Text>
              <Text style={styles.heroHighlights} numberOfLines={2}>
                {product.highlights.join('  |  ')}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            {/* Variasi / gambar */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  {product.variants.length} Variasi Tersedia
                </Text>
                <Text style={styles.sectionHint}>{galleryItems.length} foto</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbsRow}>
                {galleryItems.map((item) => {
                  const isActive = item.key === selectedItem?.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.thumbCard, isActive ? styles.thumbCardActive : null]}
                      onPress={() => handleSelectGalleryItem(item)}
                      activeOpacity={0.85}>
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={styles.thumbImage}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={styles.thumbPlaceholder}>
                          <MaterialIcons name="inventory-2" size={18} color={Colors.outline} />
                        </View>
                      )}
                      <Text
                        style={[styles.thumbLabel, isActive ? styles.thumbLabelActive : null]}
                        numberOfLines={1}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Harga */}
            <View style={styles.priceRow}>
              <View style={styles.priceMain}>
                <Text style={styles.price}>{formatRupiah(variantPrice)}</Text>
                {product.voucherLabel ? (
                  <View style={styles.voucherRow}>
                    <MaterialIcons name="local-offer" size={12} color={Colors.tertiary} />
                    <Text style={styles.voucherText}>{product.voucherLabel}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.priceMeta}>
                <Text style={styles.soldText}>{product.sold} Terjual</Text>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => setIsSaved((saved) => !saved)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Simpan ke favorit"
                  accessibilityState={{ selected: isSaved }}>
                  <MaterialIcons
                    name={isSaved ? 'favorite' : 'favorite-border'}
                    size={20}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Cicilan */}
            <TouchableOpacity
              style={styles.installmentRow}
              onPress={() =>
                Alert.alert(
                  'Cicilan',
                  `Cicilan 0% selama 3 bulan: ${formatRupiah(Math.round(variantPrice / 3))} per bulan.`
                )
              }
              activeOpacity={0.8}>
              <MaterialIcons name="credit-card" size={16} color={Colors.primary} />
              <Text style={styles.installmentText}>
                Cicilan 0% · 3x {formatRupiah(Math.round(variantPrice / 3))}
              </Text>
              <MaterialIcons name="chevron-right" size={16} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>

            {/* Pengiriman */}
            <View style={styles.infoCard}>
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() =>
                  Alert.alert('Pengiriman', `Estimasi tiba ${deliveryEta}. Gratis ongkir se-Indonesia.`)
                }
                activeOpacity={0.8}>
                <MaterialIcons name="local-shipping" size={20} color={Colors.secondary} />
                <View style={styles.infoBody}>
                  <Text style={styles.infoTitle}>{deliveryEta}</Text>
                  <View style={styles.infoInline}>
                    <Text style={styles.infoStrong}>Gratis Ongkir</Text>
                    <View style={styles.vipBadge}>
                      <Text style={styles.vipBadgeText}>VIP</Text>
                    </View>
                  </View>
                  <Text style={styles.infoHint}>
                    Dapatkan voucher s/d Rp10.000 jika pesanan terlambat.
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Jaminan */}
            <View style={styles.infoCard}>
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => Alert.alert('Jaminan', 'Bebas pengembalian bila bunga tidak segar.')}
                activeOpacity={0.8}>
                <MaterialIcons name="verified-user" size={20} color={Colors.secondary} />
                <View style={styles.infoBody}>
                  <Text style={styles.infoStrong}>Bebas Pengembalian</Text>
                  <Text style={styles.infoHint}>Garansi kesegaran 3 hari setelah diterima.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
              <View style={styles.infoDivider} />
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => Alert.alert('Pembayaran', 'Transaksi terproteksi Flowera.')}
                activeOpacity={0.8}>
                <MaterialIcons name="account-balance-wallet" size={20} color={Colors.secondary} />
                <View style={styles.infoBody}>
                  <Text style={styles.infoStrong}>Pembayaran Aman</Text>
                  <Text style={styles.infoHint}>Dana diteruskan ke toko setelah pesanan tiba.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Add-on */}
            {product.addons.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Tambahan (Opsional)</Text>
                  <Text style={styles.sectionHint}>
                    {selectedAddons.length > 0
                      ? `+ ${formatRupiah(addonsTotal)}`
                      : 'Belum dipilih'}
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.addonRow}>
                  {product.addons.map((addon) => {
                    const isSelected = selectedAddons.some((entry) => entry.id === addon.id);
                    return (
                      <TouchableOpacity
                        key={addon.id}
                        style={[styles.addonChip, isSelected ? styles.addonChipActive : null]}
                        onPress={() => handleToggleAddon(addon)}
                        activeOpacity={0.85}>
                        <MaterialIcons
                          name={isSelected ? 'check-circle' : 'add-circle-outline'}
                          size={16}
                          color={isSelected ? Colors.secondary : Colors.outline}
                        />
                        <View>
                          <Text style={styles.addonTitle}>{addon.title}</Text>
                          <Text style={styles.addonPrice}>+ {formatRupiah(addon.price)}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : null}

            {/* Rincian harga bila ada add-on */}
            {selectedAddons.length > 0 ? (
              <View style={styles.breakdown}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{selectedVariant?.title ?? 'Harga dasar'}</Text>
                  <Text style={styles.breakdownValue}>{formatRupiah(variantPrice)}</Text>
                </View>
                {selectedAddons.map((addon) => (
                  <View key={addon.id} style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel} numberOfLines={1}>
                      {addon.title}
                    </Text>
                    <Text style={styles.breakdownValue}>+ {formatRupiah(addon.price)}</Text>
                  </View>
                ))}
                <View style={styles.infoDivider} />
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownTotalLabel}>Total</Text>
                  <Text style={styles.breakdownTotalValue}>{formatRupiah(totalPrice)}</Text>
                </View>
              </View>
            ) : null}

            {/* Deskripsi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tentang Produk</Text>
              <Text style={styles.description}>{product.description}</Text>
              <View style={styles.storeRow}>
                <View style={styles.storeAvatar}>
                  <MaterialIcons name="storefront" size={18} color={Colors.primary} />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{product.store.name}</Text>
                  <Text style={styles.storeCity}>{product.store.city}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={18} color={Colors.onSurfaceVariant} />
              </View>
            </View>

            {/* Ulasan */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.reviewTitleRow}>
                  <MaterialIcons name="star" size={15} color={Colors.star} />
                  <Text style={styles.sectionTitle}>
                    Penilaian Produk ({product.reviews.length})
                  </Text>
                </View>
                {product.reviews.length > 2 ? (
                  <TouchableOpacity
                    onPress={() => setShowAllReviews((shown) => !shown)}
                    activeOpacity={0.7}>
                    <Text style={styles.sectionLink}>
                      {showAllReviews ? 'Ringkas' : 'Lihat Semua'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.reviewSearch}>
                <MaterialIcons name="search" size={16} color={Colors.onSurfaceVariant} />
                <TextInput
                  style={styles.reviewSearchInput}
                  value={reviewQuery}
                  onChangeText={setReviewQuery}
                  placeholder="Cari ulasan"
                  placeholderTextColor={Colors.outline}
                  returnKeyType="search"
                />
              </View>

              {visibleReviews.length === 0 ? (
                <Text style={styles.reviewEmpty}>Belum ada ulasan yang cocok.</Text>
              ) : (
                visibleReviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{review.author.charAt(0)}</Text>
                      </View>
                      <View style={styles.reviewMeta}>
                        <Text style={styles.reviewAuthor}>{review.author}</Text>
                        <StarRating rating={review.rating} size={12} />
                      </View>
                      <Text style={styles.reviewDate}>{review.date}</Text>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>

        {/* Action bar tetap di bawah */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TouchableOpacity style={styles.bottomIcon} onPress={handleOpenChat} activeOpacity={0.8}>
            <MaterialIcons name="chat-bubble-outline" size={22} color={Colors.onSurface} />
            <Text style={styles.bottomIconLabel}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomCart} onPress={handleAddToCart} activeOpacity={0.85}>
            <MaterialIcons name="add-shopping-cart" size={22} color={Colors.onPrimary} />
            <Text style={styles.bottomCartLabel}>Keranjang</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bottomBuy} onPress={handleOrderNow} activeOpacity={0.9}>
            <Text style={styles.bottomBuyLabel}>Beli Sekarang</Text>
            <Text style={styles.bottomBuyPrice}>{formatRupiah(totalPrice)}</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return <View style={styles.screen}>{renderContent()}</View>;
}

/* ──────────────────────────── Sub-components ──────────────────────────── */

/** Bintang rating 0–5, warna emas untuk bintang terisi. */
function StarRating({ rating, size = 16 }: { rating: number; size?: number }): React.JSX.Element {
  const filled = Math.round(rating);
  return (
    <View style={styles.stars}>
      {[0, 1, 2, 3, 4].map((index) => (
        <MaterialIcons
          key={index}
          name="star"
          size={size}
          color={index < filled ? Colors.star : Colors.outlineVariant}
        />
      ))}
    </View>
  );
}

/* ──────────────────────────── Styles ──────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* State layar: loading / error / not found */
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: StackMd,
  },
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateTitle: {
    fontFamily: Fonts.headlineMedium,
    fontSize: 20,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  stateText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    ...ShadowSoft,
  },
  retryLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.onPrimary,
  },

  /* Gambar utama */
  hero: {
    width: '100%',
    aspectRatio: 0.86,
    backgroundColor: Colors.surfaceContainerLow,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroHeader: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroHeaderRight: {
    flexDirection: 'row',
    gap: 6,
  },
  heroIconButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 248, 247, 0.92)',
    ...ShadowSoft,
  },
  heroBrandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 248, 247, 0.92)',
  },
  heroBrand: {
    fontFamily: Fonts.headline,
    fontSize: 13,
    letterSpacing: 1,
    color: Colors.primary,
  },
  lifeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(220, 182, 62, 0.24)',
  },
  lifeBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 9,
    color: Colors.tertiary,
  },
  imageCounter: {
    position: 'absolute',
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(28, 27, 25, 0.55)',
  },
  imageCounterText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 11,
    color: Colors.onPrimary,
  },
  heroCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    gap: 4,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 248, 247, 0.94)',
  },
  storeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeRatingValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.onSurface,
  },
  storeRatingText: {
    flexShrink: 1,
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  heroName: {
    fontFamily: Fonts.headlineMedium,
    fontSize: 18,
    lineHeight: 23,
    color: Colors.onSurface,
  },
  heroHighlights: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
  },

  /* Konten */
  content: {
    paddingHorizontal: MarginMobile,
    paddingTop: StackMd,
    gap: StackMd,
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  sectionHint: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  sectionLink: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.primary,
  },

  /* Strip variasi */
  thumbsRow: {
    gap: 8,
    paddingBottom: 2,
  },
  thumbCard: {
    width: 82,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  thumbCardActive: {
    borderColor: Colors.primary,
  },
  thumbImage: {
    width: '100%',
    height: 70,
  },
  thumbPlaceholder: {
    width: '100%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainer,
  },
  thumbLabel: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontFamily: Fonts.bodyMedium,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  thumbLabelActive: {
    color: Colors.primary,
  },

  /* Harga */
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  priceMain: {
    gap: 4,
  },
  price: {
    fontFamily: Fonts.bodyBold,
    fontSize: 26,
    color: Colors.primary,
  },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voucherText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 11,
    color: Colors.tertiary,
  },
  priceMeta: {
    alignItems: 'flex-end',
    gap: 6,
  },
  soldText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  favoriteButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },

  /* Cicilan */
  installmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLow,
  },
  installmentText: {
    flex: 1,
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    color: Colors.onSurface,
  },

  /* Kartu info (pengiriman & jaminan) */
  infoCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 12,
    ...ShadowSoft,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  infoBody: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  infoStrong: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  infoInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoHint: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.onSurfaceVariant,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  vipBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    backgroundColor: Colors.error,
  },
  vipBadgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 9,
    color: Colors.onPrimary,
  },

  /* Add-on */
  addonRow: {
    gap: 8,
    paddingBottom: 2,
  },
  addonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  addonChipActive: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(58, 104, 71, 0.08)',
  },
  addonTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.onSurface,
  },
  addonPrice: {
    fontFamily: Fonts.bodyBold,
    fontSize: 11,
    color: Colors.secondary,
  },

  /* Rincian */
  breakdown: {
    padding: 14,
    gap: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  breakdownLabel: {
    flexShrink: 1,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  breakdownValue: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    color: Colors.onSurface,
  },
  breakdownTotalLabel: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  breakdownTotalValue: {
    fontFamily: Fonts.bodyBold,
    fontSize: 16,
    color: Colors.primary,
  },

  /* Deskripsi & toko */
  description: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 21,
    color: Colors.onSurfaceVariant,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  storeAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryFixed,
  },
  storeInfo: {
    flex: 1,
    gap: 1,
  },
  storeName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.onSurface,
  },
  storeCity: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },

  /* Ulasan */
  reviewTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  reviewSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLow,
  },
  reviewSearchInput: {
    flex: 1,
    padding: 0,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.onSurface,
  },
  reviewEmpty: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  reviewCard: {
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewAvatar: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryFixed,
  },
  reviewAvatarText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.primary,
  },
  reviewMeta: {
    flex: 1,
    gap: 2,
  },
  reviewAuthor: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.onSurface,
  },
  reviewDate: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.outline,
  },
  reviewComment: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },

  /* Action bar */
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
    ...ShadowFloat,
  },
  bottomIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bottomIconLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 10,
    color: Colors.onSurface,
  },
  bottomCart: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.secondary,
  },
  bottomCartLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 10,
    color: Colors.onPrimary,
  },
  bottomBuy: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
  },
  bottomBuyLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.4,
    color: Colors.onPrimary,
  },
  bottomBuyPrice: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: Colors.onPrimary,
  },
});
