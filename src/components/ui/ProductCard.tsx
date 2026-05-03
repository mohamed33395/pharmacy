'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { cn, formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ProductCardProps {
  product: {
    _id: string;
    name: { en: string; ar: string };
    slug: string;
    price: number;
    compareAtPrice?: number;
    thumbnail: string;
    brand: string;
    averageRating: number;
    reviewCount: number;
    stock: number;
    isPrescriptionRequired: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('common');
  const locale = useLocale();
  const addToCart = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  const inWishlist = isInWishlist(product._id);
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock <= 0) return;
    addToCart({
      productId: product._id,
      name: product.name.en,
      nameAr: product.name.ar,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      thumbnail: product.thumbnail,
      stock: product.stock,
    });
    toast.success(locale === 'ar' ? 'تمت الإضافة إلى السلة' : 'Added to cart');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleItem(product._id);
    toast.success(
      inWishlist
        ? locale === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from wishlist'
        : locale === 'ar' ? 'تمت الإضافة إلى المفضلة' : 'Added to wishlist'
    );
  };

  return (
    <Link href={`/products/${product._id}`} className="group">
      <div className="card-hover overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square bg-surface-100 dark:bg-surface-700 overflow-hidden">
          <Image
            src={product.thumbnail || '/placeholder.png'}
            alt={locale === 'ar' ? product.name.ar : product.name.en}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 start-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="badge bg-red-500 text-white">-{discount}%</span>
            )}
            {product.isPrescriptionRequired && (
              <span className="badge bg-amber-500 text-white text-[10px]">℞</span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-2 end-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleToggleWishlist}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shadow-md transition',
                inWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white dark:bg-surface-800 text-surface-600 hover:text-red-500'
              )}
            >
              <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Out of stock overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-surface-900 px-3 py-1 rounded-full text-sm font-medium">
                {t('outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-surface-500 mb-1">{product.brand}</p>
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary-600 transition">
            {locale === 'ar' ? product.name.ar : product.name.en}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-medium">{product.averageRating}</span>
              <span className="text-xs text-surface-400">({product.reviewCount})</span>
            </div>
          )}

          {/* Price + Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-primary-600">
                {formatPrice(product.price, locale)}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-surface-400 line-through ms-1">
                  {formatPrice(product.compareAtPrice, locale)}
                </span>
              )}
            </div>
            {product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition active:scale-90"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
