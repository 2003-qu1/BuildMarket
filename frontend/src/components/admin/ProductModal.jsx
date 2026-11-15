import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import api from '../../api/client';

export default function ProductModal({ isOpen, onClose, product, onSave, categories = [] }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [formData, setFormData] = useState({
    category_id: '',
    sku: '',
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    price: '',
    sale_price: '',
    stock_quantity: 0,
    low_stock_threshold: 10,
    unit: 'Piece',
    image_url: '',
    is_featured: false,
    is_active: true,
    brand: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        category_id: product.category_id || '',
        sku: product.sku || '',
        name_en: product.name_en || '',
        name_ar: product.name_ar || '',
        description_en: product.description_en || '',
        description_ar: product.description_ar || '',
        price: product.price || '',
        sale_price: product.sale_price || '',
        stock_quantity: product.stock_quantity !== undefined ? product.stock_quantity : 0,
        low_stock_threshold: product.low_stock_threshold !== undefined ? product.low_stock_threshold : 10,
        unit: product.unit || 'Piece',
        image_url: product.image_url || '',
        is_featured: Boolean(product.is_featured),
        is_active: product.is_active !== undefined ? Boolean(product.is_active) : true,
        brand: product.brand || ''
      });
    } else {
      setFormData({
        category_id: categories.length > 0 ? categories[0].id : '',
        sku: '',
        name_en: '',
        name_ar: '',
        description_en: '',
        description_ar: '',
        price: '',
        sale_price: '',
        stock_quantity: 50,
        low_stock_threshold: 10,
        unit: 'Piece',
        image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
        is_featured: false,
        is_active: true,
        brand: ''
      });
    }
    setError('');
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    setError('');
    try {
      const res = await api.post('/products/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.imageUrl) {
        setFormData((prev) => ({ ...prev, image_url: res.data.imageUrl }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name_en || !formData.name_ar || !formData.price || !formData.category_id) {
      setError('Please fill in category, English name, Arabic name, and price.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      if (product) {
        await api.put(`/products/${product.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {product ? t('admin.editProduct') : t('admin.addProduct')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-600 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('categories.title')} *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {isArabic ? c.name_ar : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('products.sku')} (Leave blank to auto-generate)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. CEM-001"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono"
              />
            </div>
          </div>

          {/* Bilingual Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name (English) *
              </label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="e.g. Portland Cement 50kg"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم المنتج (باللغة العربية) *
              </label>
              <input
                type="text"
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                placeholder="مثال: أسمنت بورتلاندي 50 كجم"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-arabic text-end"
                dir="rtl"
                required
              />
            </div>
          </div>

          {/* Prices & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price ({t('common.currency')}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sale / Discount Price ({t('common.currency')})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('products.unit')} *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="Piece">Piece / حبة</option>
                <option value="Bag">Bag / كيس (50kg)</option>
                <option value="Ton">Ton / طن</option>
                <option value="Truck (18m³)">Truck / تريلا (18m³)</option>
                <option value="Drum">Drum / برميل (18L)</option>
                <option value="Roll">Roll / لفة</option>
                <option value="Unit">Unit / جهاز</option>
              </select>
            </div>
          </div>

          {/* Stock & Threshold & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. SABIC, Yamama"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Product Image URL & Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Image
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono text-xs"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300">
                <Upload className="w-4 h-4 text-orange-500" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
            {formData.image_url && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-md border"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'; }}
                />
                <span className="text-xs text-slate-500 truncate flex-1">{formData.image_url}</span>
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (English)
              </label>
              <textarea
                rows={3}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                الوصف والمواصفات (باللغة العربية)
              </label>
              <textarea
                rows={3}
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-arabic text-end"
                dir="rtl"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="flex items-center gap-6 pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
              />
              <span>Featured on Homepage</span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
              />
              <span>Active in Store</span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
