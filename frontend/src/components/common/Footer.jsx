import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Phone, Mail, MapPin, Clock, ShieldCheck, Truck, Headphones } from 'lucide-react';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Value Proposition Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">
                  {isArabic ? 'توصيل شاحنات وتريلات سريع' : 'Fast Bulk Site Delivery'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isArabic ? 'جدولة مباشرة لموقع مشروعك' : 'Scheduled directly to your job site'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">
                  {isArabic ? 'مطابقة للمواصفات والمقاييس' : 'Certified Quality Standards'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isArabic ? 'شهادات فحص واختبار رسمية' : 'SASO & ASTM verified materials'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">
                  {isArabic ? 'دعم فني واستشارات بناء' : 'Contractor Support'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isArabic ? 'استشارات فورية لحساب الكميات' : 'Direct pricing & volume estimates'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                {t('brand.name')}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('brand.subtext')}
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                {isArabic ? 'طرق الدفع المعتمدة' : 'Accepted Payment'}
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-400">
                <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Cash on Delivery</span>
                <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Bank Wire</span>
                <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700">Mada / Visa</span>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('categories.title')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?category=cement" className="hover:text-orange-400 transition-colors">
                  {t('categories.cement')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=steel-and-iron" className="hover:text-orange-400 transition-colors">
                  {t('categories.steelAndIron')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=bricks-and-blocks" className="hover:text-orange-400 transition-colors">
                  {t('categories.bricksAndBlocks')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=sand" className="hover:text-orange-400 transition-colors">
                  {t('categories.sand')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=gravel-and-aggregates" className="hover:text-orange-400 transition-colors">
                  {t('categories.gravelAndAggregates')}
                </Link>
              </li>
              <li>
                <Link to="/products?category=plumbing-supplies" className="hover:text-orange-400 transition-colors">
                  {t('categories.plumbingSupplies')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {isArabic ? 'روابط المتجر' : 'Quick Navigation'}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-orange-400 transition-colors">
                  {t('nav.products')}
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-orange-400 transition-colors">
                  {t('nav.cart')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-orange-400 transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-orange-400 transition-colors">
                  {t('nav.profile')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-orange-400 transition-colors">
                  {t('account.adminNotice')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('contact.title')}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-xs leading-relaxed">{t('contact.addressVal')}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-slate-400 text-xs" dir="ltr">+966 50 123 4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-slate-400 text-xs">sales@buildmarket.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-xs">{t('contact.hoursVal')}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} {t('brand.name')}. All rights reserved.</p>
          <p className="text-slate-400">
            {isArabic ? 'منصة التجارة الإلكترونية لمواد البناء والمقاولات' : 'Construction Materials Trading & Supply Platform'}
          </p>
        </div>
      </div>
    </footer>
  );
}
