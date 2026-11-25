import React from 'react';
import { 
  Construction, 
  Trash2, 
  Droplets, 
  Zap, 
  Trees, 
  AlertTriangle, 
  HelpCircle 
} from 'lucide-react';

export function CategoryIcon({ category, size = 'md', className = '' }) {
  const iconMap = {
    roads: { icon: Construction, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    waste: { icon: Trash2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    water: { icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    electricity: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    parks: { icon: Trees, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    traffic: { icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    other: { icon: HelpCircle, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' }
  };

  const config = iconMap[category] || iconMap.other;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5 text-xs',
    md: 'w-9 h-9 p-2 text-sm',
    lg: 'w-12 h-12 p-3 text-lg'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`rounded-xl border flex items-center justify-center ${config.bg} ${sizeClasses[size]} ${className}`}>
      <IconComponent className={`${iconSizes[size]} ${config.color}`} />
    </div>
  );
}

