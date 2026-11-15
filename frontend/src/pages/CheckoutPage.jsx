import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Truck, 
  CreditCard, 
  Banknote, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/client';

export default function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { cart, subtotal, deliveryFee, grandTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const isArabic = i18n.language?.startsWith('ar');

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_phone: user?.phone || '',
    customer_email: user?.email || '',
    city: 'Riyadh',
    shipping_address: '',
    notes: '',
    payment_method: 'Cash on Delivery'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">{t('cart.empty')}</h2>
        <Link to="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold">
          {t('cart.startShopping')}
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_phone || !formData.shipping_address || !formData.city) {
      setError(isArabic ? 'يرجى ملء جميع الحقول المطلوبة (الاسم، الجوال، المدينة، والعنوان).' : 'Please complete all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      const res = await api.post('/orders', payload);

      if (res.data?.success && res.data.order) {
        const orderInfo = res.data.order;
        clearCart();
        navigate(`/order-success?orderNumber=${orderInfo.order_number}&total=${orderInfo.total_amount}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to submit order. Please check item stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('checkout.title')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isArabic ? 'تأكيد بيانات التوصيل لموقع المشروع وطريقة الدفع' : 'Confirm your site logistics and payment method'}
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left 2 Cols: Form Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Delivery / Site Info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Truck className="w-5 h-5 text-orange-500" />
                <span>{t('checkout.shippingInfo')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('checkout.fullName')} *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="e.g. Eng. Khalid Al-Otaibi"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('checkout.phone')} *
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="e.g. +966 55 123 4567"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('checkout.email')}
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="site@contractor.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('checkout.city')} *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Riyadh">Riyadh / الرياض</option>
                    <option value="Jeddah">Jeddah / جدة</option>
                    <option value="Dammam">Dammam / الدمام</option>
                    <option value="Khobar">Khobar / الخبر</option>
                    <option value="Makkah">Makkah / مكة المكرمة</option>
                    <option value="Madinah">Madinah / المدينة المنورة</option>
                    <option value="Other">Other Region / منطقة أخرى</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('checkout.address')} *
                </label>
                <textarea
                  rows={2}
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  placeholder={isArabic ? 'اسم الحي، الشارع، رقم القطعة أو موقع المشروع الإنشائي' : 'District, Street name, Plot number, or Site coordinates'}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('checkout.notes')}
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isArabic ? 'تعليمات دخول الشاحنات، مواعيد التفريغ، هاتف المراقب بالموقع...' : 'Truck entry instructions, unloading crane availability, etc.'}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Banknote className="w-5 h-5 text-orange-500" />
                <span>{t('checkout.paymentMethod')}</span>
              </h2>

              <div className="space-y-3">
                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.payment_method === 'Cash on Delivery'
                      ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="Cash on Delivery"
                      checked={formData.payment_method === 'Cash on Delivery'}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{t('checkout.cod')}</span>
                      <span className="text-xs text-slate-500 block">
                        {isArabic ? 'السداد نقداً أو عبر جهاز مدى عند وصول الشاحنة لموقعك' : 'Pay via cash or POS device upon site arrival'}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-5 h-5 ${formData.payment_method === 'Cash on Delivery' ? 'text-orange-500' : 'text-slate-200'}`} />
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    formData.payment_method === 'Bank Transfer'
                      ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="Bank Transfer"
                      checked={formData.payment_method === 'Bank Transfer'}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{t('checkout.bankTransfer')}</span>
                      <span className="text-xs text-slate-500 block">
                        {isArabic ? 'إرسال فاتورة ضريبية رسمية وحساب IBAN معتمد' : 'Receive an official VAT invoice with corporate IBAN'}
                      </span>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-5 h-5 ${formData.payment_method === 'Bank Transfer' ? 'text-orange-500' : 'text-slate-200'}`} />
                </label>
              </div>
            </div>

          </div>

          {/* Right Col: Order Summary & Submit Button */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 sticky top-28">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              {t('checkout.orderSummary')}
            </h2>

            {/* Micro items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pe-1">
              {cart.map((item) => {
                const name = isArabic && item.name_ar ? item.name_ar : item.name_en;
                const price = item.sale_price !== null ? item.sale_price : item.price;
                return (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50">
                    <div className="flex items-center gap-2 overflow-hidden pe-2">
                      <span className="font-bold text-slate-800">{item.quantity}x</span>
                      <span className="truncate text-slate-600 font-medium" title={name}>{name}</span>
                    </div>
                    <span className="font-bold text-slate-900 flex-shrink-0">
                      {(price * item.quantity).toFixed(2)} {t('common.currency')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-slate-900">{subtotal.toFixed(2)} {t('common.currency')}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>{t('cart.deliveryFee')}</span>
                <span className="font-semibold text-slate-900">
                  {deliveryFee === 0 ? <span className="text-emerald-600 font-bold">{t('cart.free')}</span> : `${deliveryFee.toFixed(2)} ${t('common.currency')}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-base font-bold text-slate-900">{t('cart.grandTotal')}</span>
                <div className="text-end">
                  <span className="text-2xl font-black text-slate-900">{grandTotal.toFixed(2)}</span>
                  <span className="text-xs font-bold text-orange-600 ms-1">{t('common.currency')}</span>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-base shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              <span>{loading ? t('checkout.processing') : t('checkout.placeOrder')}</span>
            </button>

            <p className="text-[11px] text-center text-slate-400">
              {isArabic 
                ? 'بالضغط على تأكيد الطلب، سيتم إرسال جدول التوريد للمستودع وتجهيز الشاحنة.' 
                : 'By submitting, your order is registered and queued for logistics dispatch.'}
            </p>
          </div>

        </div>
      </form>
    </div>
  );
}
