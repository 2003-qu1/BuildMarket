import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  ShoppingCart, 
  User, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut, 
  Package, 
  PhoneCall 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isArabic = i18n.language?.startsWith('ar');

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg border-b border-slate-800">
      {/* Top micro bar for store contact & quick benefits */}
      <div className="bg-slate-950 py-1.5 px-4 text-xs text-slate-400 border-b border-slate-800/80 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-orange-400 font-medium">
              <PhoneCall className="w-3.5 h-3.5" /> +966 50 123 4567
            </span>
            <span className="text-slate-500">|</span>
            <span>{isArabic ? 'توريد مواد بناء مباشرة للمواقع والمشاريع' : 'Direct construction site delivery & bulk orders'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-medium">{t('checkout.cod')}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 group-hover:bg-orange-600 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">
                {t('brand.name')}
              </span>
              <span className="text-[11px] text-orange-400 font-medium block">
                {t('brand.tagline')}
              </span>
            </div>
          </Link>

          {/* Search bar on desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 rounded-xl ps-10 pe-4 py-2.5 text-sm border border-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
              <button 
                type="submit" 
                aria-label="Search"
                className="absolute inset-y-0 start-0 ps-3.5 flex items-center text-slate-400 hover:text-orange-400"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-slate-200 hover:text-orange-400 transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/products" className="text-slate-200 hover:text-orange-400 transition-colors">
              {t('nav.products')}
            </Link>
            <Link to="/contact" className="text-slate-200 hover:text-orange-400 transition-colors">
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Action buttons: Lang, Cart, Auth */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 flex items-center"
              aria-label={t('nav.cart')}
            >
              <ShoppingCart className="w-5 h-5 text-orange-400" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-900">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Account / Auth Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700 text-sm font-medium"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-600/30 text-orange-400 flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">{user.name}</span>
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute end-0 mt-2 w-52 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fadeIn"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400">{user.email}</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-orange-500" />
                        {t('nav.admin')}
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      {t('nav.profile')}
                    </Link>

                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      {t('nav.myOrders')}
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-start"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-sm"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative w-full pb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full bg-slate-800 text-white placeholder-slate-400 rounded-xl ps-10 pe-4 py-2.5 text-sm border border-slate-700"
              />
              <Search className="w-4 h-4 absolute inset-y-0 start-0 ps-3.5 flex items-center text-slate-400 top-2.5" />
            </form>

            <nav className="flex flex-col space-y-1 font-medium">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-orange-400"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-orange-400"
              >
                {t('nav.products')}
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-orange-400"
              >
                {t('nav.contact')}
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-orange-400 hover:bg-slate-800 font-bold"
                >
                  {t('nav.admin')}
                </Link>
              )}
            </nav>

            {!user && (
              <div className="pt-2 flex flex-col gap-2 border-t border-slate-800">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-white"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-orange-500 text-white"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
