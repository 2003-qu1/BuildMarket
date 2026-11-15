import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  Check, 
  Layers 
} from 'lucide-react';
import api from '../../api/client';
import ProductModal from '../../components/admin/ProductModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminProducts() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.all([
        api.get('/products/admin/all'),
        api.get('/categories/admin/all')
      ]);
      if (prodsRes.data?.products) setProducts(prodsRes.data.products);
      if (catsRes.data?.categories) setCategories(catsRes.data.categories);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setSelectedProduct(p);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`${t('common.deleteConfirm')}\n${name}`)) {
      try {
        await api.delete(`/products/${id}`);
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product.');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === 'all' || p.category_id === parseInt(categoryFilter, 10);
    const s = search.toLowerCase().trim();
    const matchSearch = !s || 
      p.name_en?.toLowerCase().includes(s) || 
      p.name_ar?.includes(s) || 
      p.sku?.toLowerCase().includes(s);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('admin.allProducts')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {products.length} {isArabic ? 'صنف مسجل في قاعدة البيانات' : 'total products in catalog'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.addProduct')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isArabic ? 'ابحث بالاسم أو رمز الصنف (SKU)...' : 'Search by title, SKU...'}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl ps-9 pe-3 py-2 text-xs focus:ring-1 focus:ring-orange-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 start-0 ps-3 my-auto" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            {t('categories.title')}:
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-1 focus:ring-orange-500"
          >
            <option value="all">{t('products.allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {isArabic ? c.name_ar : c.name_en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 text-start">{t('products.sku')} / Item</th>
                  <th className="py-3 px-4 text-start">{t('categories.title')}</th>
                  <th className="py-3 px-4 text-start">{t('cart.price')}</th>
                  <th className="py-3 px-4 text-start">{t('products.quantity')}</th>
                  <th className="py-3 px-4 text-start">Status</th>
                  <th className="py-3 px-4 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredProducts.map((p) => {
                  const name = isArabic && p.name_ar ? p.name_ar : p.name_en;
                  const catName = isArabic && p.category_name_ar ? p.category_name_ar : p.category_name_en;
                  const isLow = p.stock_quantity <= p.low_stock_threshold;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      {/* Item & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'}
                            alt={name}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <span className="font-mono text-[11px] text-slate-400 block">{p.sku}</span>
                            <span className="font-bold text-slate-900 text-xs block line-clamp-1" title={name}>
                              {name}
                            </span>
                            {p.brand && <span className="text-[10px] text-slate-500">{p.brand}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {catName || 'Unassigned'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 text-xs block">
                          {parseFloat(p.price).toFixed(2)} {t('common.currency')}
                        </span>
                        {p.sale_price && (
                          <span className="text-[10px] text-orange-600 block">
                            Sale: {parseFloat(p.sale_price).toFixed(2)}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">/{p.unit}</span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span className={`font-bold text-xs ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                          {p.stock_quantity} {p.unit}
                        </span>
                        {isLow && (
                          <span className="text-[10px] text-amber-600 font-semibold block">
                            (Low Stock &lt;= {p.low_stock_threshold})
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {p.is_active ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            type="button"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                            title={t('admin.editProduct')}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, name)}
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title={t('admin.deleteProduct')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            {t('products.noProducts')}
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={selectedProduct}
        onSave={loadData}
        categories={categories}
      />

    </div>
  );
}
