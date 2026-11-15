import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Plus, 
  Warehouse, 
  CheckCircle2 
} from 'lucide-react';
import api from '../../api/client';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get('/reports/overview');
        if (res.data?.success) {
          setStats(res.data.stats);
          setRecentOrders(res.data.recentOrders || []);
          setLowStockProducts(res.data.lowStockProducts || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading store metrics..." />;
  }

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-slate-700/60">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-1">
            {isArabic ? 'لوحة تحكم المالك والمتجر' : 'Owner & Administrator Dashboard'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isArabic ? 'مرحباً بك في سوق مواد البناء' : 'Welcome to Build Market Control Center'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            {isArabic 
              ? 'متابعة حية للطلبات الواردة، حركة مستودعات الإسمنت والحديد، وإيرادات التوريد.' 
              : 'Real-time overview of incoming orders, site deliveries, inventory, and sales analytics.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('admin.addProduct')}</span>
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-600 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-orange-400" />
            <span>{t('admin.orders')}</span>
          </Link>
        </div>
      </div>

      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">{t('admin.totalSales')}</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {(stats?.totalSales || 0).toFixed(2)}
            </span>
            <span className="text-[10px] font-bold text-orange-600">{t('common.currency')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">{t('admin.totalOrders')}</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats?.totalOrders || 0}
            </span>
            <span className="text-[10px] text-slate-400">{isArabic ? 'طلب شراء' : 'purchase orders'}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">{t('admin.totalCustomers')}</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats?.totalCustomers || 0}
            </span>
            <span className="text-[10px] text-slate-400">{isArabic ? 'مقاول مسجل' : 'registered contractors'}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">{t('admin.totalProducts')}</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {stats?.totalProducts || 0}
            </span>
            <span className="text-[10px] text-slate-400">{isArabic ? 'صنف معتمد' : 'catalog items'}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 block">{t('admin.lowStockCount')}</span>
            <span className="text-2xl font-black text-amber-600 mt-1 block">
              {stats?.lowStockCount || 0}
            </span>
            <span className="text-[10px] text-amber-600 font-semibold">{isArabic ? 'يحتاج إعادة توريد' : 'needs restock'}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. Main Content Grid: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span>{t('admin.recentOrders')}</span>
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>{isArabic ? 'عرض كل الطلبات' : 'View All'}</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3 text-start">{t('checkout.orderNumber')}</th>
                  <th className="py-2.5 px-3 text-start">{t('checkout.fullName')}</th>
                  <th className="py-2.5 px-3 text-start">{t('checkout.paymentMethod')}</th>
                  <th className="py-2.5 px-3 text-start">{t('admin.orders')} Total</th>
                  <th className="py-2.5 px-3 text-start">{t('admin.updateStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      <Link to="/admin/orders" className="hover:text-orange-600">
                        {ord.order_number}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{ord.customer_name}</td>
                    <td className="py-3 px-3 text-slate-500">{ord.payment_status}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {parseFloat(ord.total_amount).toFixed(2)} {t('common.currency')}
                    </td>
                    <td className="py-3 px-3">
                      <OrderStatusBadge status={ord.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist (1 Column) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-amber-500" />
              <span>{t('admin.lowStockCount')}</span>
            </h2>
            <Link
              to="/admin/inventory"
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              {isArabic ? 'المخزون' : 'Inventory'}
            </Link>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((p) => {
                const name = isArabic && p.name_ar ? p.name_ar : p.name_en;
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image_url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80'}
                        alt={name}
                        className="w-10 h-10 rounded-lg object-cover border"
                      />
                      <div>
                        <span className="font-bold text-xs text-slate-900 line-clamp-1" title={name}>
                          {name}
                        </span>
                        <span className="text-[10px] text-amber-700 font-semibold block">
                          {isArabic ? 'المتبقي:' : 'Stock:'} {p.stock_quantity} {p.unit}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/admin/inventory"
                      className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold hover:bg-amber-700 transition-colors"
                    >
                      {t('admin.adjustStock')}
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>{isArabic ? 'جميع مستويات المخزون كافية ومستقرة' : 'All product stock levels healthy'}</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
