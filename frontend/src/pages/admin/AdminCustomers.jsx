import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, CheckCircle, Ban } from 'lucide-react';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminCustomers() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (res.data?.customers) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.put(`/customers/${id}/status`, { status: nextStatus });
      loadCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t('admin.customers')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {customers.length} {isArabic ? 'عملاء ومقاولين مسجلين في النظام' : 'registered customer accounts'}
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadCustomers()}
            placeholder={isArabic ? 'ابحث بالاسم أو البريد أو الجوال...' : 'Search by name, email, phone...'}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl ps-9 pe-3 py-2 text-xs focus:ring-1 focus:ring-orange-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 start-0 ps-3 my-auto" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 text-start">{t('checkout.fullName')}</th>
                  <th className="py-3 px-4 text-start">{t('checkout.phone')}</th>
                  <th className="py-3 px-4 text-start">Joined</th>
                  <th className="py-3 px-4 text-center">{t('admin.orders')}</th>
                  <th className="py-3 px-4 text-start">Total Spend</th>
                  <th className="py-3 px-4 text-start">Status</th>
                  <th className="py-3 px-4 text-end">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{c.name}</span>
                      <span className="text-[11px] text-slate-400">{c.email}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600" dir="ltr">
                      {c.phone || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(c.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                        {c.total_orders || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {parseFloat(c.total_spent || 0).toFixed(2)} {t('common.currency')}
                    </td>
                    <td className="py-3 px-4">
                      {c.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-end">
                      <button
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        type="button"
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          c.status === 'active'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={c.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {c.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            No customers found.
          </div>
        )}
      </div>

    </div>
  );
}
