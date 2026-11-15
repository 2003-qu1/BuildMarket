import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  Building2, 
  Truck 
} from 'lucide-react';

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          <span>{isArabic ? 'خدمة المقاولين والمشاريع' : 'Contractor & Site Services'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t('contact.title')}
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          {t('contact.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Information Cards */}
        <div className="space-y-4">
          
          {/* Phone */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 rounded-xl bg-orange-50 text-orange-600 flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('contact.phone')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isArabic ? 'اتصال مباشر بفريق مبيعات البناء' : 'Direct line to our sales engineers'}
              </p>
              <a
                href="tel:+966501234567"
                dir="ltr"
                className="inline-block mt-2 text-sm font-bold text-orange-600 hover:underline"
              >
                +966 50 123 4567
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('contact.whatsapp')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isArabic ? 'إرسال جداول الكميات والتسعير الفوري' : 'Send material takeoffs & site location'}
              </p>
              <a
                href="https://wa.me/966501234567"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isArabic ? 'محادثة واتساب فورية' : 'Chat on WhatsApp'}</span>
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700 flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('contact.address')}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {t('contact.addressVal')}
              </p>
            </div>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-700 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{t('contact.hours')}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {t('contact.hoursVal')}
              </p>
            </div>
          </div>

        </div>

        {/* Contact Inquiry Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {t('contact.formTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isArabic 
                ? 'أرسل تفاصيل مشروعك والمواد المطلوبة وسنقوم بالرد بعرض تسعير رسمي.' 
                : 'Submit your bill of quantities and we will respond with an official quote.'}
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-2xl border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{t('contact.successMsg')}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('contact.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Eng. Abdullah"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('contact.email')} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="site@contractor.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('contact.subject')} *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={isArabic ? 'طلب توريد حديد وإسمنت لمشروع سكني في الرياض' : 'Supply request for rebar and cement in Riyadh'}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('contact.message')} *
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={isArabic ? 'حدد الكميات التقريبية بالطن أو الأكياس أو التريلات وموقع التسليم...' : 'Describe required quantities, site location, delivery timeline...'}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <button
              type="submit"
              className="px-7 py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>{t('contact.send')}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
