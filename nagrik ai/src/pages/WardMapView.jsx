import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Sparkles,
  ArrowRight,
  Shield,
  Building2,
  Navigation
} from 'lucide-react';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import { CITY_WARDS } from '../services/storage';

export function WardMapView({ complaints, setActivePage, setSelectedComplaintId }) {
  const [selectedWard, setSelectedWard] = useState('ALL');
  const [selectedPin, setSelectedPin] = useState(complaints[0] || null);

  const filteredComplaints = complaints.filter(c => 
    selectedWard === 'ALL' || c.location.ward === selectedWard
  );

  const handleTrackTicket = (id) => {
    setSelectedComplaintId(id);
    setActivePage('track');
  };

  // Pre-mapped simulated map coordinates for visual layout
  const pinCoords = [
    { top: '35%', left: '48%' }, // Central
    { top: '42%', left: '68%' }, // East
    { top: '22%', left: '52%' }, // North
    { top: '65%', left: '55%' }, // South
    { top: '38%', left: '26%' }, // West
    { top: '78%', left: '75%' }, // Outer
    { top: '50%', left: '38%' },
    { top: '28%', left: '72%' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-electric">
              Geospatial City Intelligence
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/30">
              Interactive Grid
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            City Ward Heatmap & Geo-Tagged Complaints
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Inspect real-time incident pins, detect recurring danger corridors, and track active field crew locations.
          </p>
        </div>

        {/* Ward Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="bg-navy-900 border border-navy-700 text-xs text-white rounded-xl px-3.5 py-2.5 focus:border-cyan-400 focus:outline-none"
          >
            <option value="ALL">All City Wards (Overview)</option>
            {CITY_WARDS.map(w => (
              <option key={w.id} value={w.name}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map + Side Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Simulated City Map Canvas (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-4 sm:p-6 rounded-3xl relative overflow-hidden border-cyan-500/30 shadow-2xl">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-electric" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Metropolitan Municipal Grid (6 Wards)
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Critical</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>High</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Resolved</span>
              </span>
            </div>
          </div>

          {/* Map Surface */}
          <div className="w-full h-[450px] sm:h-[520px] rounded-2xl bg-navy-950 border border-navy-800 relative overflow-hidden grid-bg-pattern flex items-center justify-center">
            
            {/* Visual Ward Boundaries & Road Network lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              {/* Radial city circles */}
              <circle cx="50%" cy="45%" r="120" fill="none" stroke="#00F0FF" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
              <circle cx="50%" cy="45%" r="220" fill="none" stroke="#00F0FF" strokeWidth="1" strokeDasharray="6 6" opacity="0.1" />
              {/* Connecting arterial roads */}
              <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="#1C2541" strokeWidth="4" />
              <line x1="85%" y1="15%" x2="15%" y2="85%" stroke="#1C2541" strokeWidth="4" />
              <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="#00F0FF" strokeWidth="2" strokeDasharray="3 3" opacity="0.3" />
              <line x1="5%" y1="45%" x2="95%" y2="45%" stroke="#00F0FF" strokeWidth="2" strokeDasharray="3 3" opacity="0.3" />
            </svg>

            {/* Ward Zones Watermarks */}
            <div className="absolute top-1/4 left-1/4 text-[11px] font-mono font-bold text-slate-700 tracking-widest pointer-events-none uppercase">
              North Commercial
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-mono font-extrabold text-cyan-electric/25 tracking-widest pointer-events-none uppercase">
              Central Hub
            </div>
            <div className="absolute bottom-1/4 left-1/3 text-[11px] font-mono font-bold text-slate-700 tracking-widest pointer-events-none uppercase">
              South Layouts
            </div>
            <div className="absolute top-1/3 right-1/4 text-[11px] font-mono font-bold text-slate-700 tracking-widest pointer-events-none uppercase">
              East Tech Corridor
            </div>

            {/* Interactive Complaint Pins */}
            {filteredComplaints.map((item, idx) => {
              const pos = pinCoords[idx % pinCoords.length];
              const isSelected = selectedPin?.id === item.id;
              const isCritical = item.severity === 'Critical';
              const isResolved = item.status === 'Resolved';

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedPin(item)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  title={`${item.id}: ${item.title}`}
                >
                  {/* Ping effect for critical */}
                  {isCritical && !isResolved && (
                    <span className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-rose-500/50 animate-ping pointer-events-none" />
                  )}

                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${
                    isResolved 
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300' 
                      : isCritical 
                      ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-rose-950' 
                      : item.severity === 'High' 
                      ? 'bg-orange-950 border-orange-400 text-orange-300' 
                      : 'bg-cyan-950 border-cyan-400 text-cyan-300'
                  } ${isSelected ? 'ring-4 ring-cyan-electric/50 scale-110' : ''}`}>
                    <MapPin className="w-4 h-4" />
                  </div>

                  {/* Hover Tag */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-navy-950 border border-cyan-500/40 px-2 py-1 rounded-lg text-[10px] text-white font-mono shadow-xl z-40 pointer-events-none">
                    {item.id} • {item.severity}
                  </div>
                </button>
              );
            })}

            {/* Map Legend Overlay in bottom corner */}
            <div className="absolute bottom-3 left-3 bg-navy-900/90 backdrop-blur-md p-2.5 rounded-xl border border-navy-800 text-[10px] text-slate-400 space-y-1 z-10">
              <div className="font-bold text-white">Interactive City GIS</div>
              <div>Click any pin to inspect ticket details</div>
            </div>

          </div>
        </div>

        {/* Right: Selected Pin Details Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {selectedPin ? (
            <div className="glass-panel p-6 rounded-3xl border-cyan-500/30 space-y-5 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                <span className="font-mono text-xs font-bold text-cyan-electric">
                  {selectedPin.id}
                </span>
                <StatusBadge status={selectedPin.status} size="sm" />
              </div>

              {/* Thumbnail */}
              {selectedPin.imageUrl && (
                <div className="w-full h-40 rounded-xl overflow-hidden bg-navy-950 border border-navy-800">
                  <img src={selectedPin.imageUrl} alt={selectedPin.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Title & Category */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <CategoryIcon category={selectedPin.category} size="sm" />
                  <span className="text-xs font-bold text-cyan-300">
                    {selectedPin.categoryName}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {selectedPin.title}
                </h3>
              </div>

              {/* Severity & SLA */}
              <div className="grid grid-cols-2 gap-2 bg-navy-950/70 p-3 rounded-xl border border-navy-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Severity</span>
                  <SeverityBadge severity={selectedPin.severity} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SLA Target</span>
                  <span className="text-xs font-mono font-bold text-white mt-1 block">
                    {selectedPin.estimatedSla}
                  </span>
                </div>
              </div>

              {/* Location details */}
              <div className="text-xs text-slate-300 space-y-1 bg-navy-950/50 p-3 rounded-xl border border-navy-800">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{selectedPin.location.address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] pt-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span>{selectedPin.department}</span>
                </div>
              </div>

              {/* Direct Track Button */}
              <button
                onClick={() => handleTrackTicket(selectedPin.id)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-navy-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-cyan-electric transition-all flex items-center justify-center gap-2"
              >
                <span>View Full Ticket & Audit History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 text-xs">
              Select a pin on the city map to inspect details.
            </div>
          )}

          {/* Civic Corridor Notice */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Smart Ward Auto-Clustering</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When 3 or more citizens lodge reports within 200m of the same road stretch, NAGRIK AI automatically designates an elevated Priority Civic Corridor.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

