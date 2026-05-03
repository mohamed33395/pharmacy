import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Truck, ShieldCheck, Headphones, BadgeCheck,
  ArrowRight, Pill, Heart, Baby, Sparkles, Apple, Eye
} from 'lucide-react';
import FeaturedProducts from '@/components/home/FeaturedProducts';

const categories = [
  { icon: Pill, key: 'medicines', en: 'Medicines', ar: 'الأدوية', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
  { icon: Heart, key: 'vitamins', en: 'Vitamins & Supplements', ar: 'فيتامينات ومكملات', color: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
  { icon: Sparkles, key: 'skincare', en: 'Skin Care', ar: 'العناية بالبشرة', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
  { icon: Baby, key: 'baby', en: 'Baby Care', ar: 'العناية بالطفل', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' },
  { icon: Apple, key: 'nutrition', en: 'Nutrition', ar: 'التغذية', color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
  { icon: Eye, key: 'eyecare', en: 'Eye Care', ar: 'العناية بالعيون', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
];

export default function HomePage() {
  const t = useTranslations('home');
  const tc = useTranslations('common');

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 start-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 end-10 w-96 h-96 bg-accent-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition shadow-lg active:scale-[0.98]">
                {t('shopNow')} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/categories" className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/10 transition">
                {t('exploreCats')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 border-b border-surface-200 dark:border-surface-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: t('freeShipping'), desc: t('freeShippingDesc') },
              { icon: ShieldCheck, title: t('securePayment'), desc: t('securePaymentDesc') },
              { icon: Headphones, title: t('support'), desc: t('supportDesc') },
              { icon: BadgeCheck, title: t('certified'), desc: t('certifiedDesc') },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center mb-3">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-surface-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('categories')}</h2>
            <p className="text-surface-500">{t('categoriesSub')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.key}
                href={`/products?category=${cat.key}`}
                className="card-hover p-6 flex flex-col items-center text-center group"
              >
                <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <span className="font-medium text-sm">{cat.en}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-surface-100 dark:bg-surface-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">{t('featured')}</h2>
              <p className="text-surface-500">{t('featuredSub')}</p>
            </div>
            <Link href="/products" className="btn-outline text-sm !px-4 !py-2">
              {tc('viewAll')} <ArrowRight className="w-4 h-4 inline ms-1" />
            </Link>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-accent-600 to-accent-700 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              {tc('appName')} - {t('heroTitle')}
            </h2>
            <p className="text-accent-100 mb-6 max-w-xl mx-auto">
              {t('heroSubtitle')}
            </p>
            <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-accent-700 font-bold px-8 py-3 rounded-xl hover:bg-accent-50 transition">
              {tc('register')} <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
