import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  Users, 
  Warehouse, 
  BarChart3, 
  ArrowLeft, 
  Building2 
} from 'lucide-react';

export default function AdminSidebar({ mobileOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: t('admin.dashboard'), end: true },
    { to: '/admin/products', icon: Package, label: t('admin.products') },
    { to: '/admin/categories', icon: Layers, label: t('admin.categories') },
    { to: '/admin/orders', icon: ShoppingBag, label: t('admin.orders') },
    { to: '/admin/customers', icon: Users, label: t('admin.customers') },
    { to: '/admin/inventory', icon: Warehouse, label: t('admin.inventory') },
    { to: '/admin/reports', icon: BarChart3, label: t('admin.reports') },
  ];

  const content = (
    <div className="h-full flex flex-col justify-between bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      <div>
        {/* Brand header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-base leading-none block">Build Market</span>
              <span className="text-[10px] text-orange-400 font-medium">{t('admin.dashboard')}</span>
            </div>
          </Link>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white font-semibold shadow-sm shadow-orange-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom link: Return to website */}
      <div className="p-4 border-t border-slate-800">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-400 hover:text-orange-400 transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`} />
          <span>{t('admin.backToStore')}</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
          <div className="relative z-10">{content}</div>
        </div>
      )}
    </>
  );
}
