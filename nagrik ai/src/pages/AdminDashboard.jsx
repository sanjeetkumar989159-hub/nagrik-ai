import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Eye,
  Clock,
  AlertTriangle,
  X,
  ShieldCheck,
  Layers,
  BarChart2,
  CheckCircle2,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';
import RequireAdmin from '../components/RequireAdmin';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { DEFAULT_DEPARTMENTS, getDepartmentById } from '../services/departmentService';
import { MUNICIPAL_WARDS } from '../services/storage';
import { updateComplaintStatusFirestore } from '../services/complaintsService';
import { sanitizeCsvCell, ALLOWED_STATUSES } from '../utils/security';

const CATEGORY_COLORS = ['#1e3a8a', '#2563eb', '#0284c7', '#0d9488', '#d97706', '#dc2626', '#475569', '#15803d'];

export function AdminDashboard({
  complaints = [],
  currentUser,
  currentRole,
  setActivePage,
  setSelectedComplaintId,
  onComplaintUpdated,
  onSwitchToAdmin
}) {
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'analytics' | 'departments'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Detail Drawer / Modal State
  const [detailItem, setDetailItem] = useState(null);

  // Modal State for Status / Remarks Update
  const [editingItem, setEditingItem] = useState(null);
  const [newStatus, setNewStatus] = useState('Submitted');
  const [newDeptId, setNewDeptId] = useState('dept-pwd');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setEditingItem(null);
        setDetailItem(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Derived Operational Metrics from Actual Records
  const totalActual = complaints.length;
  const pendingActual = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const activeActual = complaints.filter(
    (c) => c.status === 'Assigned' || c.status === 'In Progress'
  ).length;
  const highPriorityActual = complaints.filter(
    (c) => (c.severity || c.priority) === 'High' || (c.severity || c.priority) === 'Emergency'
  ).length;
  const resolvedActual = complaints.filter((c) => c.status === 'Resolved').length;

  // Category-wise analytics
  const categoryStatsMap = {};
  complaints.forEach((c) => {
    const label = c.categoryName || 'Other';
    if (!categoryStatsMap[label]) {
      categoryStatsMap[label] = { name: label, total: 0, resolved: 0, highPriority: 0 };
    }
    categoryStatsMap[label].total += 1;
    if (c.status === 'Resolved') categoryStatsMap[label].resolved += 1;
    if ((c.severity || c.priority) === 'High' || (c.severity || c.priority) === 'Emergency') {
      categoryStatsMap[label].highPriority += 1;
    }
  });
  const categoryAnalytics = Object.values(categoryStatsMap).sort((a, b) => b.total - a.total);

  // Filter and Sort
  const filtered = complaints
    .filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.address || item.location?.address || '').toLowerCase().includes(q) ||
        (item.citizenName || item.citizen?.name || '').toLowerCase().includes(q);

      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const itemPriority = item.severity || item.priority || 'Medium';
      const matchPriority = priorityFilter === 'ALL' || itemPriority === priorityFilter;
      const matchDept = deptFilter === 'ALL' || item.departmentId === deptFilter;
      const itemWard = item.ward || item.location?.ward || '';
      const matchWard = wardFilter === 'ALL' || itemWard === wardFilter;

      return matchSearch && matchStatus && matchPriority && matchDept && matchWard;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'severity') {
        const order = { Emergency: 4, High: 3, Medium: 2, Low: 1 };
        return (order[b.severity || b.priority] || 0) - (order[a.severity || a.priority] || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setNewStatus(item.status || 'Submitted');
    setNewDeptId(item.departmentId || DEFAULT_DEPARTMENTS[0].id);
    setAssignedOfficer(item.assignedOfficer || 'Municipal Field Engineer');
    setAdminRemarks('');
    setResolutionPhotoUrl(item.resolutionProofUrl || '');
    setActionError('');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setActionError('');
    setUpdating(true);

    try {
      const updated = await updateComplaintStatusFirestore(
        editingItem.id,
        newStatus,
        adminRemarks,
        resolutionPhotoUrl,
        newDeptId,
        assignedOfficer,
        { role: currentRole, user: currentUser }
      );
      if (onComplaintUpdated) {
        onComplaintUpdated(updated);
      }
      setActionSuccess(`Complaint ${editingItem.id} updated to "${newStatus}".`);
      setTimeout(() => setActionSuccess(''), 4000);
      setEditingItem(null);
    } catch (err) {
      setActionError(err.message || 'Failed to update complaint status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Complaint ID',
      'Title',
      'Category',
      'Priority',
      'Status',
      'Department',
      'Ward',
      'Address',
      'Citizen',
      'Created At'
    ];
    const rows = filtered.map((c) => [
      sanitizeCsvCell(c.id),
      sanitizeCsvCell(c.title),
      sanitizeCsvCell(c.categoryName),
      sanitizeCsvCell(c.severity || c.priority),
      sanitizeCsvCell(c.status),
      sanitizeCsvCell(c.departmentName),
      sanitizeCsvCell(c.ward || c.location?.ward),
      sanitizeCsvCell(c.address || c.location?.address || ''),
      sanitizeCsvCell(c.citizenName || c.citizen?.name || ''),
      sanitizeCsvCell(c.createdAt)
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nagrik_admin_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <RequireAdmin
      currentUser={currentUser}
      currentRole={currentRole}
      onSwitchToAdmin={onSwitchToAdmin}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Admin Header */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-900" aria-hidden="true" />
              <span>Administrative Command Console • Role-Protected Workspace</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Municipal Complaint Management & Dispatch
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Manage workflow status transitions (Submitted, Under Review, Assigned, In Progress, Resolved, Rejected), assign departments, inspect resolution history, and export sanitized reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleExportCsv}
              className="py-2 px-3 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span>Export CSV Report</span>
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div
            role="status"
            className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" aria-hidden="true" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-600 font-medium block">Total Complaints</span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{totalActual}</div>
            <span className="text-[11px] text-slate-500">All recorded grievances</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs text-blue-800 font-medium block">Pending Review</span>
            <div className="text-2xl font-bold text-blue-900 font-mono mt-1">{pendingActual}</div>
            <span className="text-[11px] text-slate-500">Submitted & Under Review</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <span className="text-xs text-amber-800 font-medium block">Active Dispatch</span>
            <div className="text-2xl font-bold text-amber-900 font-mono mt-1">{activeActual}</div>
            <span className="text-[11px] text-slate-500">Assigned & In Progress</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-red-200 shadow-sm">
            <span className="text-xs text-red-700 font-medium block">High Priority</span>
            <div className="text-2xl font-bold text-red-800 font-mono mt-1">{highPriorityActual}</div>
            <span className="text-[11px] text-slate-500">High & Emergency alerts</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm col-span-2 lg:col-span-1">
            <span className="text-xs text-emerald-800 font-medium block">Resolved</span>
            <div className="text-2xl font-bold text-emerald-900 font-mono mt-1">{resolvedActual}</div>
            <span className="text-[11px] text-slate-500">Verified closed tickets</span>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 gap-6 text-xs font-medium" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'complaints'}
            onClick={() => setActiveTab('complaints')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'complaints'
                ? 'border-blue-900 text-blue-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Complaints Queue ({filtered.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'analytics'
                ? 'border-blue-900 text-blue-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Category-Wise Analytics</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'departments'}
            onClick={() => setActiveTab('departments')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'departments'
                ? 'border-blue-900 text-blue-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Department Management ({DEFAULT_DEPARTMENTS.length})</span>
          </button>
        </div>

        {/* View 1: Complaints Queue */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="relative lg:col-span-2">
                  <label htmlFor="admin-search" className="sr-only">Search complaints</label>
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    id="admin-search"
                    type="text"
                    placeholder="Search ID, title, address, citizen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs rounded border border-slate-300 pl-9 pr-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="admin-status-filter" className="sr-only">Filter by status</label>
                  <select
                    id="admin-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
                  >
                    <option value="ALL">All Statuses</option>
                    {ALLOWED_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-priority-filter" className="sr-only">Filter by priority</label>
                  <select
                    id="admin-priority-filter"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="Emergency">Emergency</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-dept-filter" className="sr-only">Filter by department</label>
                  <select
                    id="admin-dept-filter"
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
                  >
                    <option value="ALL">All Departments</option>
                    {DEFAULT_DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-sort" className="sr-only">Sort complaints</label>
                  <select
                    id="admin-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="severity">Sort: Highest Priority</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center text-xs text-slate-600 pt-1 gap-2">
                <div className="flex items-center gap-3">
                  <span>Showing <strong>{filtered.length}</strong> matching complaints</span>
                  <label htmlFor="admin-ward-filter" className="sr-only">Filter by ward</label>
                  <select
                    id="admin-ward-filter"
                    value={wardFilter}
                    onChange={(e) => setWardFilter(e.target.value)}
                    className="text-xs rounded border border-slate-300 px-2 py-1 text-slate-800 bg-white"
                  >
                    <option value="ALL">All Wards</option>
                    {MUNICIPAL_WARDS.map((w) => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || deptFilter !== 'ALL' || wardFilter !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('ALL');
                      setPriorityFilter('ALL');
                      setDeptFilter('ALL');
                      setWardFilter('ALL');
                    }}
                    className="text-blue-900 hover:underline text-xs font-medium"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                      <th className="py-3 px-4">Ref ID</th>
                      <th className="py-3 px-4">Complaint & Citizen</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-500">
                          No complaint records match the specified query parameters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                            {item.id}
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-semibold text-slate-900 block truncate">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-600 block truncate">
                              {item.categoryName} • By {item.citizenName || item.citizen?.name || 'Citizen'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-medium text-slate-800 block">{item.departmentName}</span>
                            <span className="text-[10px] text-slate-500 block">{item.assignedOfficer || 'Unassigned'}</span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="block text-slate-800">{(item.ward || item.location?.ward || '').split('-')[0]}</span>
                            <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                              {item.address || item.location?.address}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <PriorityBadge priority={item.severity || item.priority} />
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <StatusBadge status={item.status} size="sm" />
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setDetailItem(item)}
                                className="py-1 px-2 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1"
                                title="View complaint details & resolution history"
                              >
                                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="py-1 px-2.5 rounded bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs shadow-sm transition-colors"
                              >
                                Update Status
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedComplaintId(item.id);
                                  setActivePage('track');
                                }}
                                aria-label={`Inspect ${item.id} on public tracking ledger`}
                                className="p-1.5 rounded border border-slate-300 hover:bg-slate-100 text-slate-700"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* View 2: Category-wise Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Category-Wise Volume & Resolution Chart
                </h2>
                <p className="text-xs text-slate-500">Live breakdown across active grievance records</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#475569" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#475569" />
                    <Tooltip />
                    <Bar dataKey="total" name="Total Complaints" radius={[4, 4, 0, 0]}>
                      {categoryAnalytics.map((entry, idx) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                    <Bar dataKey="resolved" name="Resolved" fill="#15803d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Category Breakdown Table
              </h2>
              <div className="space-y-2.5 text-xs">
                {categoryAnalytics.map((cat) => {
                  const pct = totalActual > 0 ? Math.round((cat.total / totalActual) * 100) : 0;
                  return (
                    <div key={cat.name} className="p-2.5 rounded border border-slate-200 bg-slate-50 space-y-1">
                      <div className="flex justify-between font-semibold text-slate-900">
                        <span>{cat.name}</span>
                        <span className="font-mono">{cat.total} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-900 h-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Resolved: <strong>{cat.resolved}</strong></span>
                        <span>High Priority: <strong className="text-red-700">{cat.highPriority}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* View 3: Department Management */}
        {activeTab === 'departments' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-900 block mb-0.5">Department Assignment Matrix</span>
              <p>Configured municipal departments. Workloads below reflect real records in the complaint store.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEFAULT_DEPARTMENTS.map((dept) => {
                const deptComplaints = complaints.filter((c) => c.departmentId === dept.id);
                const deptResolved = deptComplaints.filter((c) => c.status === 'Resolved').length;
                const deptActive = deptComplaints.filter(
                  (c) => c.status === 'Assigned' || c.status === 'In Progress'
                ).length;

                return (
                  <div key={dept.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          {dept.code}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">{dept.name}</h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                      {dept.description}
                    </p>

                    <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                      <div>Officer: <strong className="text-slate-800">{dept.headOfficer}</strong></div>
                      <div>Direct Contact: <span className="font-mono text-slate-700">{dept.contactNumber}</span></div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                      <div className="p-1.5 rounded bg-slate-100">
                        <span className="text-[10px] text-slate-500 block">Total</span>
                        <strong className="text-slate-900 font-mono">{deptComplaints.length}</strong>
                      </div>
                      <div className="p-1.5 rounded bg-amber-50 text-amber-800">
                        <span className="text-[10px] block">Active</span>
                        <strong className="font-mono">{deptActive}</strong>
                      </div>
                      <div className="p-1.5 rounded bg-emerald-50 text-emerald-800">
                        <span className="text-[10px] block">Resolved</span>
                        <strong className="font-mono">{deptResolved}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setDeptFilter(dept.id);
                        setActiveTab('complaints');
                      }}
                      className="w-full py-1.5 text-center text-xs font-semibold text-blue-900 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                    >
                      Filter Complaints for this Department
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal: Complaint Details & Resolution History */}
        {detailItem && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-detail-title"
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDetailItem(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-900">{detailItem.id}</span>
                  <h2 id="admin-detail-title" className="text-base font-bold text-slate-900 mt-0.5">
                    {detailItem.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailItem(null)}
                  aria-label="Close complaint details"
                  className="p-1 rounded text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 items-center text-xs">
                <StatusBadge status={detailItem.status} size="sm" />
                <PriorityBadge priority={detailItem.severity || detailItem.priority} />
                <span className="text-slate-600">{detailItem.categoryName} • {detailItem.departmentName}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1.5">
                <p className="text-slate-800 leading-relaxed">{detailItem.description}</p>
                <div className="text-slate-600 pt-1">
                  Location: <strong>{detailItem.ward || detailItem.location?.ward}</strong> — {detailItem.address || detailItem.location?.address}
                </div>
                <div className="text-slate-600">
                  Citizen: <strong>{detailItem.citizenName || 'Citizen'}</strong> ({detailItem.citizenPhone || 'N/A'})
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Resolution & Audit History ({(detailItem.timeline || []).length} events)
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(detailItem.timeline || []).map((ev, idx) => (
                    <div key={ev.id || idx} className="p-2.5 rounded border border-slate-200 text-xs space-y-0.5">
                      <div className="flex justify-between font-semibold text-slate-900">
                        <span>{ev.title || ev.status}</span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {new Date(ev.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600">{ev.remarks || ev.notes}</p>
                      <span className="text-[11px] text-slate-500 block">Officer: {ev.officer}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const target = detailItem;
                    setDetailItem(null);
                    handleOpenEdit(target);
                  }}
                  className="py-1.5 px-4 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold"
                >
                  Update Status / Dispatch
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Status Update & Department Assignment */}
        {editingItem && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-edit-title"
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Work Order Allocation & Status Update
                  </span>
                  <h2 id="admin-edit-title" className="text-base font-bold text-slate-900">
                    Complaint Ref: {editingItem.id}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  aria-label="Close status update modal"
                  className="p-1 rounded text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {actionError && (
                <div role="alert" className="p-3 rounded bg-red-50 border border-red-200 text-red-800 text-xs">
                  {actionError}
                </div>
              )}

              <form onSubmit={handleSaveStatus} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-status" className="block font-semibold text-slate-800 mb-1">
                      Workflow Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-status"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="edit-dept" className="block font-semibold text-slate-800 mb-1">
                      Assign Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="edit-dept"
                      value={newDeptId}
                      onChange={(e) => setNewDeptId(e.target.value)}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
                    >
                      {DEFAULT_DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-officer" className="block font-semibold text-slate-800 mb-1">
                    Assigned Field Officer / Unit
                  </label>
                  <input
                    id="edit-officer"
                    type="text"
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    placeholder="e.g. Er. Rajeshwar Rao (PWD Division 4)"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="edit-remarks" className="block font-semibold text-slate-800 mb-1">
                    Official Administrative Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="edit-remarks"
                    rows={3}
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder="State work order number, crew dispatch details, or resolution inspection confirmation..."
                    className="w-full rounded border border-slate-300 p-2.5 text-slate-900 resize-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500">
                    Mandatory remarks are appended to the immutable public audit trail.
                  </span>
                </div>

                <div>
                  <label htmlFor="edit-photo-url" className="block font-semibold text-slate-800 mb-1">
                    Work Completion Photo URL (Optional / For Resolved)
                  </label>
                  <input
                    id="edit-photo-url"
                    type="url"
                    value={resolutionPhotoUrl}
                    onChange={(e) => setResolutionPhotoUrl(e.target.value)}
                    placeholder="https://... photo URL of completed repairs"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="py-1.5 px-3 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="py-1.5 px-4 rounded bg-blue-900 hover:bg-blue-800 text-white font-semibold shadow-sm disabled:opacity-50"
                  >
                    {updating ? 'Saving Update...' : 'Confirm Update & Notify Citizen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RequireAdmin>
  );
}
