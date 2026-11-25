import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Camera, 
  FileCheck2, 
  ChevronRight,
  AlertTriangle,
  HelpCircle,
  Phone
} from 'lucide-react';
import { COMPLAINT_CATEGORIES } from '../services/complaintsService';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';

export function PublicHomePage({ 
  setActivePage, 
  setSelectedComplaintId, 
  complaints = [],
  onOpenAssistant = null
}) {
  const [quickTrackId, setQuickTrackId] = useState('');

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      setSelectedComplaintId(quickTrackId.trim().toUpperCase());
      setActivePage('track');
    }
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* 1. HERO SECTION */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
              <span>Centralized Civic Redressal & City Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your City. Your Voice. <br />
              <span className="text-blue-900">Your Change.</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              NAGRIK AI enables citizens to report road hazards, water leaks, uncollected waste, and electrical faults through a transparent digital platform. Track work orders in real-time with verified on-site inspection photos.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActivePage('report')}
                className="py-3 px-6 rounded bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition-colors text-center"
              >
                Report an Issue
              </button>

              <button
                type="button"
                onClick={() => setActivePage('track')}
                className="py-3 px-6 rounded border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs transition-colors text-center"
              >
                Track Your Complaint
              </button>

              {onOpenAssistant && (
                <button
                  type="button"
                  onClick={onOpenAssistant}
                  className="py-3 px-6 rounded border border-blue-900 bg-blue-50 hover:bg-blue-100 text-blue-950 font-semibold text-xs transition-colors text-center inline-flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ask AI Civic Assistant</span>
                </button>
              )}
            </div>

            {/* Quick Track Input Bar */}
            <div className="pt-4 max-w-xl">
              <span className="text-xs font-semibold text-slate-700 block mb-1.5">
                Have an existing reference ID?
              </span>
              <form onSubmit={handleQuickTrack} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quickTrackId}
                    onChange={(e) => setQuickTrackId(e.target.value)}
                    placeholder="Enter ID e.g. NAG-2026-7842B109"
                    className="w-full text-xs font-mono uppercase rounded border border-slate-300 pl-9 pr-3 py-2 text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2 px-4 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Track
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-4 mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 block mb-1">
            Accountable Redressal Workflow
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            How NAGRIK AI Operates
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            A 4-step verifiable workflow connecting citizen photographic reports directly to municipal ward work orders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <span className="text-blue-900 font-mono font-bold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Step 01
            </span>
            <h3 className="text-sm font-bold text-slate-900">1. Citizen Reports</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Capture a photograph and specify location. Coordinates are captured via GPS and verified on OpenStreetMap.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <span className="text-blue-900 font-mono font-bold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Step 02
            </span>
            <h3 className="text-sm font-bold text-slate-900">2. AI Triage & Department Route</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini AI models assist by estimating severity, detecting recurring hotspots, and routing to the correct department.
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <span className="text-blue-900 font-mono font-bold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Step 03
            </span>
            <h3 className="text-sm font-bold text-slate-900">3. Field Crew Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Municipal control desk allocates work orders to ward teams (PWD, Sanitation, Water Board, or DISCOM).
            </p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <span className="text-blue-900 font-mono font-bold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Step 04
            </span>
            <h3 className="text-sm font-bold text-slate-900">4. Verified Resolution Proof</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Officers upload on-site completion photos. Citizens receive SMS notifications and inspect before/after proofs.
            </p>
          </div>
        </div>
      </section>

      {/* 3. 10 COMPLAINT CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-4 mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 block mb-1">
            Service Coverage
          </span>
          <h2 className="text-2xl font-bold text-slate-900">
            Standard Civic Issue Categories
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Ten official civic grievance classifications handled across municipal and state public utility departments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COMPLAINT_CATEGORIES.map((cat, idx) => (
            <div 
              key={cat.id} 
              onClick={() => setActivePage('report')}
              className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer shadow-sm transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">{String(idx + 1).padStart(2, '0')}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">{cat.name}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-2">
                {cat.subcategories.slice(0, 2).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PLATFORM BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white p-8 rounded-lg space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Why NAGRIK AI
            </span>
            <h2 className="text-2xl font-bold">
              Built for Citizen Empowerment and City Accountability
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Traditional grievance cells lose paperwork and leave residents without updates. NAGRIK AI establishes a permanent digital ledger for public infrastructure maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-1.5">
              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider block">No Paperwork Lost</span>
              <p className="text-xs text-slate-300">
                Every grievance receives a unique reference ID recorded into Cloud Firestore with immutable audit timestamps.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider block">Photo Verification</span>
              <p className="text-xs text-slate-300">
                Resolutions require mandatory photographic proof from ward field crews before tickets can be marked closed.
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-blue-400 font-bold text-xs uppercase tracking-wider block">Transparent Metrics</span>
              <p className="text-xs text-slate-300">
                Department workloads, active repairs, and resolution rates are visible to everyone on the public ledger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RECENT ACTUAL COMPLAINTS */}
      {complaints.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 block">
                Public Transparency Feed
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Public Grievances on Record
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('feed')}
              className="text-xs text-blue-900 font-semibold hover:underline"
            >
              View All Complaints
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {complaints.slice(0, 3).map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  setSelectedComplaintId(item.id);
                  setActivePage('track');
                }}
                className="bg-white p-4 rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer shadow-sm transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-blue-900">{item.id}</span>
                  <StatusBadge status={item.status} size="sm" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>{item.ward?.split('-')?.[0]}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

