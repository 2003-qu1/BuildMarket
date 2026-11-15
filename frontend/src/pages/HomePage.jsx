import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  HardHat, 
  PhoneCall, 
  MessageSquare, 
  ChevronRight, 
  CheckCircle2 
} from 'lucide-react';
import api from '../api/client';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products?featured=true&limit=8')
        ]);
        if (catsRes.data?.categories) setCategories(catsRes.data.categories);
        if (prodsRes.data?.products) setFeaturedProducts(prodsRes.data.products);
      } catch (err) {
        console.error('Home page load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transform duration-1000"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1920&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-2xl space-y-6">
            
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs sm:text-sm font-semibold tracking-wide">
              <HardHat className="w-4 h-4 text-orange-500" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t('hero.title')}
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {t('hero.description')}
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-base shadow-lg shadow-orange-500/25 transition-all hover:scale-102 active:scale-98"
              >
                <span>{t('hero.exploreBtn')}</span>
                <ArrowRight className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-slate-800/80 hover:bg-slate-700/80 text-white text-base border border-slate-700 backdrop-blur-sm transition-all"
              >
                <PhoneCall className="w-4 h-4 text-orange-400" />
                <span>{t('hero.quoteBtn')}</span>
              </Link>
            </div>

            {/* Highlights row */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>{t('hero.feature1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>{t('hero.feature2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>{t('hero.feature3')}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('categories.title')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('categories.subtitle')}
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            <span>{t('categories.viewAll')}</span>
            <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.slice(0, 9).map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-[4/3] flex items-end p-4 shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}
                alt={isArabic ? cat.name_ar : cat.name_en}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              
              <div className="relative z-10 w-full">
                <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-orange-400 transition-colors">
                  {isArabic ? cat.name_ar : cat.name_en}
                </h3>
                {cat.product_count !== undefined && (
                  <span className="text-[11px] text-slate-300 block">
                    {cat.product_count} {isArabic ? 'صنف متوفر' : 'materials'}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED MATERIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isArabic ? 'الأعلى طلباً بالمشاريع' : 'High Demand on Sites'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t('products.featured')}
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            <span>{isArabic ? 'مشاهدة الكتالوج كاملاً' : 'View Full Catalog'}</span>
            <ChevronRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">{t('products.noProducts')}</p>
          </div>
        )}
      </section>

      {/* 4. SPECIAL OFFERS / BULK BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-orange-600 text-white uppercase tracking-wider">
              {isArabic ? 'عروض توريد المقاولات الكبرى' : 'Contractor Bulk Supply'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {isArabic 
                ? 'خصومات خاصة على حديد التسليح والإسمنت وتريلات الرمل' 
                : 'Special Pricing on Steel Rebar, Cement & Aggregates'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {isArabic
                ? 'نقدم تسهيلات وعقود توريد دورية للشركات الإنشائية والمطورين العقاريين مع خدمة التفريغ المباشر بالموقع.'
                : 'We provide specialized supply schedules and volume discounts for general contractors, developers, and engineering firms.'}
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="px-6 py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md transition-all"
              >
                {t('contact.title')}
              </Link>
              <Link
                to="/products?category=steel-and-iron"
                className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white text-sm border border-white/20 transition-all"
              >
                {t('categories.steelAndIron')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT STORE HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>{isArabic ? 'عن سوق مواد البناء' : 'About Build Market'}</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {isArabic 
                ? 'شريكك الإنشائي الموثوق من مرحلة القواعد وحتى تسليم المفتاح'
                : 'Your Reliable Construction Partner from Foundations to Handover'}
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {isArabic
                ? 'تأسست مؤسستنا لتلبية احتياجات قطاع البناء المتسارع. نحن نوفر منصة متكاملة تضمن حصولك على مواد بناء أصلية ومعتمدة، مع الالتزام التام بالمواعيد المحددة لصب الخرسانة وتنفيذ مراحل المشروع دون تأخير.'
                : 'Build Market was established to power modern infrastructure and building projects. We streamline the procurement of core raw materials directly from certified mills and quarries to your construction sites.'}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-2xl font-black text-orange-600 block">100%</span>
                <span className="text-xs text-slate-600 font-medium mt-1 block">
                  {isArabic ? 'مواد معتمدة ومطابقة للمواصفات' : 'Certified Materials'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-2xl font-black text-slate-900 block">24/7</span>
                <span className="text-xs text-slate-600 font-medium mt-1 block">
                  {isArabic ? 'خدمة توصيل المواقع الإنشائية' : 'Site Logistics Support'}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80"
                alt="Construction site"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -start-6 bg-slate-900 text-white p-5 rounded-2xl shadow-xl max-w-xs border border-slate-800 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500 text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{isArabic ? 'ضمان الجودة والسلامة' : 'Quality Guaranteed'}</h4>
                  <p className="text-xs text-slate-400">{isArabic ? 'فحص واختبار دوري' : 'Official testing lab certified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT CTA BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-orange-500 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-500/20">
          <div className="space-y-2 text-center md:text-start">
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              {isArabic ? 'هل تحتاج إلى توريد كميات كبيرة لمشروعك؟' : 'Need Bulk Quantities for Your Job Site?'}
            </h3>
            <p className="text-orange-100 text-sm sm:text-base">
              {isArabic 
                ? 'تواصل مباشرة مع مهندسي المبيعات والتوريد للحصول على أفضل سعر مخصص لمشروعك.'
                : 'Connect directly with our logistics team for tailored quotations and delivery schedules.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/966501234567"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white text-orange-600 hover:bg-orange-50 transition-colors shadow-sm"
            >
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>{isArabic ? 'واتساب التوريد المباشر' : 'WhatsApp Dispatch'}</span>
            </a>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-slate-900 hover:bg-slate-950 text-white transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-orange-400" />
              <span>{t('nav.contact')}</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
