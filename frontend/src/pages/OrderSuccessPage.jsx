import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Truck, ArrowRight, ShoppingBag, PhoneCall } from 'lucide-react';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const orderNumber = searchParams.get('orderNumber') || 'BM-2026-XXXX';
  const total = searchParams.get('total') || '0.00';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8">
      
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-scale-in">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('checkout.orderSuccess')}
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {t('checkout.confirmationMsg')}
        </p>
      </div>

      {/* Order Badge Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto text-start">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block">{t('checkout.orderNumber')}</span>
            <span className="text-lg font-mono font-bold text-orange-600">{orderNumber}</span>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
            {isArabic ? 'قيد المراجعة والتجهيز' : 'Pending Dispatch'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm pt-2">
          <span className="text-slate-600 font-medium">{t('cart.grandTotal')}</span>
          <span className="font-extrabold text-slate-900 text-lg">
            {parseFloat(total).toFixed(2)} {t('common.currency')}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
          <Truck className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <p>
            {isArabic 
              ? 'سيقوم مندوب العمليات بالتواصل هاتفياً للتأكد من جاهزية موقع البناء لاستقبال الشاحنات والتفريغ.' 
              : 'Our dispatch manager will call to confirm site crane access and truck arrival window.'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/profile"
          className="px-6 py-3 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white text-sm transition-all"
        >
          {t('checkout.viewOrder')}
        </Link>
        <Link
          to="/products"
          className="px-6 py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md transition-all flex items-center gap-2"
        >
          <span>{t('checkout.continueShopping')}</span>
          <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
        </Link>
      </div>

    </div>
  );
}
