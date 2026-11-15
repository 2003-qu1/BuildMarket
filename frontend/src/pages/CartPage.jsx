import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  ArrowLeft 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const { 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    deliveryFee, 
    grandTotal, 
    totalItems 
  } = useCart();
  const navigate = useNavigate();
  const isArabic = i18n.language?.startsWith('ar');

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {t('cart.empty')}
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {isArabic 
            ? 'سلتك فارغة الآن. تصفح أقسام المواد الإنشائية وأضف ما يحتاجه مشروعك من إسمنت، حديد، بلوك، ورمل.' 
            : 'Your shopping cart is currently empty. Browse our catalog for certified construction supplies.'}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md shadow-orange-500/20 transition-all"
        >
          <span>{t('cart.startShopping')}</span>
          <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('cart.title')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {totalItems} {isArabic ? 'أصناف محددة في السلة' : 'items selected'}
          </p>
        </div>

        <button
          onClick={clearCart}
          type="button"
          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-red-200"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t('cart.clearCart')}</span>
        </button>
      </div>

      {/* Main Grid: Items & Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const name = isArabic && item.name_ar ? item.name_ar : item.name_en;
            const price = item.sale_price !== null ? item.sale_price : item.price;
            const itemTotal = price * item.quantity;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Image & Title */}
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'}
                    alt={name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">{item.sku}</span>
                    <Link
                      to={`/products/${item.id}`}
                      className="font-bold text-slate-900 text-sm sm:text-base hover:text-orange-600 transition-colors line-clamp-1"
                    >
                      {name}
                    </Link>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xs font-semibold text-slate-700">{price.toFixed(2)}</span>
                      <span className="text-[10px] text-orange-600 font-bold">{t('common.currency')}</span>
                      <span className="text-[11px] text-slate-400">/{item.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="inline-flex items-center border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      type="button"
                      className="p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.stock_quantity && item.quantity >= item.stock_quantity}
                      type="button"
                      className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                      aria-label="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-end min-w-[90px]">
                    <span className="text-base font-extrabold text-slate-900 block">
                      {itemTotal.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-orange-600 font-bold block">{t('common.currency')}</span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    type="button"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('cart.removeItem')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
              <span>{isArabic ? 'متابعة تصفح مواد البناء' : 'Continue Shopping'}</span>
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
            {t('checkout.orderSummary')}
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{t('cart.subtotal')}</span>
              <span className="font-semibold text-slate-900">{subtotal.toFixed(2)} {t('common.currency')}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-orange-500" />
                {t('cart.deliveryFee')}
              </span>
              <span className="font-semibold text-slate-900">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-bold">{t('cart.free')}</span>
                ) : (
                  `${deliveryFee.toFixed(2)} ${t('common.currency')}`
                )}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg">
              {t('cart.deliveryNote')}
            </p>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-slate-900">{t('cart.grandTotal')}</span>
              <div className="text-end">
                <span className="text-2xl font-black text-slate-900">{grandTotal.toFixed(2)}</span>
                <span className="text-xs font-bold text-orange-600 ms-1">{t('common.currency')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            type="button"
            className="w-full py-3.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span>{t('cart.proceedCheckout')}</span>
            <ArrowRight className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
          </button>
        </div>

      </div>

    </div>
  );
}
