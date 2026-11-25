import React, { useState } from 'react';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  BarChart2, 
  FileText, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  ChevronDown,
  Layers,
  Phone,
  HelpCircle
} from 'lucide-react';

export function Navbar({ 
  activePage, 
  setActivePage, 
  currentUser, 
  currentRole, 
  onOpenPhoneAuth, 
  onSwitchRole, 
  onLogout,
  unreadCount = 0,
  onOpenAssistant = null
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const mainLinks = [
    { id: 'home', label: 'Home' },
    { id: 'feed', label: 'Public Issues' },
    { id: 'report', label: 'Report Issue', highlight: true },
    { id: 'track', label: 'Track Status' },
    { id: 'dashboard', label: 'Citizen Dashboard', requiresAuth: true },
    { id: 'admin', label: 'Admin Desk', badge: currentRole === 'admin' ? 'Active' : null },
    { id: 'analytics', label: 'City Analytics' },
    { id: 'about', label: 'About' },
    { id: 'faq', label: 'FAQ & Contact' }
  ];

  const handleNavClick = (pageId, requiresAuth) => {
    if (requiresAuth && !currentUser) {
      onOpenPhoneAuth();
      return;
    }
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="font-medium text-slate-200">
              NAGRIK AI • Centralized Civic Issue Reporting and City Intelligence Platform
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>Citizen Grievance Helpline: <strong className="text-white">1913</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Database: Online</span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group text-left rounded"
            aria-label="NAGRIK AI Home"
          >
            <div className="w-8 h-8 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <Building2 className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  NAGRIK <span className="text-blue-900">AI</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  v2.6
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium leading-none hidden sm:block">
                City Intelligence Platform
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainLinks.map((link) => {
              const isActive = activePage === link.id;

              if (link.highlight) {
                return (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id, link.requiresAuth)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors mx-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id, link.requiresAuth)}
                  className={`px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-blue-950 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-1 px-1 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Controls & Notifications */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Notification Bell */}
            {currentUser && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="relative p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Menu or Phone OTP Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-800 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <span className="font-semibold block leading-tight text-slate-900 max-w-[110px] truncate">
                      {currentUser.name || 'Citizen'}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-none">
                      {currentRole === 'admin' ? 'Admin' : 'Citizen'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-md shadow-lg py-1 text-xs text-slate-700 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 text-[11px]">
                      <span className="text-slate-500 block">Verified Mobile:</span>
                      <span className="font-bold text-slate-900 block font-mono">{currentUser.phoneNumber || 'Not Linked'}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">UID: {currentUser.uid?.slice(0, 10)}</span>
                    </div>

                    <button
                      onClick={() => {
                        handleNavClick('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                    >
                      Citizen Dashboard & Profile
                    </button>

                    <button
                      onClick={() => {
                        onSwitchRole(currentRole === 'citizen' ? 'admin' : 'citizen');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-blue-900 font-medium"
                    >
                      Switch to {currentRole === 'citizen' ? 'Admin Workspace' : 'Citizen Workspace'}
                    </button>

                    <button
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 border-t border-slate-100 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenPhoneAuth}
                className="py-1.5 px-3.5 rounded border border-blue-900 text-blue-900 hover:bg-blue-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone OTP Login</span>
              </button>
            )}

            {/* Quick Role Toggle Button */}
            <button
              onClick={() => onSwitchRole(currentRole === 'citizen' ? 'admin' : 'citizen')}
              className="py-1.5 px-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200"
              title="Toggle role for testing"
            >
              Role: <strong className="text-blue-900">{currentRole === 'admin' ? 'Admin' : 'Citizen'}</strong>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => handleNavClick('report')}
              className="px-2.5 py-1 rounded bg-blue-900 text-white text-xs font-semibold"
            >
              Report
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="p-1.5 rounded border border-slate-200 text-slate-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-50 border-t border-slate-200 px-4 py-3 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">Active Role:</span>
            <button
              onClick={() => onSwitchRole(currentRole === 'citizen' ? 'admin' : 'citizen')}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 font-bold text-blue-900"
            >
              {currentRole === 'admin' ? 'Admin Workspace' : 'Citizen Workspace'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {mainLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id, link.requiresAuth)}
                className={`text-left px-3 py-2 rounded font-medium ${
                  activePage === link.id
                    ? 'bg-blue-900 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
            {currentUser ? (
              <span className="text-slate-600">User: <strong>{currentUser.name || currentUser.phoneNumber}</strong></span>
            ) : (
              <button onClick={onOpenPhoneAuth} className="text-blue-900 font-bold">
                Sign In with Phone OTP
              </button>
            )}
          </div>
        </div>
      )}

    </header>
  );
}
