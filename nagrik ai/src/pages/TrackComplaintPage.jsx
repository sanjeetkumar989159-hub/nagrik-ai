import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Copy, 
  Check, 
  ShieldCheck, 
  FileText,
  User,
  Building2,
  Calendar,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { subscribeComplaintById } from '../services/complaintsService';
import { CivicLeafletMap } from '../components/CivicLeafletMap';

export function TrackComplaintPage({ 
  selectedComplaintId, 
  setSelectedComplaintId, 
  setActivePage,
  currentRole,
  recentComplaints = [] 
}) {
  const [searchInput, setSearchInput] = useState(selectedComplaintId || '');
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const activeId = selectedComplaintId || searchInput.trim().toUpperCase() || recentComplaints[0]?.id;

  // Real-time Firestore subscription to this complaint document
  useEffect(() => {
    if (!activeId) return;

    setLoading(true);
    const unsubscribe = subscribeComplaintById(activeId, (data) => {
      setActiveComplaint(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedComplaintId(searchInput.trim().toUpperCase());
    }
  };

  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status workflow: Submitted -> Under Review -> Assigned -> In Progress -> Resolved (or Rejected)
  const steps = [
    { key: 'Submitted', label: '1. Submitted' },
    { key: 'Under Review', label: '2. Under Review' },
    { key: 'Assigned', label: '3. Assigned' },
    { key: 'In Progress', label: '4. In Progress' },
    { key: 'Resolved', label: '5. Resolved' }
  ];

  const isRejected = activeComplaint?.status === 'Rejected';

  const getStepStatus = (stepKey) => {
    if (!activeComplaint) return 'pending';
    const status = activeComplaint.status;
    if (isRejected) return stepKey === 'Submitted' ? 'completed' : 'pending';
    if (status === 'Resolved') return 'completed';
    if (status === stepKey) return 'active';

    const order = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepKey);
    return stepIndex <= currentIndex ? 'completed' : 'pending';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Search Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 block mb-1">
            Real-Time Grievance Tracking
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            Track Complaint Status & Audit Ledger
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Search any complaint by its unique Reference ID (`NAG-2026-XXXXXXXX`) to inspect live department assignments, on-site photos, and official administrative audit remarks.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl">
          <div className="relative flex-1">
            <label htmlFor="track-complaint-id" className="sr-only">
              Complaint Reference ID
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              id="track-complaint-id"
              type="text"
              placeholder="Enter Reference ID (e.g. NAG-2026-7842B109)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full text-xs font-mono uppercase rounded border border-slate-300 pl-9 pr-3 py-2.5 text-slate-900 placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            className="py-2.5 px-5 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Track Status
          </button>
        </form>

        {/* Quick Sample IDs */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
          <span>Recent active complaints:</span>
          {recentComplaints.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSearchInput(c.id);
                setSelectedComplaintId(c.id);
              }}
              className={`px-2 py-0.5 rounded font-mono text-[11px] border transition-colors ${
                activeComplaint?.id === c.id
                  ? 'bg-blue-50 text-blue-900 border-blue-300 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c.id} ({c.status})
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-900 mx-auto" />
          <span className="text-xs text-slate-600 block">Connecting to Firestore real-time listener...</span>
        </div>
      ) : !activeComplaint ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Complaint Not Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No complaint record matched ID "<span className="font-mono font-semibold text-slate-800">{activeId}</span>". Please check the ID or file a new grievance.
          </p>
          <button
            onClick={() => setActivePage('report')}
            className="px-4 py-2 rounded bg-blue-900 text-white text-xs font-semibold"
          >
            Report a New Civic Issue
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Record Header Card */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-5">
            
            {/* Top Bar with Reference ID and Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyId(activeComplaint.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 font-mono text-xs font-bold text-blue-900 transition-colors"
                  title="Click to copy Complaint Reference ID"
                >
                  <span>{activeComplaint.id}</span>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                </button>
                <PriorityBadge priority={activeComplaint.severity || activeComplaint.priority} />
                <StatusBadge status={activeComplaint.status} size="md" />
              </div>

              <div className="text-xs text-slate-500 font-mono">
                Submitted on: <strong className="text-slate-800">{new Date(activeComplaint.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
              </div>
            </div>

            {/* Title & Department info */}
            <div>
              <div className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">
                {activeComplaint.categoryName} • {activeComplaint.subcategory} • Assigned: {activeComplaint.departmentName}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {activeComplaint.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeComplaint.ward}</span>
                </span>
                <span>•</span>
                <span>{activeComplaint.address}</span>
                {activeComplaint.landmark && (
                  <>
                    <span>•</span>
                    <span className="text-slate-500">Landmark: {activeComplaint.landmark}</span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-slate-900 block mb-1">Citizen Statement:</span>
              {activeComplaint.description}
            </div>

            {/* Rejection Notice if applicable */}
            {isRejected && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Grievance Rejected / Closed by Authority</span>
                  <p className="text-[11px] text-red-700 mt-0.5">
                    This issue was reviewed and closed as out of municipal jurisdiction or invalid. See administrative remarks in the timeline below.
                  </p>
                </div>
              </div>
            )}

            {/* Milestone Stepper */}
            {!isRejected && (
              <div>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
                  Workflow Resolution Stepper
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {steps.map((st) => {
                    const state = getStepStatus(st.key);
                    return (
                      <div
                        key={st.key}
                        className={`p-2.5 rounded border text-center text-xs transition-colors ${
                          state === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium'
                            : state === 'active'
                            ? 'bg-blue-50 text-blue-900 border-blue-400 font-bold'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          {state === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {state === 'active' && <Clock className="w-4 h-4 text-blue-700" />}
                          {state === 'pending' && <div className="w-4 h-4 rounded-full border border-slate-300" />}
                        </div>
                        <span className="block text-[11px]">{st.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Details Grid: Left: Timeline Audit, Right: Photos & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Complete Timeline Audit Log (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-900" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Official Audit Trail & Inspection History
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {activeComplaint.timeline?.length || 0} events
                </span>
              </div>

              <div className="space-y-4">
                {(activeComplaint.timeline || []).map((ev, index) => (
                  <div key={ev.id || index} className="border-l-2 border-slate-200 pl-4 py-1 relative">
                    <div className="absolute -left-1.5 top-2 w-2.5 h-2.5 rounded-full bg-blue-900 border-2 border-white" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                      <span className="font-bold text-slate-900">{ev.title}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(ev.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {ev.remarks}
                    </p>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>Action by: <strong className="text-slate-700">{ev.officer}</strong></span>
                    </div>
                  </div>
                ))}
              </div>

              {currentRole === 'admin' && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setActivePage('admin')}
                    className="py-1.5 px-3 rounded bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800"
                  >
                    Open in Admin Management Desk
                  </button>
                </div>
              )}
            </div>

            {/* Right: Evidence Photos & Map Location (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Photographs */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                  <Camera className="w-4 h-4 text-slate-600" />
                  <span>Photographic Evidence</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Reported Incident Photo:
                    </span>
                    {activeComplaint.imageUrls?.[0] ? (
                      <div 
                        onClick={() => setModalImage(activeComplaint.imageUrls[0])}
                        className="rounded border border-slate-200 overflow-hidden h-40 bg-slate-100 cursor-pointer relative group"
                      >
                        <img 
                          src={activeComplaint.imageUrls[0]} 
                          alt="Reported evidence" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
                          Click to inspect
                        </div>
                      </div>
                    ) : (
                      <div className="h-20 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                        No photograph attached
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Field Resolution Photo Proof:
                    </span>
                    {activeComplaint.resolutionProofUrl ? (
                      <div 
                        onClick={() => setModalImage(activeComplaint.resolutionProofUrl)}
                        className="rounded border border-slate-200 overflow-hidden h-40 bg-slate-100 cursor-pointer relative group"
                      >
                        <img 
                          src={activeComplaint.resolutionProofUrl} 
                          alt="Resolution proof" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
                          Click to inspect
                        </div>
                      </div>
                    ) : (
                      <div className="h-20 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-xs text-center p-2">
                        Awaiting work order completion photo upload from field crew
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Leaflet Incident Map */}
              <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block border-b border-slate-100 pb-2">
                  Geospatial Incident Pin
                </span>
                
                {activeComplaint.latitude && activeComplaint.longitude ? (
                  <CivicLeafletMap
                    mode="view"
                    height="200px"
                    center={[activeComplaint.latitude, activeComplaint.longitude]}
                    zoom={15}
                    complaints={[activeComplaint]}
                  />
                ) : (
                  <div className="h-32 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
                    Location coordinates unavailable
                  </div>
                )}
                
                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  Coordinates: {activeComplaint.latitude?.toFixed(5)}, {activeComplaint.longitude?.toFixed(5)}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Image Zoom Modal */}
      {modalImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photographic Evidence Inspector"
          onClick={() => setModalImage(null)}
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg border border-slate-300 shadow-2xl max-w-3xl w-full overflow-hidden"
          >
            <div className="bg-slate-900 text-white p-3 flex justify-between items-center text-xs">
              <span className="font-semibold">Photographic Evidence Inspector</span>
              <button type="button" onClick={() => setModalImage(null)} className="text-slate-300 hover:text-white">
                Close
              </button>
            </div>
            <div className="max-h-[75vh] bg-black flex items-center justify-center">
              <img src={modalImage} alt="Enlarged civic grievance photographic evidence" className="max-h-[75vh] w-auto object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
