import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  variant?: 'primary' | 'secondary' | 'accent' | 'default' | string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  description,
  icon: Icon,
  color = 'blue',
  variant,
}) => {
  const sub = description || subtitle;

  // Map variant to color if provided
  let effectiveColor: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' = color;
  if (variant === 'primary') effectiveColor = 'blue';
  else if (variant === 'secondary') effectiveColor = 'emerald';
  else if (variant === 'accent') effectiveColor = 'rose';
  else if (variant === 'default') effectiveColor = 'amber';

  const colorStyles = {
    blue: {
      bg: 'bg-dps-50',
      text: 'text-dps-600',
      border: 'border-dps-200/60',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200/60',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200/60',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-200/60',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200/60',
    },
  };

  const style = colorStyles[effectiveColor];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-xl ${style.bg} ${style.border} border ${style.text}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

