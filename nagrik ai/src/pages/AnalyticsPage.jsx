import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { BarChart2, CheckCircle2, Clock, Building2, MapPin, Layers } from 'lucide-react';
import { MUNICIPAL_WARDS } from '../services/storage';
import { CIVIC_CATEGORIES } from '../services/aiService';

export function AnalyticsPage({ complaints }) {
  // 1. Category Count
  const categoryCount = {};
  complaints.forEach(c => {
    const cat = c.categoryName.split('&')[0].trim();
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCount).map(([name, count]) => ({
    name,
    count
  }));

  const PALETTE = ['#1e3a8a', '#2563eb', '#15803d', '#d97706', '#dc2626', '#475569'];

  // 2. Status Data
  const statusData = [
    { name: 'Submitted', count: complaints.filter(c => c.status === 'Submitted').length, fill: '#94a3b8' },
    { name: 'Under Review', count: complaints.filter(c => c.status === 'Under Review').length, fill: '#3b82f6' },
    { name: 'Assigned', count: complaints.filter(c => c.status === 'Assigned').length, fill: '#6366f1' },
    { name: 'In Progress', count: complaints.filter(c => c.status === 'In Progress').length, fill: '#f59e0b' },
    { name: 'Resolved', count: complaints.filter(c => c.status === 'Resolved').length, fill: '#15803d' }
  ];

  // 3. Ward Data
  const wardData = MUNICIPAL_WARDS.map(w => {
    const list = complaints.filter(c => (c.ward || c.location?.ward) === w.name);
    const resolved = list.filter(c => c.status === 'Resolved').length;
    return {
      name: w.name.split('-')[0].trim(),
      fullName: w.name,
      zone: w.zone,
      total: list.length,
      resolved,
      active: list.length - resolved
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-300 p-2.5 rounded shadow-md text-xs space-y-1">
          <p className="font-bold text-slate-900">{label || payload[0]?.name}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.fill || entry.color || '#1e3a8a' }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
          <BarChart2 className="w-4 h-4" />
          <span>Municipal Open Data & Performance</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          City Grievance & Ward Analytics
        </h1>
        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
          Aggregated statistics based on active local municipal complaint records. Transparent public monitoring of department workloads and resolution progression.
        </p>
      </div>

      {/* Row 1: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Complaints by Category
            </h3>
            <span className="text-[11px] text-slate-500">Distribution across municipal divisions</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} 
                />
                <span className="text-slate-600 truncate">{cat.name}:</span>
                <span className="font-bold text-slate-900">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Funnel Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Resolution Pipeline Status
            </h3>
            <span className="text-[11px] text-slate-500">Volume of grievances across operational stages</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748B" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Complaints" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Ward Performance Table */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ward-Level Grievance Distribution
            </h3>
            <span className="text-[11px] text-slate-500">Breakdown of active vs resolved grievances by administrative ward</span>
          </div>
          <span className="text-xs text-slate-500">6 Municipal Wards</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <th className="py-2.5 px-4">Municipal Ward</th>
                <th className="py-2.5 px-4">Zone</th>
                <th className="py-2.5 px-4">Total Registered</th>
                <th className="py-2.5 px-4">Active Underway</th>
                <th className="py-2.5 px-4">Resolved</th>
                <th className="py-2.5 px-4">Resolution Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wardData.map((w, i) => {
                const pct = w.total > 0 ? Math.round((w.resolved / w.total) * 100) : 0;
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{w.fullName}</td>
                    <td className="py-2.5 px-4 text-slate-600">{w.zone} Zone</td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">{w.total}</td>
                    <td className="py-2.5 px-4 font-mono text-amber-700 font-semibold">{w.active}</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-700 font-semibold">{w.resolved}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-slate-600">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
