import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

export function StatusBadge({ status, size = 'sm' }) {
  const configs = {
    'Submitted': {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-400',
      icon: Clock,
      label: 'Submitted'
    },
    'Under Review': {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
      icon: Clock,
      label: 'Under Review'
    },
    'Assigned': {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-500',
      icon: AlertCircle,
      label: 'Assigned to Ward'
    },
    'In Progress': {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      dot: 'bg-amber-500',
      icon: Clock,
      label: 'In Progress'
    },
    'Resolved': {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dot: 'bg-emerald-600',
      icon: CheckCircle2,
      label: 'Resolved'
    },
    'Closed': {
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      icon: CheckCircle2,
      label: 'Closed'
    }
  };

  const config = configs[status] || configs['Submitted'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium'
  };

  return (
    <span className={`inline-flex items-center rounded border ${config.bg} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const configs = {
    'Emergency': 'bg-red-50 text-red-700 border-red-300 font-semibold',
    'High': 'bg-orange-50 text-orange-700 border-orange-200 font-medium',
    'Medium': 'bg-slate-100 text-slate-700 border-slate-200',
    'Low': 'bg-slate-50 text-slate-600 border-slate-200'
  };

  const style = configs[priority] || configs['Medium'];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${style}`}>
      {priority === 'Emergency' && <ShieldAlert className="w-3 h-3 mr-1 text-red-600" />}
      {priority}
    </span>
  );
}
