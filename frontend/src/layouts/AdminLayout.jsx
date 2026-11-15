import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return t('admin.dashboard');
    if (path.includes('/products')) return t('admin.products');
    if (path.includes('/categories')) return t('admin.categories');
    if (path.includes('/orders')) return t('admin.orders');
    if (path.includes('/customers')) return t('admin.customers');
    if (path.includes('/inventory')) return t('admin.inventory');
    if (path.includes('/reports')) return t('admin.reports');
    return t('admin.dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={getTitle()}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
