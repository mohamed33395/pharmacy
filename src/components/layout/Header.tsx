'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import {
  Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon,
  Globe, ChevronDown, LogOut, Package, LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = (session?.user as any)?.role === 'admin';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const switchLocale = () => {
    const next = locale === 'en' ? 'ar' : 'en';
    router.replace(pathname, { locale: next });
  };

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/products', label: t('products') },
    { href: '/categories', label: t('categories') },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-surface-200 dark:border-surface-700">
      {/* Top bar */}
      <div className="bg-primary-600 text-white text-xs py-1.5">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span>🚚 {locale === 'ar' ? 'شحن مجاني للطلبات فوق 200 ر.س' : 'Free shipping on orders above 200 SAR'}</span>
          <div className="flex items-center gap-3">
            <button onClick={switchLocale} className="flex items-center gap-1 hover:opacity-80 transition">
              <Globe className="w-3 h-3" />
              {locale === 'en' ? t('arabic') : t('english')}
            </button>
            <button onClick={toggleTheme} className="hover:opacity-80 transition">
              {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent hidden sm:block">
              {t('appName')}
            </span>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/wishlist"
              className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 w-5 h-5 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition"
                >
                  <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <ChevronDown className="w-3 h-3 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute end-0 top-full mt-2 w-56 card p-2 z-50 animate-fade-in">
                      <div className="px-3 py-2 border-b border-surface-200 dark:border-surface-700 mb-1">
                        <p className="font-medium text-sm">{session.user?.name}</p>
                        <p className="text-xs text-surface-500">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-sm transition"
                      >
                        <User className="w-4 h-4" /> {t('profile')}
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-sm transition"
                      >
                        <Package className="w-4 h-4" /> {t('orders')}
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-sm transition"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin
                        </Link>
                      )}
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm transition"
                      >
                        <LogOut className="w-4 h-4" /> {t('logout')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="btn-primary text-sm !px-4 !py-2"
              >
                {t('login')}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 pb-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition',
                pathname === link.href
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                  : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 animate-slide-up">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
