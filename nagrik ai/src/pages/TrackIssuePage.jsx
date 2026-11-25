import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Phone, 
  Building2, 
  Calendar, 
  Sparkles, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileText,
  Activity,
  Layers,
  Camera
} from 'lucide-react';
import { StatusBadge, SeverityBadge } from '../components/StatusBadge';
import { CategoryIcon } from '../components/CategoryIcon';
import { submitCitizenFeedback } from '../services/storage';

export function TrackIssuePage({ 
  complaints, 
  selectedComplaintId, 
  setSelectedComplaintId, 
  setActivePage,
  onFeedbackSubmitted
}) {
  const [searchInput, setSearchInput] = useState(selectedComplaintId || '');
  const [copied, setCopied] = useState(false);
  
  // Feedback form state for resolved tickets
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmittedSuccess, setFeedbackSubmittedSuccess] = useState(false);

  // Find active ticket
  const currentTicketId = selectedComplaintId || searchInput.trim().toUpperCase() || complaints[0]?.id;
  const activeTicket = complaints.find(
    c => c.id.toUpperCase() === currentTicketId.trim().toUpperCase()
  ) || null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedComplaintId(searchInput.trim().toUpperCase());
    }
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!activeTicket) return;
    const updated = submitCitizenFeedback(activeTicket.id, rating, feedbackComment);
    setFeedbackSubmittedSuccess(true);
    if (onFeedbackSubmitted) onFeedbackSubmitted(updated);
  };

  // Stepper milestones
  const steps = [
    { key: 'Submitted', label: '1. Registered' },
    { key: 'AI Classified', label: '2. AI Triage' },
    { key: 'Assigned', label: '3. Ward Assigned' },
    { key: 'In Progress', label: '4. Work Underway' },
    { key: 'Resolved', label: '5. Resolved' }
  ];

  const getStepStatus = (stepKey) => {
    if (!activeTicket) return 'pending';
    const timeline = activeTicket.timeline || [];
    const eventExists = timeline.some(t => t.status === stepKey || (stepKey === 'Assigned' && (activeTicket.status === 'Assigned' || activeTicket.status === 'In Progress' || activeTicket.status === 'Resolved')) || (stepKey === 'In Progress' && (activeTicket.status === 'In Progress' || activeTicket.status === 'Resolved')) || (stepKey === 'Resolved' && activeTicket.status === 'Resolved'));
    
    if (activeTicket.status === 'Resolved') return 'done';
    if (stepKey === activeTicket.status) return 'current';
    return eventExists ? 'done' : 'pending';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-electric">
              Public Tracking & SLA Audit
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-500/30">
              Live Transparency
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Complaint Tracking & Resolution Lifecycle
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter your unique Complaint Reference ID to track field officer dispatch, view before/after photo evidence, and inspect the complete audit chain.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Ticket ID (e.g. NGK-2026-8492)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-sm shadow-md shadow-cyan-500/20 transition-all"
          >
            Track Status
          </button>
        </form>

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span>Quick check samples:</span>
          {complaints.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchInput(c.id);
                setSelectedComplaintId(c.id);
              }}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
                activeTicket?.id === c.id
                  ? 'bg-cyan-500/20 text-cyan-electric border border-cyan-400/50 font-bold'
                  : 'bg-navy-900 text-slate-300 hover:text-white border border-navy-800'
              }`}
            >
              {c.id} ({c.status})
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Details View */}
      {!activeTicket ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Ticket Found</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            We could not find any complaint matching "<span className="font-mono text-cyan-400">{searchInput}</span>". Please double-check your ID format or browse tickets from the Citizen Dashboard.
          </p>
          <button
            onClick={() => setActivePage('citizen')}
            className="px-5 py-2.5 rounded-xl bg-navy-800 text-cyan-electric text-xs font-semibold border border-cyan-500/30"
          >
            Browse Citizen Portal
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* 1. Main Ticket Banner Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border-cyan-500/30 space-y-6">
            
            {/* Top row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-navy-800">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopyId(activeTicket.id)}
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-950 border border-cyan-500/40 text-cyan-electric font-mono text-sm font-bold hover:border-cyan-400 transition-colors"
                >
                  <span>{activeTicket.id}</span>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-electric" />
                  )}
                </button>
                <SeverityBadge severity={activeTicket.severity} showScore score={activeTicket.urgencyScore} />
                <StatusBadge status={activeTicket.status} size="md" />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>SLA Target: <strong className="text-white">{activeTicket.estimatedSla}</strong></span>
                </span>
                <span className="hidden sm:inline">|</span>
                <span className="hidden sm:inline">
                  Logged: {new Date(activeTicket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CategoryIcon category={activeTicket.category} size="md" className="mt-1" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                    {activeTicket.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                    <span className="text-cyan-electric font-semibold">{activeTicket.categoryName}</span>
                    <span>•</span>
                    <span className="text-slate-300">{activeTicket.department}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{activeTicket.location.ward}</span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-navy-950/60 p-4 rounded-2xl border border-navy-800">
                {activeTicket.description}
              </p>
            </div>

            {/* 2. Visual Progress Stepper (Milestones) */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-4">
                Resolution Workflow Milestones
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                {steps.map((step, idx) => {
                  const status = getStepStatus(step.key);
                  return (
                    <div 
                      key={step.key}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        status === 'done' 
                          ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40' 
                          : status === 'current'
                          ? 'bg-cyan-950/60 text-cyan-electric border-cyan-400 shadow-sm shadow-cyan-500/20'
                          : 'bg-navy-950 text-slate-500 border-navy-800'
                      }`}
                    >
                      <div className="flex justify-center mb-1">
                        {status === 'done' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : status === 'current' ? (
                          <div className="w-4 h-4 rounded-full border-2 border-cyan-electric border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700" />
                        )}
                      </div>
                      <span className="text-[11px] font-bold block">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 3. Two Columns: Audit Timeline (Left) & Evidence + Officer Details (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Audit Timeline History */}
            <div className="lg:col-span-7 space-y-4">
              <div className="glass-panel p-6 rounded-3xl space-y-5">
                <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-electric" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Immutable Audit Trail & Timeline
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {activeTicket.timeline?.length || 0} Events Logged
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-navy-800">
                  {(activeTicket.timeline || []).map((event, idx) => {
                    const isLast = idx === (activeTicket.timeline.length - 1);
                    return (
                      <div key={event.id || idx} className="relative group">
                        {/* Dot */}
                        <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-navy-950 ${
                          event.type === 'success' ? 'bg-emerald-400' :
                          event.type === 'ai' ? 'bg-cyan-electric shadow-glow-cyan' :
                          event.type === 'progress' ? 'bg-amber-400' : 'bg-slate-400'
                        }`} />

                        <div className="bg-navy-950/80 p-4 rounded-2xl border border-navy-800/80 space-y-1.5 group-hover:border-cyan-500/30 transition-colors">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white">
                              {event.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(event.timestamp).toLocaleString(undefined, { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {event.description}
                          </p>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                            <User className="w-3 h-3 text-cyan-400" />
                            <span>Action Logged by: <strong className="text-slate-400">{event.officer}</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Evidence Photos & Officer Info & Feedback */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Photo Evidence Card */}
              <div className="glass-panel p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
                  <Camera className="w-4 h-4 text-cyan-electric" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Visual Evidence Inspection
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Before / Reported Photo */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-400 block">Reported Evidence:</span>
                    <div className="rounded-xl overflow-hidden bg-navy-950 border border-navy-800 h-36">
                      <img 
                        src={activeTicket.imageUrl} 
                        alt="Initial Citizen Photo" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Captured at Grievance Lodging</span>
                  </div>

                  {/* Resolution Proof Photo */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-400 block">Resolution Proof:</span>
                    <div className="rounded-xl overflow-hidden bg-navy-950 border border-navy-800 h-36 flex items-center justify-center">
                      {activeTicket.resolutionProofUrl ? (
                        <img 
                          src={activeTicket.resolutionProofUrl} 
                          alt="Field Work Complete" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="text-center p-3 text-slate-500 space-y-1">
                          <Clock className="w-5 h-5 mx-auto text-slate-600" />
                          <span className="text-[11px] block">Awaiting field completion photo</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 block">Uploaded by Ward Officer</span>
                  </div>
                </div>
              </div>

              {/* Assigned Ward Officer Details */}
              <div className="glass-panel p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-navy-800 pb-3">
                  <ShieldCheck className="w-4 h-4 text-cyan-electric" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Assigned Field Officer
                  </h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-electric font-bold text-base">
                    {activeTicket.assignedOfficer?.name ? activeTicket.assignedOfficer.name.slice(0, 2).toUpperCase() : 'WD'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {activeTicket.assignedOfficer?.name || 'Automated Queue'}
                    </h4>
                    <p className="text-xs text-slate-400 truncate">
                      {activeTicket.assignedOfficer?.designation || 'Municipal Field Engineer'}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-cyan-300 mt-1 font-mono">
                      <span>Badge: {activeTicket.assignedOfficer?.badge || 'PWD-402'}</span>
                      <span>•</span>
                      <span>{activeTicket.assignedOfficer?.phone || '+91 1800-CIVIC'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Citizen Feedback Widget */}
              <div className="glass-panel p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Citizen Verification & Rating
                    </h3>
                  </div>
                  {activeTicket.feedback && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono border border-emerald-500/30">
                      Verified
                    </span>
                  )}
                </div>

                {activeTicket.feedback ? (
                  <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-2">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-4 h-4 ${star <= activeTicket.feedback.rating ? 'fill-amber-400' : 'text-slate-600'}`} 
                        />
                      ))}
                      <span className="text-xs font-mono font-bold text-white ml-2">
                        {activeTicket.feedback.rating} / 5 Stars
                      </span>
                    </div>
                    {activeTicket.feedback.comment && (
                      <p className="text-xs text-slate-300 italic">
                        "{activeTicket.feedback.comment}"
                      </p>
                    )}
                    <span className="text-[10px] text-slate-500 block">
                      Citizen confirmed satisfactory on-site resolution.
                    </span>
                  </div>
                ) : activeTicket.status === 'Resolved' ? (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    <p className="text-xs text-slate-300">
                      This grievance was marked resolved. How satisfied are you with the municipal response?
                    </p>

                    {/* Star Selector */}
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              (hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                            }`} 
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-400 ml-2">
                        {rating} Star{rating > 1 ? 's' : ''}
                      </span>
                    </div>

                    <textarea
                      rows={2}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Add remarks on work quality (e.g. prompt asphalt leveling)..."
                      className="w-full bg-navy-950 border border-navy-700 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-navy-950 font-bold text-xs shadow-md transition-all hover:brightness-110"
                    >
                      Submit Verification & Rating
                    </button>
                  </form>
                ) : (
                  <div className="p-3 rounded-xl bg-navy-950 text-slate-400 text-xs text-center space-y-1">
                    <Clock className="w-4 h-4 mx-auto text-cyan-400" />
                    <p>Citizen verification rating unlocks once the ticket status is marked "Resolved".</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

