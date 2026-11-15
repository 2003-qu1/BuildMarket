import React from 'react';
import { useTranslation } from 'react-i18next';

export default function OrderStatusBadge({ status }) {
  const { t } = useTranslation();

  const styles = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    Processing: 'bg-purple-50 text-purple-700 border-purple-200',
    Shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200'
  };

  const style = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = t(`admin.status.${status}`) || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current me-1.5 opacity-80" />
      {label}
    </span>
  );
}
