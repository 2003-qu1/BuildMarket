import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, LogIn, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isArabic = i18n.language?.startsWith('ar');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          const from = location.state?.from?.pathname || '/profile';
          navigate(from);
        }
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 space-y-6">
      
      {/* Brand Icon & Heading */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-orange-500/25">
          <Building2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t('account.signInTitle')}
        </h1>
        <p className="text-xs text-slate-500">
          {isArabic ? 'سجل دخولك لمتابعة طلبات التوريد أو إدارة المتجر' : 'Access your contractor account or admin console'}
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        
        {error && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('account.email')} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('account.password')} *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? t('common.loading') : t('account.submitSignIn')}</span>
          </button>
        </form>

        {/* Demo Quick Fill Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {isArabic ? 'بيانات تجريبية سريعة:' : 'Quick Demo Credentials:'}
          </span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@buildmarket.com', 'admin123')}
              className="w-full text-start p-2 rounded-lg bg-white border border-slate-200 hover:border-orange-500 text-xs transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800 block">Admin (Owner)</span>
                <span className="text-slate-400 font-mono text-[11px]">admin@buildmarket.com</span>
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Fill</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('ahmed@example.com', 'admin123')}
              className="w-full text-start p-2 rounded-lg bg-white border border-slate-200 hover:border-orange-500 text-xs transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800 block">Customer (Ahmed)</span>
                <span className="text-slate-400 font-mono text-[11px]">ahmed@example.com</span>
              </div>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Fill</span>
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="pt-2 text-center text-xs text-slate-500">
          <span>{t('account.noAccount')} </span>
          <Link to="/register" className="font-bold text-orange-600 hover:underline">
            {t('account.signUpTitle')}
          </Link>
        </div>

      </div>

    </div>
  );
}
