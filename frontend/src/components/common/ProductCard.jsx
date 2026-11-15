import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const isArabic = i18n.language?.startsWith('ar');
  const name = isArabic && product.name_ar ? product.name_ar : product.name_en;
  const categoryName = isArabic && product.category_name_ar ? product.category_name_ar : product.category_name_en;

  const price = parseFloat(product.price);
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= (product.low_stock_threshold || 10);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 flex flex-col justify-between">
      <Link to={`/products/${product.id}`} className="block relative overflow-hidden bg-slate-100 aspect-[4/3]">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Pill */}
        {categoryName && (
          <span className="absolute top-2.5 start-2.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900/80 text-white backdrop-blur-sm">
            {categoryName}
          </span>
        )}

        {/* Sale / Low Stock Tag */}
        {salePrice && (
          <span className="absolute top-2.5 end-2.5 px-2.5 py-1 text-xs font-bold rounded-md bg-orange-600 text-white shadow-sm">
            {Math.round(((price - salePrice) / price) * 100)}% OFF
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* SKU & Brand */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
            <span>{product.sku}</span>
            {product.brand && <span className="font-sans font-medium text-slate-500">{product.brand}</span>}
          </div>

          {/* Product Title */}
          <Link to={`/products/${product.id}`}>
            <h3 className="font-semibold text-slate-900 text-base line-clamp-2 hover:text-orange-600 transition-colors mb-2" title={name}>
              {name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Stock Status */}
          <div className="flex items-center gap-1.5 mb-3 text-xs">
            {isOutOfStock ? (
              <span className="text-red-600 font-medium inline-flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {t('products.outOfStock')}
              </span>
            ) : isLowStock ? (
              <span className="text-amber-600 font-medium inline-flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {t('products.lowStock')} ({product.stock_quantity} {product.unit})
              </span>
            ) : (
              <span className="text-emerald-600 font-medium inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {t('products.inStock')} ({product.stock_quantity} {product.unit})
              </span>
            )}
          </div>

          {/* Price & Cart Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900">
                  {salePrice ? salePrice.toFixed(2) : price.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-orange-600">{t('common.currency')}</span>
              </div>
              {salePrice && (
                <div className="text-xs text-slate-400 line-through">
                  {price.toFixed(2)} {t('common.currency')}
                </div>
              )}
              <span className="text-[11px] text-slate-400">/{product.unit}</span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              type="button"
              className={`p-2.5 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 active:scale-95 text-white shadow-sm'
              }`}
              title={t('products.addToCart')}
              aria-label={t('products.addToCart')}
            >
              {added ? (
                <Check className="w-5 h-5 animate-scale-in" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
