import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  Edit3, 
  Save, 
  X, 
  ShieldCheck, 
  Eye, 
  ChevronRight,
  Inbox
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { updateUserProfile } from '../services/authService';
import { 
  subscribeUserNotifications, 
  markNotificationAsRead 
} from '../services/notificationService';

export function CitizenDashboard({ 
  currentUser, 
  userComplaints = [], 
  setActivePage, 
  setSelectedComplaintId, 
  onProfileUpdated 
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history' | 'notifications' | 'profile'
  const [notifications, setNotifications] = useState([]);
  
  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Subscribe to real-time notifications for this citizen
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeUserNotifications(currentUser.uid, (list) => {
      setNotifications(list);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  // Counts computed directly from actual user records
  const total = userComplaints.length;
  const submitted = userComplaints.filter(c => c.status === 'Submitted').length;
  const underReview = userComplaints.filter(c => c.status === 'Under Review').length;
  const inProgress = userComplaints.filter(c => c.status === 'In Progress').length;
  const resolved = userComplaints.filter(c => c.status === 'Resolved').length;

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const updated = await updateUserProfile(currentUser?.uid, {
      name: editName.trim(),
      address: editAddress.trim()
    });
    setSavingProfile(false);
    setEditingProfile(false);
    if (onProfileUpdated) onProfileUpdated(updated);
  };

  const handleNotificationClick = async (notif) => {
    await markNotificationAsRead(currentUser?.uid, notif.id);
    if (notif.complaintId) {
      setSelectedComplaintId(notif.complaintId);
      setActivePage('track');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Citizen Welcome Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
            {currentUser?.name ? currentUser.name.slice(0, 1).toUpperCase() : 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {currentUser?.name || 'Citizen User'}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-semibold">
                UID: {currentUser?.uid ? currentUser.uid.slice(0, 10) : 'GUEST'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Verified Mobile: <strong className="font-mono text-slate-800">{currentUser?.phoneNumber || 'Not Linked'}</strong>
              {currentUser?.ward && ` • ${currentUser.ward}`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('report')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded bg-blue-900 hover:bg-blue-800 text-white font-medium text-xs shadow-sm transition-colors self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lodge New Grievance</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Complaint History ({total})
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'notifications'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notifications</span>
          {unreadNotificationsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-900 text-blue-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Citizen Profile & Address
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Status Metrics (derived strictly from Firestore) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium block">Total Filed</span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{total}</div>
              <span className="text-[11px] text-slate-500">Under your account</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-600 font-medium block">Submitted</span>
              <div className="text-2xl font-bold text-slate-700 font-mono mt-1">{submitted}</div>
              <span className="text-[11px] text-slate-500">Queued for triage</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-blue-700 font-medium block">Under Review</span>
              <div className="text-2xl font-bold text-blue-900 font-mono mt-1">{underReview}</div>
              <span className="text-[11px] text-slate-500">Jurisdiction check</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-amber-700 font-medium block">In Progress</span>
              <div className="text-2xl font-bold text-amber-900 font-mono mt-1">{inProgress}</div>
              <span className="text-[11px] text-slate-500">Field work order</span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
              <span className="text-xs text-emerald-700 font-medium block">Resolved</span>
              <div className="text-2xl font-bold text-emerald-900 font-mono mt-1">{resolved}</div>
              <span className="text-[11px] text-slate-500">Verified closed</span>
            </div>
          </div>

          {/* Recent Grievance Activity */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Grievance Submissions
              </h3>
              <button 
                onClick={() => setActiveTab('history')}
                className="text-xs text-blue-900 hover:underline font-semibold"
              >
                View Full History
              </button>
            </div>

            {userComplaints.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-2">
                <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-medium">No complaints logged yet under this citizen profile.</p>
                <button
                  onClick={() => setActivePage('report')}
                  className="px-3 py-1.5 rounded bg-blue-900 text-white text-xs font-semibold"
                >
                  File Your First Grievance
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {userComplaints.slice(0, 3).map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setSelectedComplaintId(item.id);
                      setActivePage('track');
                    }}
                    className="p-3.5 rounded border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-900">{item.id}</span>
                        <PriorityBadge priority={item.severity || item.priority} />
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                      <h4 className="font-semibold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-slate-500 text-[11px]">{item.categoryName} • {item.location?.ward || item.ward}</p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Full Complaint History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Complete Personal Grievance Dossier
            </h3>
            <span className="text-xs text-slate-500">{userComplaints.length} Records</span>
          </div>

          {userComplaints.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <p className="text-xs">No grievances logged under this account.</p>
              <button
                onClick={() => setActivePage('report')}
                className="px-4 py-2 rounded bg-blue-900 text-white text-xs font-semibold"
              >
                Lodge a Civic Issue
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Summary</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {userComplaints.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900">{item.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">{item.title}</td>
                      <td className="py-3 px-4 text-slate-600">{item.categoryName}</td>
                      <td className="py-3 px-4"><StatusBadge status={item.status} size="sm" /></td>
                      <td className="py-3 px-4 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedComplaintId(item.id);
                            setActivePage('track');
                          }}
                          className="py-1 px-2.5 rounded bg-blue-900 text-white text-[11px] font-semibold"
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Notification Center */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Grievance Notification Ledger
              </h3>
              <p className="text-[11px] text-slate-500">Live alerts for workflow status transitions and official remarks</p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-900">
              {unreadNotificationsCount} Unread
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No notifications on record. Notifications will trigger automatically when your complaint status updates.
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 rounded border text-xs cursor-pointer flex items-start justify-between gap-3 transition-colors ${
                    !notif.read ? 'bg-blue-50/60 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${!notif.read ? 'bg-blue-600' : 'bg-slate-300'}`} />
                      <h4 className="font-bold text-slate-900">{notif.title}</h4>
                      {notif.complaintId && (
                        <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.2 rounded text-blue-900">
                          {notif.complaintId}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs pl-4">{notif.message}</p>
                    <span className="text-[10px] text-slate-400 pl-4 block">
                      {new Date(notif.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span className="text-blue-900 text-xs font-semibold flex items-center gap-1 flex-shrink-0">
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: User Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5 max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Citizen Account Record
              </h3>
              <p className="text-xs text-slate-500">Security-enforced profile attributes (Role cannot be user-modified)</p>
            </div>

            {!editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="py-1 px-3 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {!editingProfile ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-semibold text-slate-900">{currentUser?.name || 'Citizen'}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Verified Mobile Number:</span>
                <span className="font-mono font-semibold text-slate-900">{currentUser?.phoneNumber || 'Not Linked'}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Permanent User UID:</span>
                <span className="font-mono text-slate-600 text-[11px]">{currentUser?.uid || 'GUEST-SESSION'}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">System Role:</span>
                <span className="font-bold text-blue-900 uppercase text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {currentUser?.role || 'Citizen'} (Standard Non-Privileged)
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Residential Address:</span>
                <span className="text-slate-800">{currentUser?.address || 'Not specified'}</span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-500">Account Initialized:</span>
                <span className="text-slate-800 font-mono text-[11px]">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Residential Street Address
                </label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="e.g. 142, Sector 14, Main Road"
                  className="w-full text-xs rounded border border-slate-300 p-2.5 text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="py-1.5 px-3 rounded border border-slate-300 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="py-1.5 px-4 rounded bg-blue-900 text-white text-xs font-semibold shadow-sm"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

        </div>
      )}

    </div>
  );
}
