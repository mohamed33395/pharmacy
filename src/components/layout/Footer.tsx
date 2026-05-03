'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const tc = useTranslations('common');

  return (
    <footer className="bg-surface-900 dark:bg-surface-950 text-surface-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">{tc('appName')}</span>
            </div>
            <p className="text-sm leading-relaxed text-surface-400">{t('aboutText')}</p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-surface-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm hover:text-primary-400 transition">{tc('home')}</Link></li>
              <li><Link href="/products" className="text-sm hover:text-primary-400 transition">{tc('products')}</Link></li>
              <li><Link href="/categories" className="text-sm hover:text-primary-400 transition">{tc('categories')}</Link></li>
              <li><Link href="/cart" className="text-sm hover:text-primary-400 transition">{tc('cart')}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('customerService')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-primary-400 transition">{t('contactUs')}</a></li>
              <li><a href="#" className="text-sm hover:text-primary-400 transition">{t('faq')}</a></li>
              <li><a href="#" className="text-sm hover:text-primary-400 transition">{t('shippingPolicy')}</a></li>
              <li><a href="#" className="text-sm hover:text-primary-400 transition">{t('returnPolicy')}</a></li>
              <li><a href="#" className="text-sm hover:text-primary-400 transition">{t('privacyPolicy')}</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('newsletter')}</h3>
            <p className="text-sm text-surface-400 mb-3">{t('newsletterDesc')}</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={t('emailPlaceholder')}
                className="flex-1 px-3 py-2 rounded-lg bg-surface-800 border border-surface-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
              />
              <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">
                <Mail className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-surface-800 mt-8 pt-6 text-center">
          <p className="text-sm text-surface-500">
            © {new Date().getFullYear()} {tc('appName')}. {t('rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
