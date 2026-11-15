import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingCart, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Share2, 
  Layers 
} from 'lucide-react';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const isArabic = i18n.language?.startsWith('ar');

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data?.product) {
          setProduct(res.data.product);
          setRelatedProducts(res.data.relatedProducts || []);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" text={t('common.loading')} />;
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-500">The requested construction material could not be located.</p>
        <Link to="/products" className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold">
          <ArrowLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
          {t('products.title')}
        </Link>
      </div>
    );
  }

  const name = isArabic && product.name_ar ? product.name_ar : product.name_en;
  const description = isArabic && product.description_ar ? product.description_ar : product.description_en;
  const categoryName = isArabic && product.category_name_ar ? product.category_name_ar : product.category_name_en;

  const price = parseFloat(product.price);
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = !isOutOfStock && product.stock_quantity <= (product.low_stock_threshold || 10);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const incrementQty = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-orange-600 transition-colors">{t('nav.home')}</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-orange-600 transition-colors">{t('nav.products')}</Link>
        <span>/</span>
        {categoryName && (
          <>
            <Link to={`/products?category=${product.category_slug || ''}`} className="hover:text-orange-600 transition-colors">
              {categoryName}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-slate-800 font-semibold truncate max-w-xs">{name}</span>
      </nav>

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
        
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {salePrice && (
              <span className="absolute top-4 start-4 px-3 py-1.5 rounded-lg bg-orange-600 text-white font-bold text-xs shadow-md">
                {Math.round(((price - salePrice) / price) * 100)}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category & SKU Pill */}
            <div className="flex items-center gap-2 flex-wrap">
              {categoryName && (
                <span className="px-3 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-200">
                  {categoryName}
                </span>
              )}
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                SKU: {product.sku}
              </span>
              {product.brand && (
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              {name}
            </h1>

            {/* Stock Indicator */}
            <div className="flex items-center gap-2 text-xs">
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-semibold border border-red-200 inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {t('products.outOfStock')}
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {t('products.lowStock')} ({product.stock_quantity} {product.unit})
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {t('products.inStock')} ({product.stock_quantity} {product.unit} {isArabic ? 'متوفر' : 'available'})
                </span>
              )}
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  {salePrice ? salePrice.toFixed(2) : price.toFixed(2)}
                </span>
                <span className="text-base font-bold text-orange-600">{t('common.currency')}</span>
                <span className="text-xs text-slate-400">/ {product.unit}</span>
              </div>
              {salePrice && (
                <div className="text-xs text-slate-400 line-through">
                  {price.toFixed(2)} {t('common.currency')}
                </div>
              )}
            </div>

            {/* Short Description */}
            {description && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {description}
              </p>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="pt-2 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('products.quantity')}:
                </span>
                <div className="inline-flex items-center border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={decrementQty}
                    disabled={quantity <= 1 || isOutOfStock}
                    type="button"
                    className="p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQty}
                    disabled={quantity >= product.stock_quantity || isOutOfStock}
                    type="button"
                    className="p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">{product.unit}</span>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                type="button"
                className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/25 active:scale-98'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>{t('productDetails.addedToCart')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>{t('products.addToCart')}</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Delivery & Trust Highlights */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>{isArabic ? 'توصيل وتفريغ شاحنات للموقع' : 'Site truck delivery available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>{isArabic ? 'شهادة جودة وفحص مخبري' : 'Quality certified & tested'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Technical Specifications Tab */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-500" />
          <span>{t('productDetails.specifications')}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block">{t('products.sku')}</span>
            <span className="text-sm font-mono font-bold text-slate-800">{product.sku}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block">{t('products.unit')}</span>
            <span className="text-sm font-bold text-slate-800">{product.unit}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block">{t('products.brand')}</span>
            <span className="text-sm font-bold text-slate-800">{product.brand || 'Saudi Standard'}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs text-slate-400 block">{isArabic ? 'الضمان والمطابقة' : 'Compliance'}</span>
            <span className="text-sm font-bold text-emerald-600">SASO / ASTM C150</span>
          </div>
        </div>

        <div className="pt-4 text-xs text-slate-500 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
          <p className="font-semibold text-orange-800 mb-1">{isArabic ? 'ملاحظة التوريد والتسليم للموقع:' : 'Site Logistics Notice:'}</p>
          <p>{t('productDetails.deliveryNotice')}</p>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {t('products.related')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
