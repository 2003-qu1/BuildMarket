import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Warehouse, 
  AlertTriangle, 
  Plus, 
  Minus, 
  History, 
  CheckCircle2, 
  Search, 
  X 
} from 'lucide-react';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminInventory() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');

  // Adjust stock modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('add'); // 'add' or 'subtract'
  const [reason, setReason] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, movRes] = await Promise.all([
        api.get(`/inventory?lowStockOnly=${lowStockOnly}&search=${encodeURIComponent(search)}`),
        api.get('/inventory/movements?limit=30')
      ]);
      if (invRes.data?.inventory) setInventory(invRes.data.inventory);
      if (movRes.data?.movements) setMovements(movRes.data.movements);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lowStockOnly]);

  const handleOpenAdjust = (p) => {
    setSelectedProduct(p);
    setAdjustQty('');
    setAdjustType('add');
    setReason('');
    setAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustQty) return;

    const qty = parseInt(adjustQty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid positive quantity.');
      return;
    }

    const finalChange = adjustType === 'add' ? qty : -qty;

    setAdjustSubmitting(true);
    try {
      await api.post('/inventory/adjust', {
        productId: selectedProduct.id,
        adjustmentQuantity: finalChange,
        reason: reason.trim() || (adjustType === 'add' ? 'Manual Warehouse Restock' : 'Manual Stock Adjustment')
      });
      setAdjustModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust stock.');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t('admin.inventory')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isArabic ? 'مراقبة كميات المستودعات، تتبع التوريد، وتسجيل حركات الصرف' : 'Real-time warehouse stock tracking and movements'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded border-slate-300"
            />
            <span className="text-amber-700">{isArabic ? 'المخزون المنخفض فقط' : 'Low Stock Only'}</span>
          </label>
        </div>
      </div>

      {/* Stock Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Warehouse className="w-5 h-5 text-orange-500" />
          <span>{isArabic ? 'أرصدة المواد في المستودع' : 'Current Warehouse Stock'}</span>
        </h2>

        {loading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : inventory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] border-b">
                <tr>
                  <th className="py-2.5 px-3 text-start">SKU / Material</th>
                  <th className="py-2.5 px-3 text-start">Category</th>
                  <th className="py-2.5 px-3 text-center">Available Stock</th>
                  <th className="py-2.5 px-3 text-center">Threshold</th>
                  <th className="py-2.5 px-3 text-start">Health</th>
                  <th className="py-2.5 px-3 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inventory.map((item) => {
                  const name = isArabic && item.name_ar ? item.name_ar : item.name_en;
                  const isLow = item.stock_quantity <= item.low_stock_threshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'}
                            alt={name}
                            className="w-9 h-9 rounded-lg object-cover border"
                          />
                          <div>
                            <span className="font-mono text-[10px] text-slate-400 block">{item.sku}</span>
                            <span className="font-bold text-slate-900 block line-clamp-1">{name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {isArabic ? item.category_name_ar : item.category_name_en}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-sm font-extrabold ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                          {item.stock_quantity}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{item.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-400">
                        {item.low_stock_threshold}
                      </td>
                      <td className="py-3 px-3">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            {isArabic ? 'كمية حرجة' : 'Low Stock'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {isArabic ? 'مخزون وافر' : 'Optimal'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-end">
                        <button
                          onClick={() => handleOpenAdjust(item)}
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs transition-colors"
                        >
                          {t('admin.adjustStock')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-400">
            No inventory items matching filter.
          </div>
        )}
      </div>

      {/* Recent Movements Audit Trail */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <History className="w-5 h-5 text-orange-500" />
          <span>{isArabic ? 'سجل الحركات المخزنية والتوريد الأخير' : 'Stock Movement Audit Trail'}</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] border-b">
              <tr>
                <th className="py-2.5 px-3 text-start">Timestamp</th>
                <th className="py-2.5 px-3 text-start">Material</th>
                <th className="py-2.5 px-3 text-start">Type</th>
                <th className="py-2.5 px-3 text-center">Change</th>
                <th className="py-2.5 px-3 text-center">Stock Level</th>
                <th className="py-2.5 px-3 text-start">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    {new Date(m.created_at).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {isArabic && m.name_ar ? m.name_ar : m.name_en}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {m.change_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    <span className={m.quantity_change > 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change} {m.unit}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-500 font-mono">
                    {m.previous_stock} &rarr; <strong>{m.new_stock}</strong>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {m.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">{t('admin.adjustStock')}</h2>
              <button onClick={() => setAdjustModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block font-mono text-[10px]">{selectedProduct.sku}</span>
                <p className="font-bold text-slate-900 text-sm">
                  {isArabic && selectedProduct.name_ar ? selectedProduct.name_ar : selectedProduct.name_en}
                </p>
                <p className="text-slate-500 mt-0.5">
                  Current Stock: <strong>{selectedProduct.stock_quantity} {selectedProduct.unit}</strong>
                </p>
              </div>

              {/* Adjust Type */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    adjustType === 'add'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Restock / إضافة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('subtract')}
                  className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    adjustType === 'subtract'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  <span>Deduct / خصم</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity ({selectedProduct.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Reference Notes
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. New supplier shipment arrived, inventory audit..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {adjustSubmitting ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
