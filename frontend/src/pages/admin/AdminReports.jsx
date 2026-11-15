import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  Award, 
  Layers 
} from 'lucide-react';
import api from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminReports() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.get('/reports/analytics');
        if (res.data?.success) {
          setReportData(res.data);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Generating financial reports..." />;
  }

  const { summary, dailySales, monthlySales, bestSelling, categorySales } = reportData || {};

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t('admin.reports')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isArabic ? 'تحليلات الأداء المالي، الأصناف الأكثر طلباً، وتوزيع إيرادات الأقسام' : 'Revenue analytics, best-selling materials, and category distributions'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">{t('admin.totalSales')}</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {(summary?.totalRevenue || 0).toFixed(2)}
            </span>
            <span className="text-xs font-bold text-orange-600">{t('common.currency')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Average Order Value</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {(summary?.averageOrderValue || 0).toFixed(2)}
            </span>
            <span className="text-xs font-bold text-orange-600">{t('common.currency')} / order</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">{t('admin.totalOrders')}</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {summary?.totalOrders || 0}
            </span>
            <span className="text-xs text-slate-400">Successfully placed</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Best Sellers & Category Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Best Selling Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award className="w-5 h-5 text-orange-500" />
            <span>{t('admin.bestSellers')}</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] border-b">
                <tr>
                  <th className="py-2.5 px-3 text-start">Rank / Material</th>
                  <th className="py-2.5 px-3 text-center">Volume Sold</th>
                  <th className="py-2.5 px-3 text-end">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {bestSelling?.map((p, idx) => {
                  const name = isArabic && p.product_name_ar ? p.product_name_ar : p.product_name_en;
                  return (
                    <tr key={p.product_id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 line-clamp-1">{name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {p.total_quantity_sold} <span className="text-[10px] text-slate-400 font-normal">{p.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-end font-bold text-slate-900">
                        {parseFloat(p.total_revenue_generated).toFixed(2)} {t('common.currency')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Layers className="w-5 h-5 text-orange-500" />
            <span>{t('admin.categoryRevenue')}</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] border-b">
                <tr>
                  <th className="py-2.5 px-3 text-start">Category</th>
                  <th className="py-2.5 px-3 text-center">Orders Count</th>
                  <th className="py-2.5 px-3 text-end">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {categorySales?.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {isArabic ? c.name_ar : c.name_en}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {c.orders_count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end font-bold text-orange-600">
                      {parseFloat(c.category_revenue).toFixed(2)} {t('common.currency')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Monthly Sales Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          <span>{isArabic ? 'سجل المبيعات الشهري' : 'Monthly Sales Breakdown'}</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] border-b">
              <tr>
                <th className="py-2.5 px-3 text-start">Month</th>
                <th className="py-2.5 px-3 text-center">Total Orders</th>
                <th className="py-2.5 px-3 text-end">Monthly Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {monthlySales?.map((m) => (
                <tr key={m.month} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{m.month}</td>
                  <td className="py-3 px-3 text-center">{m.orders_count}</td>
                  <td className="py-3 px-3 text-end font-bold text-slate-900">
                    {parseFloat(m.monthly_revenue).toFixed(2)} {t('common.currency')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
