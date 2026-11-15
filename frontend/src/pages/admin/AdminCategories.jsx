import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, Plus, Edit3, Trash2 } from 'lucide-react';
import api from '../../api/client';
import CategoryModal from '../../components/admin/CategoryModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminCategories() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories/admin/all');
      if (res.data?.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setSelectedCategory(c);
    setModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`${t('common.deleteConfirm')}\n${name}`)) {
      try {
        await api.delete(`/categories/${id}`);
        loadCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete category.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('admin.allCategories')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {categories.length} {isArabic ? 'أقسام وتصنيفات رئيسية' : 'main building material categories'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('admin.addCategory')}</span>
        </button>
      </div>

      {/* Categories Grid / Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 text-start">Category</th>
                  <th className="py-3 px-4 text-start">Slug</th>
                  <th className="py-3 px-4 text-start">Materials Count</th>
                  <th className="py-3 px-4 text-start">Order</th>
                  <th className="py-3 px-4 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    {/* Category Title & Banner */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'}
                          alt={c.name_en}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">
                            {c.name_en}
                          </span>
                          <span className="text-[11px] text-slate-500 font-arabic block" dir="rtl">
                            {c.name_ar}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {c.slug}
                    </td>

                    {/* Count */}
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {c.product_count || 0} {isArabic ? 'صنف' : 'items'}
                      </span>
                    </td>

                    {/* Display Order */}
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {c.display_order}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-end">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          type="button"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title={t('admin.editCategory')}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name_en)}
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title={t('admin.deleteProduct')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            No categories created yet.
          </div>
        )}
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
        onSave={loadCategories}
      />

    </div>
  );
}
