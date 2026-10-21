/**
 * Screen Home (`/home`) — beranda pembeli.
 *
 * Layout mengikuti versi web (`flowera-frontend/app/(buyer)/page.tsx`) pada
 * breakpoint mobile:
 * - Header sticky: logo Flowera + avatar akun.
 * - Hero carousel 4:3 dengan overlay gradien, tombol "Shop The Collection",
 *   dan indikator slide (autoplay 15 detik).
 * - "Belanja Sesuai Kebutuhan": chip kategori dari katalog.
 * - Tab "Trending Bouquets" / "Nearby Florists" dengan kartu ala web.
 * - Bottom navigation: Home / Orders / Profile.
 *
 * Alur: Login → Home → Detail Produk. Kartu produk membuka `/product/<id>`.
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Colors,
  Fonts,
  MarginMobile,
  Radius,
  ShadowSoft,
  StackLg,
  StackMd,
} from '@/constants/theme';
import {
  HERO_SLIDES,
  PRODUCT_CATALOG,
  type ProductRecord,
  type ProductStore,
} from '@/data/products/catalog';
import { formatRupiah } from '@/utils/format';

// Aset lokal dimuat lewat require supaya Metro membundelnya (tipografi aset Expo).
const logo = require('../../assets/images/flowera-logo.png');

/* ──────────────────────────── Types & constants ──────────────────────────── */

type ExploreTab = 'products' | 'florists';

type NavItem = {
  key: 'home' | 'orders' | 'profile';
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
};

/** Tinggi bottom navigation (tanpa safe-area), sama dengan versi web. */
const BOTTOM_NAV_HEIGHT = 71;
const HERO_INTERVAL_MS = 15000;

const NAV_ITEMS: NavItem[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'orders', icon: 'shopping-bag', label: 'Orders' },
  { key: 'profile', icon: 'person', label: 'Profile' },
];

/* ──────────────────────────── Screen ──────────────────────────── */

export default function HomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const scrollRef = useRef<ScrollView>(null);
  const catalogOffset = useRef<number>(0);
  // Nilai animasi stabil dari useState (ref tidak boleh dibaca saat render).
  const [translateX] = useState(() => new Animated.Value(0));

  // 1. KRITERIA: state dengan hook useState
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ExploreTab>('products');
  const [savedIds, setSavedIds] = useState<number[]>([]);

  const slideWidth = Math.max(windowWidth - MarginMobile * 2, 0);

  // 2. KRITERIA: hook useEffect — autoplay carousel tiap 15 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % HERO_SLIDES.length);
    }, HERO_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  // Animasi geser track carousel saat slide aktif berubah
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: -currentSlide * slideWidth,
      duration: 700,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [currentSlide, slideWidth, translateX]);

  const categories = useMemo<string[]>(
    () =>
      PRODUCT_CATALOG.reduce<string[]>(
        (list, product) =>
          list.includes(product.category) ? list : [...list, product.category],
        []
      ),
    []
  );

  const products = useMemo<ProductRecord[]>(
    () =>
      activeCategory === null
        ? PRODUCT_CATALOG
        : PRODUCT_CATALOG.filter((product) => product.category === activeCategory),
    [activeCategory]
  );

  const florists = useMemo<ProductStore[]>(
    () =>
      PRODUCT_CATALOG.reduce<ProductStore[]>(
        (list, product) =>
          list.some((store) => store.id === product.store.id)
            ? list
            : [...list, product.store],
        []
      ),
    []
  );

  /* ── Custom functions ── */

  const handleOpenProduct = (product: ProductRecord): void => {
    router.push(`/product/${product.id}`);
  };

  const handleToggleSaved = (productId: number): void => {
    setSavedIds((previous) =>
      previous.includes(productId)
        ? previous.filter((savedId) => savedId !== productId)
        : [...previous, productId]
    );
  };

  const handleShopCollection = (): void => {
    scrollRef.current?.scrollTo({ y: catalogOffset.current, animated: true });
  };

  const handleCustomBouquet = (): void => {
    Alert.alert('Custom Bouquet', 'Fitur custom bouquet belum tersedia di aplikasi.');
  };

  const handleOpenAccount = (): void => {
    Alert.alert('Akun', 'Halaman profil belum tersedia.');
  };

  const handleOpenOrders = (): void => {
    Alert.alert('Pesanan', 'Halaman pesanan belum tersedia.');
  };

  const handleNavPress = (key: NavItem['key']): void => {
    if (key === 'home') {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (key === 'orders') {
      handleOpenOrders();
      return;
    }
    handleOpenAccount();
  };

  /* ── Render ── */

  return (
    <View style={styles.screen}>
      {/* Header sticky */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
        <TouchableOpacity
          style={styles.avatar}
          onPress={handleOpenAccount}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Buka akun">
          <MaterialIcons name="person" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 0) + BOTTOM_NAV_HEIGHT + StackMd },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Hero carousel */}
        <View style={styles.hero}>
          <Animated.View
            style={[
              styles.heroTrack,
              {
                width: slideWidth * HERO_SLIDES.length,
                transform: [{ translateX }],
              },
            ]}>
            {HERO_SLIDES.map((slide) => (
              <View key={slide.id} style={[styles.heroSlide, { width: slideWidth }]}>
                <Image
                  source={{ uri: slide.imageUrl }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  transition={200}
                />
                <LinearGradient
                  colors={['rgba(32, 26, 27, 0.6)', 'rgba(32, 26, 27, 0)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.heroBody}>
                  <Text style={styles.heroTitle}>
                    {slide.title}
                    {'\n'}
                    <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                  </Text>
                  <Text style={styles.heroDescription}>{slide.description}</Text>
                  <TouchableOpacity
                    style={styles.heroButton}
                    onPress={handleShopCollection}
                    activeOpacity={0.85}>
                    <Text style={styles.heroButtonLabel}>Shop The Collection</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Indikator slide */}
          <View style={styles.heroDots}>
            {HERO_SLIDES.map((slide, index) => (
              <TouchableOpacity
                key={slide.id}
                onPress={() => setCurrentSlide(index)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Slide ${index + 1}`}
                style={[styles.heroDot, index === currentSlide ? styles.heroDotActive : null]}
              />
            ))}
          </View>
        </View>

        {/* Belanja sesuai kebutuhan */}
        <View
          style={styles.catalogBlock}
          onLayout={(event) => {
            catalogOffset.current = event.nativeEvent.layout.y;
          }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Belanja Sesuai Kebutuhan</Text>
            <TouchableOpacity onPress={() => setActiveCategory(null)} activeOpacity={0.7}>
              <Text style={styles.sectionLink}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}>
            <CategoryChip
              label="Semua"
              active={activeCategory === null}
              onPress={() => setActiveCategory(null)}
            />
            {categories.map((category) => (
              <CategoryChip
                key={category}
                label={category}
                active={activeCategory === category}
                onPress={() => setActiveCategory(category)}
              />
            ))}
            <TouchableOpacity
              style={[styles.chip, styles.chipCustom]}
              onPress={handleCustomBouquet}
              activeOpacity={0.85}>
              <MaterialIcons name="brush" size={16} color={Colors.onPrimary} />
              <Text style={styles.chipLabelActive}>Custom Bouquet</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Explore: produk & florist */}
        <View style={styles.explore}>
          <View style={styles.tabs}>
            <TabButton
              label="Trending Bouquets"
              active={activeTab === 'products'}
              onPress={() => setActiveTab('products')}
            />
            <TabButton
              label="Nearby Florists"
              active={activeTab === 'florists'}
              onPress={() => setActiveTab('florists')}
            />
          </View>

          {activeTab === 'products' ? (
            products.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={64} color={Colors.outline} />
                <Text style={styles.emptyTitle}>Belum ada produk di kategori ini</Text>
                <Text style={styles.emptyText}>
                  Coba pilih kategori lain atau lihat semua produk.
                </Text>
              </View>
            ) : (
              <View style={styles.productGrid}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSaved={savedIds.includes(product.id)}
                    onPress={() => handleOpenProduct(product)}
                    onToggleSaved={handleToggleSaved}
                  />
                ))}
              </View>
            )
          ) : (
            <View style={styles.floristList}>
              {florists.map((florist) => (
                <FloristCard
                  key={florist.id}
                  florist={florist}
                  onVisit={() => Alert.alert('Toko', `Halaman ${florist.name} belum tersedia.`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === 'home';
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive ? styles.navItemActive : null]}
              onPress={() => handleNavPress(item.key)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={item.label}>
              <MaterialIcons
                name={item.icon}
                size={24}
                color={isActive ? Colors.primary : Colors.onSurfaceVariant}
              />
              <Text style={[styles.navLabel, isActive ? styles.navLabelActive : null]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/* ──────────────────────────── Sub-components ──────────────────────────── */

function CategoryChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.chip, active ? styles.chipActive : null]}
      onPress={onPress}
      activeOpacity={0.85}>
      <Text style={[styles.chipLabel, active ? styles.chipLabelActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active ? styles.tabButtonActive : null]}
      onPress={onPress}
      activeOpacity={0.85}>
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ProductCard({
  product,
  isSaved,
  onPress,
  onToggleSaved,
}: {
  product: ProductRecord;
  isSaved: boolean;
  onPress: () => void;
  onToggleSaved: (productId: number) => void;
}): React.JSX.Element {
  const handleFavoritePress = (event: GestureResponderEvent): void => {
    event.stopPropagation();
    onToggleSaved(product.id);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardImageWrap}>
        <Image
          source={{ uri: product.images[0]?.imageUrl }}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Hapus dari favorit' : 'Simpan ke favorit'}>
          <MaterialIcons
            name={isSaved ? 'favorite' : 'favorite-border'}
            size={20}
            color={Colors.error}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {product.name}
        </Text>

        <View style={styles.cardFloristRow}>
          <MaterialIcons name="verified" size={16} color={Colors.secondary} />
          <Text style={styles.cardFlorist} numberOfLines={1}>
            {product.store.name}
          </Text>
        </View>

        <View style={styles.cardPriceRow}>
          <Text style={styles.cardPrice}>{formatRupiah(product.price)}</Text>
          <View style={styles.cardRating}>
            <MaterialIcons name="star" size={16} color={Colors.star} />
            <Text style={styles.cardRatingText}>{product.rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardLocation}>
            <MaterialIcons name="location-on" size={14} color={Colors.outline} />
            <Text style={styles.cardFooterText} numberOfLines={1}>
              {product.store.city}
            </Text>
          </View>
          <Text style={styles.cardFooterText}>{product.sold} terjual</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FloristCard({
  florist,
  onVisit,
}: {
  florist: ProductStore;
  onVisit: () => void;
}): React.JSX.Element {
  return (
    <View style={styles.floristCard}>
      <View style={styles.floristHeader}>
        <View style={styles.floristAvatar}>
          <MaterialIcons name="storefront" size={30} color={Colors.primary} />
        </View>
        <View style={styles.floristInfo}>
          <Text style={styles.floristName}>{florist.name}</Text>
          <Text style={styles.floristLocation}>
            {florist.city} • Dekat Anda away
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.floristButton} onPress={onVisit} activeOpacity={0.85}>
        <Text style={styles.floristButtonLabel}>Visit Shop</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ──────────────────────────── Styles ──────────────────────────── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* Header sticky */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: MarginMobile,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(215, 193, 197, 0.35)',
  },
  logo: {
    width: 199,
    height: 28,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },

  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: MarginMobile,
    paddingTop: StackMd,
    gap: StackLg,
  },

  /* Hero carousel */
  hero: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLow,
    ...ShadowSoft,
  },
  heroTrack: {
    flexDirection: 'row',
    height: '100%',
  },
  heroSlide: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: StackMd,
  },
  heroBody: {
    maxWidth: 300,
  },
  heroTitle: {
    marginBottom: 8,
    fontFamily: Fonts.headline,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.onPrimary,
  },
  heroSubtitle: {
    color: Colors.primaryFixed,
  },
  heroDescription: {
    marginBottom: 16,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onPrimary,
    opacity: 0.9,
  },
  heroButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
  },
  heroButtonLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.onPrimaryContainer,
  },
  heroDots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: StackMd,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  heroDotActive: {
    width: 32,
    backgroundColor: Colors.onPrimary,
  },

  /* Kategori */
  catalogBlock: {
    gap: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitle: {
    flexShrink: 1,
    fontFamily: Fonts.headlineMedium,
    fontSize: 20,
    color: Colors.onSurface,
  },
  sectionLink: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.primary,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(215, 193, 197, 0.5)',
    backgroundColor: Colors.surface,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  chipCustom: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  chipLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.onSurface,
  },
  chipLabelActive: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.onPrimary,
  },

  /* Tab & daftar */
  explore: {
    gap: StackMd,
  },
  tabs: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    padding: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(215, 193, 197, 0.35)',
    backgroundColor: Colors.surfaceContainerLow,
  },
  tabButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: Radius.sm,
  },
  tabButtonActive: {
    backgroundColor: Colors.surfaceContainerLowest,
    ...ShadowSoft,
  },
  tabLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  tabLabelActive: {
    color: Colors.primary,
  },

  /* Kartu produk */
  productGrid: {
    gap: StackMd,
  },
  card: {
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...ShadowSoft,
  },
  cardImageWrap: {
    aspectRatio: 1,
    backgroundColor: Colors.surfaceContainerLow,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  cardBody: {
    padding: 16,
  },
  cardName: {
    fontFamily: Fonts.headlineMedium,
    fontSize: 18,
    color: Colors.onSurface,
  },
  cardFloristRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  cardFlorist: {
    flexShrink: 1,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  cardPrice: {
    fontFamily: Fonts.bodyBold,
    fontSize: 18,
    color: Colors.primary,
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardRatingText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    color: Colors.onSurface,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(215, 193, 197, 0.3)',
  },
  cardLocation: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardFooterText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.outline,
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: StackMd,
    paddingVertical: StackLg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(215, 193, 197, 0.35)',
    backgroundColor: Colors.surfaceContainerLowest,
    ...ShadowSoft,
  },
  emptyTitle: {
    fontFamily: Fonts.headlineMedium,
    fontSize: 18,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  /* Kartu florist */
  floristList: {
    gap: StackMd,
  },
  floristCard: {
    padding: StackMd,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(215, 193, 197, 0.35)',
    backgroundColor: Colors.surfaceContainerLowest,
    ...ShadowSoft,
  },
  floristHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  floristAvatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  floristInfo: {
    flex: 1,
    gap: 2,
  },
  floristName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  floristLocation: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.outline,
  },
  floristButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  floristButtonLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.secondary,
  },

  /* Bottom navigation */
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
    shadowColor: '#1f4d2e',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  navItemActive: {
    backgroundColor: 'rgba(245, 163, 183, 0.2)',
  },
  navLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.onSurfaceVariant,
  },
  navLabelActive: {
    color: Colors.primary,
  },
});
