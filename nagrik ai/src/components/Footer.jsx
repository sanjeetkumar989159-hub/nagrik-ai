import React from 'react';
import { Building2, Phone, ShieldCheck, ExternalLink, HelpCircle, FileText, Lock } from 'lucide-react';

export function Footer({ setActivePage }) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Identity & Statement */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                N
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                NAGRIK AI
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              AI-Powered Civic Issue Reporting and City Intelligence Platform. Enabling citizens to report civic problems, track work orders transparently, and verify on-site resolutions.
            </p>
            <div className="text-[10px] text-slate-500">
              Operates dedicated municipal issue database • Real-Time Firestore Sync
            </div>
          </div>

          {/* Col 2: Public Navigation Links */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button onClick={() => setActivePage('report')} className="hover:text-white transition-colors">
                  Report a Civic Problem
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('track')} className="hover:text-white transition-colors">
                  Track Complaint by Reference ID
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('feed')} className="hover:text-white transition-colors">
                  Browse Public Issues Ledger
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('dashboard')} className="hover:text-white transition-colors">
                  Citizen Dashboard & History
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('admin')} className="hover:text-white transition-colors">
                  Municipal Admin Management Desk
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('analytics')} className="hover:text-white transition-colors">
                  City Intelligence & Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Emergency Helplines */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>Municipal Helplines</span>
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex justify-between pb-1 border-b border-slate-800">
                <span>Municipal Grievance Helpline:</span>
                <span className="font-mono text-white font-bold">1913</span>
              </li>
              <li className="flex justify-between pb-1 border-b border-slate-800">
                <span>Water Supply & Pipeline SOS:</span>
                <span className="font-mono text-white font-bold">1916</span>
              </li>
              <li className="flex justify-between pb-1 border-b border-slate-800">
                <span>Electricity Grid & Streetlights:</span>
                <span className="font-mono text-white font-bold">1912</span>
              </li>
              <li className="flex justify-between pb-1 border-b border-slate-800">
                <span>National Emergency Services:</span>
                <span className="font-mono text-white font-bold text-red-400">112</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & System Settings */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Legal & Configuration
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => setActivePage('about')} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>About NAGRIK AI</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('faq')} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>FAQ & Citizen Support</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('terms')} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Privacy Policy & Terms</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('settings')} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 pt-1">
                  <span>AI & Firebase Settings</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>

            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
              © {new Date().getFullYear()} NAGRIK AI Platform. Public Civic Technology Initiative.
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
