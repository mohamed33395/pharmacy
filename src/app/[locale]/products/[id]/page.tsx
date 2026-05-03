'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { formatPrice, cn } from '@/lib/utils';
import {
  Heart, ShoppingCart, Star, Minus, Plus, ChevronLeft,
  ShieldCheck, Truck, RotateCcw, Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReviewSection from '@/components/product/ReviewSection';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations('products');
  const tc = useTranslations('common');
  const locale = useLocale();
  const addToCart = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.product))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-surface-200 dark:bg-surface-700 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/4" />
            <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-3/4" />
            <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded w-1/3" />
            <div className="h-20 bg-surface-200 dark:bg-surface-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-surface-500 text-lg">Product not found</p>
        <Link href="/products" className="btn-primary mt-4 inline-block">{tc('back')}</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const images = product.images?.length > 0 ? product.images : [product.thumbnail];
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        productId: product._id,
        name: product.name.en,
        nameAr: product.name.ar,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        thumbnail: product.thumbnail,
        stock: product.stock,
      });
    }
    toast.success(locale === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart');
  };

  const tabs = [
    { key: 'description', label: t('description') },
    { key: 'ingredients', label: t('ingredients') },
    { key: 'dosage', label: t('dosage') },
    { key: 'reviews', label: `${t('reviews')} (${product.reviewCount})` },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-surface-500 hover:text-primary-600 mb-6 transition">
        <ChevronLeft className="w-4 h-4" /> {tc('back')}
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-surface-100 dark:bg-surface-800 rounded-2xl overflow-hidden mb-4">
            <Image
              src={images[selectedImage] || '/placeholder.png'}
              alt={locale === 'ar' ? product.name.ar : product.name.en}
              fill
              className="object-contain p-4"
              priority
            />
            {discount > 0 && (
              <span className="absolute top-4 start-4 badge bg-red-500 text-white text-sm px-3 py-1">
                -{discount}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition',
                    selectedImage === i ? 'border-primary-600' : 'border-transparent'
                  )}
                >
                  <Image src={img} alt="" width={80} height={80} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm text-primary-600 font-medium mb-1">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            {locale === 'ar' ? product.name.ar : product.name.en}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn('w-4 h-4', i < Math.round(product.averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-surface-300'
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-surface-500">
              {product.averageRating} ({product.reviewCount} {t('reviews').toLowerCase()})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-primary-600">
              {formatPrice(product.price, locale)}
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-surface-400 line-through">
                {formatPrice(product.compareAtPrice, locale)}
              </span>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-surface-600 dark:text-surface-400 mb-6 leading-relaxed">
              {locale === 'ar' ? product.shortDescription.ar : product.shortDescription.en}
            </p>
          )}

          {/* Stock */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-1 text-sm text-accent-600 font-medium">
                <Package className="w-4 h-4" /> {tc('inStock')} ({product.stock})
              </span>
            ) : (
              <span className="text-sm text-red-500 font-medium">{tc('outOfStock')}</span>
            )}
          </div>

          {/* Prescription Warning */}
          {product.isPrescriptionRequired && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-6">
              <p className="text-amber-700 dark:text-amber-400 text-sm font-medium">
                ℞ {t('prescription')}
              </p>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center border border-surface-300 dark:border-surface-600 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-s-xl transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2.5 min-w-[50px] text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-e-xl transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> {tc('addToCart')}
              </button>
              <button
                onClick={() => {
                  toggleItem(product._id);
                  toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
                }}
                className={cn(
                  'w-12 h-12 rounded-xl border-2 flex items-center justify-center transition shrink-0',
                  inWishlist
                    ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-surface-300 dark:border-surface-600 hover:border-red-500 hover:text-red-500'
                )}
              >
                <Heart className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-surface-200 dark:border-surface-700">
            {[
              { icon: Truck, label: locale === 'ar' ? 'توصيل سريع' : 'Fast Delivery' },
              { icon: ShieldCheck, label: locale === 'ar' ? 'منتج أصلي' : 'Genuine Product' },
              { icon: RotateCcw, label: locale === 'ar' ? 'إرجاع سهل' : 'Easy Returns' },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center text-center text-xs text-surface-500">
                <badge.icon className="w-5 h-5 mb-1 text-primary-600" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex gap-1 border-b border-surface-200 dark:border-surface-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-surface-500 hover:text-surface-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="leading-relaxed text-surface-600 dark:text-surface-400">
                {locale === 'ar' ? product.description.ar : product.description.en}
              </p>
            </div>
          )}
          {activeTab === 'ingredients' && (
            <p className="text-surface-600 dark:text-surface-400">
              {product.ingredients || (locale === 'ar' ? 'لا توجد معلومات' : 'No information available')}
            </p>
          )}
          {activeTab === 'dosage' && (
            <p className="text-surface-600 dark:text-surface-400">
              {product.dosage || (locale === 'ar' ? 'لا توجد معلومات' : 'No information available')}
            </p>
          )}
          {activeTab === 'reviews' && (
            <ReviewSection productId={product._id} />
          )}
        </div>
      </div>
    </div>
  );
}
