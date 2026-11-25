import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { CivicAssistantWidget } from './components/CivicAssistantWidget';

import { PublicHomePage } from './pages/PublicHomePage';
import { CitizenPortal } from './pages/CitizenPortal';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { AboutPage } from './pages/AboutPage';
import { FaqContactPage } from './pages/FaqContactPage';
import { TermsPrivacyPage } from './pages/TermsPrivacyPage';
import { AiSettingsPage } from './pages/AiSettingsPage';

import { subscribeAllComplaints } from './services/complaintsService';
import {
  initAuthListener,
  logoutUser
} from './services/authService';
import { subscribeUserNotifications } from './services/notificationService';

// Lazy-load heavy analytics & admin chunks for faster initial page load
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AnalyticsPage = lazy(() =>
  import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);

function PageLoadingFallback() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-600" role="status">
      Loading workspace module...
    </div>
  );
}

export function App() {
  const [activePage, setActivePage] = useState('home');
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  // Real authentication & user profile state
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('citizen'); // 'citizen' | 'admin'
  const [phoneAuthModalOpen, setPhoneAuthModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // AI Civic Assistant Drawer & Draft State
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantDraft, setAssistantDraft] = useState(null);

  // Subscribe to complaints database in real-time
  useEffect(() => {
    const unsubscribeComplaints = subscribeAllComplaints((list) => {
      setComplaints(list);
      if (list.length > 0 && !selectedComplaintId) {
        setSelectedComplaintId(list[0].id);
      }
    });

    return () => unsubscribeComplaints();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubAuth = initAuthListener((userProfile) => {
      setCurrentUser(userProfile);
      if (userProfile?.role) {
        setCurrentRole(userProfile.role);
      }
    });

    return () => unsubAuth();
  }, []);

  // Subscribe to notifications for the current user
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      return;
    }

    const unsubNotif = subscribeUserNotifications(currentUser.uid, (items) => {
      setNotifications(items);
    });

    return () => unsubNotif();
  }, [currentUser?.uid]);

  const handleSwitchRole = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'admin') {
      setActivePage('admin');
    } else {
      setActivePage('dashboard');
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCurrentRole('citizen');
    setActivePage('home');
  };

  const handleAuthSuccess = (userProfile) => {
    setCurrentUser(userProfile);
    setCurrentRole(userProfile.role || 'citizen');
    setActivePage('dashboard');
  };

  const handlePrefillFromAssistant = (draft) => {
    setAssistantDraft(draft);
    setActivePage('report');
  };

  // Filter complaints logged by current user
  const userComplaints = complaints.filter((c) => {
    if (!currentUser) return false;
    if (currentUser.uid && c.userId === currentUser.uid) return true;
    if (currentUser.phoneNumber && c.citizenPhone === currentUser.phoneNumber) return true;
    if (currentUser.email && c.citizenEmail === currentUser.email) return true;
    return false;
  });

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-900 focus:text-white focus:rounded focus:text-xs focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        currentRole={currentRole}
        onOpenPhoneAuth={() => setPhoneAuthModalOpen(true)}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        unreadCount={unreadNotificationsCount}
        onOpenAssistant={() => setAssistantOpen(true)}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {activePage === 'home' && (
          <PublicHomePage
            setActivePage={setActivePage}
            setSelectedComplaintId={setSelectedComplaintId}
            complaints={complaints}
            onOpenAssistant={() => setAssistantOpen(true)}
          />
        )}

        {activePage === 'feed' && (
          <CitizenPortal
            complaints={complaints}
            currentUser={currentUser}
            currentRole={currentRole}
            activeTab="all"
            setActivePage={setActivePage}
            setSelectedComplaintId={setSelectedComplaintId}
            onOpenAuthModal={() => setPhoneAuthModalOpen(true)}
          />
        )}

        {activePage === 'report' && (
          <SubmitComplaintPage
            currentUser={currentUser}
            setActivePage={setActivePage}
            setSelectedComplaintId={setSelectedComplaintId}
            onComplaintCreated={(record) => {
              setSelectedComplaintId(record.id);
            }}
            recentComplaints={complaints}
            assistantDraft={assistantDraft}
            onClearAssistantDraft={() => setAssistantDraft(null)}
            onOpenAssistant={() => setAssistantOpen(true)}
          />
        )}

        {activePage === 'track' && (
          <TrackComplaintPage
            selectedComplaintId={selectedComplaintId}
            setSelectedComplaintId={setSelectedComplaintId}
            setActivePage={setActivePage}
            currentRole={currentRole}
            recentComplaints={complaints}
          />
        )}

        {activePage === 'dashboard' && (
          <CitizenDashboard
            currentUser={currentUser}
            userComplaints={userComplaints}
            setActivePage={setActivePage}
            setSelectedComplaintId={setSelectedComplaintId}
            onProfileUpdated={(up) => setCurrentUser(up)}
          />
        )}

        {activePage === 'admin' && (
          <Suspense fallback={<PageLoadingFallback />}>
            <AdminDashboard
              complaints={complaints}
              currentUser={currentUser}
              currentRole={currentRole}
              setActivePage={setActivePage}
              setSelectedComplaintId={setSelectedComplaintId}
              onSwitchToAdmin={() => handleSwitchRole('admin')}
              onComplaintUpdated={() => {}}
            />
          </Suspense>
        )}

        {activePage === 'analytics' && (
          <Suspense fallback={<PageLoadingFallback />}>
            <AnalyticsPage complaints={complaints} />
          </Suspense>
        )}

        {activePage === 'about' && <AboutPage setActivePage={setActivePage} />}

        {activePage === 'faq' && <FaqContactPage setActivePage={setActivePage} />}

        {activePage === 'terms' && <TermsPrivacyPage />}

        {activePage === 'settings' && <AiSettingsPage />}
      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Real Phone OTP Auth Modal */}
      <PhoneAuthModal
        isOpen={phoneAuthModalOpen}
        onClose={() => setPhoneAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Context-Aware AI Civic Assistant Floating Widget */}
      <CivicAssistantWidget
        isOpen={assistantOpen}
        onOpen={() => setAssistantOpen(true)}
        onClose={() => setAssistantOpen(false)}
        onPrefillComplaint={handlePrefillFromAssistant}
      />
    </div>
  );
}

export default App;
