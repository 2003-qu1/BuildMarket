import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  X, 
  Clock, 
  Truck, 
  CreditCard, 
  MapPin, 
  Phone 
} from 'lucide-react';
import api from '../../api/client';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminOrders() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected order for detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/orders/admin/all?${params.toString()}`);
      if (res.data?.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const openOrderDetails = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.data?.order) {
        setSelectedOrder(res.data.order);
      }
    } catch (err) {
      alert('Failed to load order details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t('admin.allOrders')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {orders.length} {isArabic ? 'طلبات مسجلة' : 'purchase orders in queue'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isArabic ? 'ابحث برقم الطلب، اسم العميل، أو رقم الجوال...' : 'Search by order number, customer name, phone...'}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl ps-9 pe-20 py-2.5 text-xs focus:ring-1 focus:ring-orange-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute inset-y-0 start-0 ps-3 my-auto" />
          <button
            type="submit"
            className="absolute inset-y-1 end-1 px-3.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600"
          >
            {t('common.search')}
          </button>
        </form>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            type="button"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Orders
          </button>

          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t(`admin.status.${st}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text={t('common.loading')} />
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 text-start">{t('checkout.orderNumber')}</th>
                  <th className="py-3 px-4 text-start">{t('checkout.fullName')}</th>
                  <th className="py-3 px-4 text-start">Date</th>
                  <th className="py-3 px-4 text-start">Total Amount</th>
                  <th className="py-3 px-4 text-start">Payment</th>
                  <th className="py-3 px-4 text-start">{t('admin.updateStatus')}</th>
                  <th className="py-3 px-4 text-end">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Order Number */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ord.order_number}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{ord.customer_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono" dir="ltr">{ord.customer_phone}</span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(ord.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">
                        {parseFloat(ord.total_amount).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-orange-600 font-bold ms-1">{t('common.currency')}</span>
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-4 text-[11px] text-slate-600">
                      <span className="block font-medium">{ord.payment_method}</span>
                      <span className={`text-[10px] font-bold ${ord.payment_status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {ord.payment_status}
                      </span>
                    </td>

                    {/* Quick Status Select */}
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                        disabled={updatingStatus}
                        className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:ring-1 focus:ring-orange-500"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {t(`admin.status.${s}`)}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-end">
                      <button
                        onClick={() => openOrderDetails(ord.id)}
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            No orders match the selected filter.
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Order Details</span>
                <h2 className="text-lg font-mono font-bold text-slate-900">{selectedOrder.order_number}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Customer & Delivery Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Customer</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.customer_name}</p>
                  <p className="text-slate-600 font-mono" dir="ltr">{selectedOrder.customer_phone}</p>
                  <p className="text-slate-400">{selectedOrder.customer_email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Delivery Location</span>
                  <p className="font-bold text-slate-900">{selectedOrder.city}</p>
                  <p className="text-slate-600">{selectedOrder.shipping_address}</p>
                  {selectedOrder.notes && (
                    <p className="text-amber-700 font-medium bg-amber-50 p-2 rounded-lg mt-1">
                      <strong>Notes:</strong> {selectedOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Updater */}
              <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-orange-800 uppercase block">Current Order Status</span>
                  <div className="mt-1">
                    <OrderStatusBadge status={selectedOrder.status} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    disabled={updatingStatus}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {t(`admin.status.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ordered Items Table */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase text-[10px] block">Ordered Materials</span>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-start">
                    <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] border-b">
                      <tr>
                        <th className="py-2.5 px-3 text-start">Material</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-end">Unit Price</th>
                        <th className="py-2.5 px-3 text-end">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items?.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-800 block">
                              {isArabic && it.product_name_ar ? it.product_name_ar : it.product_name_en}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{it.sku}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-end">{parseFloat(it.unit_price).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-end font-bold text-slate-900">
                            {parseFloat(it.total_price).toFixed(2)} {t('common.currency')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-end">
                <div className="text-slate-500">
                  <span>Subtotal: </span>
                  <span className="font-semibold text-slate-800">{parseFloat(selectedOrder.subtotal).toFixed(2)} {t('common.currency')}</span>
                </div>
                <div className="text-slate-500">
                  <span>Delivery Fee: </span>
                  <span className="font-semibold text-slate-800">{parseFloat(selectedOrder.delivery_fee).toFixed(2)} {t('common.currency')}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 pt-1 border-t">
                  <span>Grand Total: </span>
                  <span className="text-base text-orange-600">{parseFloat(selectedOrder.total_amount).toFixed(2)} {t('common.currency')}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 text-xs font-semibold bg-slate-800 text-white rounded-xl hover:bg-slate-700"
              >
                {t('common.close')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
