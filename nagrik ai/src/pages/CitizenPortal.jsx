import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  PlusCircle, 
  Clock, 
  ChevronRight, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Building2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { COMPLAINT_CATEGORIES } from '../services/complaintsService';
import { MUNICIPAL_WARDS } from '../services/storage';

export function CitizenPortal({ 
  complaints, 
  currentUser, 
  currentRole, 
  activeTab = 'all', 
  setActivePage, 
  setSelectedComplaintId,
  onOpenAuthModal 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [viewScope, setViewScope] = useState(activeTab); // 'all' | 'my'

  // Complaints belonging to current user
  const userEmail = currentUser?.email?.toLowerCase();
  const myComplaints = complaints.filter(c => {
    const email = (c.citizenEmail || c.citizen?.email || '').toLowerCase();
    return Boolean((currentUser?.uid && c.userId === currentUser.uid) || (userEmail && email === userEmail));
  });

  const displayedList = (viewScope === 'my' ? myComplaints : complaints).filter(item => {
    const addr = item.address || item.location?.address || '';
    const ward = item.ward || item.location?.ward || '';
    const matchSearch = 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchWard = wardFilter === 'ALL' || ward === wardFilter;

    return matchSearch && matchCategory && matchStatus && matchWard;
  });

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const underReviewCount = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;

  const handleSelectComplaint = (id) => {
    setSelectedComplaintId(id);
    setActivePage('track');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900 mb-1">
            <span>Citizen Grievance Redressal Portal</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-normal">Municipal Corporation Public Works</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Civic Issue Reporting & Public Transparency Desk
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Citizens can lodge civic grievances, track work order milestones, and monitor municipal department field teams across city wards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setActivePage('report')}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File a New Grievance</span>
          </button>
        </div>
      </div>

      {/* Realistic Civic Counters (Derived directly from local database) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Total Recorded Grievances</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-500 block mt-0.5">Across 6 Municipal Wards</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs text-amber-700 font-medium block">Field Work In Progress</span>
          <div className="text-2xl font-bold text-amber-900 font-mono mt-1">{inProgressCount}</div>
          <span className="text-[11px] text-slate-500 block mt-0.5">Assigned to Ward Crews</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs text-emerald-700 font-medium block">Completed & Verified</span>
          <div className="text-2xl font-bold text-emerald-900 font-mono mt-1">{resolvedCount}</div>
          <span className="text-[11px] text-slate-500 block mt-0.5">With Work Order Photo Proof</span>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs text-blue-700 font-medium block">Pending Initial Triage</span>
          <div className="text-2xl font-bold text-blue-900 font-mono mt-1">{underReviewCount}</div>
          <span className="text-[11px] text-slate-500 block mt-0.5">Awaiting Control Room Review</span>
        </div>
      </div>

      {/* Scope Selector: All Public Complaints vs My Complaints */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-medium">
        <button
          onClick={() => setViewScope('all')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            viewScope === 'all'
              ? 'border-blue-900 text-blue-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>All Public Grievances ({complaints.length})</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) {
              onOpenAuthModal();
            } else {
              setViewScope('my');
            }
          }}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            viewScope === 'my'
              ? 'border-blue-900 text-blue-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Filed Grievances ({myComplaints.length})</span>
          {!currentUser && <span className="text-[10px] text-slate-400">(Sign in required)</span>}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference ID or street..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded border border-slate-300 pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
            >
              <option value="ALL">All Civic Categories</option>
              {COMPLAINT_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Ward Filter */}
          <div>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
            >
              <option value="ALL">All Municipal Wards</option>
              {MUNICIPAL_WARDS.map(w => (
                <option key={w.id} value={w.name}>{w.name}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
          <span>Showing <strong>{displayedList.length}</strong> grievance records</span>
          {(searchTerm || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || wardFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
                setWardFilter('ALL');
              }}
              className="text-blue-700 hover:underline text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grievance Feed List */}
      <div className="space-y-3">
        {displayedList.length === 0 ? (
          <div className="bg-white p-10 rounded-lg border border-slate-200 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">No grievances found matching criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {viewScope === 'my' 
                ? 'You have not submitted any grievances under this account yet. Click "File a New Grievance" above to submit one.'
                : 'Try adjusting your search terms or filter selections.'}
            </p>
          </div>
        ) : (
          displayedList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectComplaint(item.id)}
              className="bg-white p-5 rounded-lg border border-slate-200 hover:border-blue-300 shadow-sm transition-all cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
            >
              <div className="flex gap-4 items-start flex-1 min-w-0">
                {/* Photo Thumbnail if present */}
                {(item.imageUrls?.[0] || item.imageUrl) ? (
                  <div className="w-16 h-16 rounded bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                    <img src={item.imageUrls?.[0] || item.imageUrl} alt={`Evidence for ${item.title}`} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Building2 className="w-6 h-6 text-slate-400" aria-hidden="true" />
                  </div>
                )}

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {item.id}
                    </span>
                    <PriorityBadge priority={item.severity || item.priority} />
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-[11px] text-slate-500 font-medium">
                      {item.categoryName}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3 h-3 text-slate-400" aria-hidden="true" />
                      <span>{item.ward || item.location?.ward}</span>
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[200px] text-slate-500">
                      {item.address || item.location?.address}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Column */}
              <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                <span className="text-xs text-blue-800 font-semibold flex items-center gap-1 group-hover:underline">
                  <span>Track Details</span>
                  <ChevronRight className="w-4 h-4 text-blue-800" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

