import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Lock, 
  Phone, 
  Mail 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import OrderStatusBadge from '../components/admin/OrderStatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const isArabic = i18n.language?.startsWith('ar');
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await api.get('/orders/my-orders');
        if (res.data?.orders) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Failed to load my orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });

    try {
      const payload = { name, phone };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const res = await updateUserProfile(payload);
      if (res.success) {
        setProfileMsg({ type: 'success', text: isArabic ? 'تم تحديث الملف الشخصي بنجاح.' : 'Profile updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setProfileMsg({ type: 'error', text: res.message });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner Profile Summary */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{user?.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-orange-400 border border-slate-700">
                {user?.role === 'admin' ? 'Store Administrator' : 'Verified Contractor'}
              </span>
              {user?.phone && (
                <span className="text-xs text-slate-400 font-mono" dir="ltr">{user?.phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 w-full sm:w-auto">
          <button
            onClick={() => setSearchParams({ tab: 'orders' })}
            type="button"
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'orders'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('account.myOrders')}</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'profile' })}
            type="button"
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'profile'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('account.profileTitle')}</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* Tab 1: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              <span>{t('account.myOrders')}</span>
            </h2>
            <span className="text-xs text-slate-500">
              {orders.length} {isArabic ? 'طلبات مسجلة' : 'total orders'}
            </span>
          </div>

          {loadingOrders ? (
            <LoadingSpinner text={t('common.loading')} />
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono font-bold text-base text-slate-900">
                        {ord.order_number}
                      </span>
                      <OrderStatusBadge status={ord.status} />
                      <span className="text-xs text-slate-400">
                        {new Date(ord.created_at).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span><strong>{isArabic ? 'الموقع' : 'Site'}:</strong> {ord.city} – {ord.shipping_address}</span>
                      <span><strong>{isArabic ? 'الدفع' : 'Payment'}:</strong> {ord.payment_method} ({ord.payment_status})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                    <div className="text-end">
                      <span className="text-xs text-slate-400 block">{t('cart.grandTotal')}</span>
                      <span className="text-lg font-extrabold text-slate-900">
                        {parseFloat(ord.total_amount).toFixed(2)}
                      </span>
                      <span className="text-xs font-bold text-orange-600 ms-1">{t('common.currency')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">{t('account.noOrders')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isArabic ? 'لم تقم بتقديم طلبات شراء حتى الآن. تصفح المتجر لطلب الإسمنت أو الحديد أو مواد البناء.' : 'Browse our store catalog to purchase building materials.'}
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-xs hover:bg-orange-600 transition-colors shadow-sm"
              >
                {t('cart.startShopping')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-orange-500" />
            <span>{t('account.profileTitle')}</span>
          </h2>

          {profileMsg.text && (
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('account.fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('account.email')} (Read-Only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('account.phone')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                dir="ltr"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 block">
                {isArabic ? 'تغيير كلمة المرور (اختياري)' : 'Change Password (Optional)'}
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 characters)"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md transition-all disabled:opacity-50"
            >
              {savingProfile ? t('common.loading') : t('common.save')}
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
