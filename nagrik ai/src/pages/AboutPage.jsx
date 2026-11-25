import React from 'react';
import { Building2, ShieldCheck, Info, FileText, CheckCircle2, Cpu } from 'lucide-react';

export function AboutPage({ setActivePage }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 block mb-1">
          Platform Identity & Architecture
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          About NAGRIK AI
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          AI-Powered Civic Issue Reporting and City Intelligence Platform. Bridging the gap between resident complaints and field department execution.
        </p>
      </div>

      {/* Transparent Disclaimer Box */}
      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-800 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Platform Operation Notice</span>
          <p className="text-slate-700 leading-relaxed">
            NAGRIK AI operates its own dedicated complaint database, real-time tracking engine, and administrative dispatch workspace. The platform does not claim official government affiliation or integration without an actual authorized bilateral municipal agreement.
          </p>
        </div>
      </div>

      {/* Purpose */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          Our Mission
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          In many metropolitan jurisdictions, citizen complaints get lost across fragmented paper registers, social media handles, and informal phone calls. Citizens rarely know which municipal department is responsible or when work orders will be executed.
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          NAGRIK AI creates a single, open, verifiable portal where any civic issue—from broken water mains and crater potholes to uncollected waste and live wire hazards—is documented with photographic proof, exact GPS coordinates, and real-time status updates.
        </p>
      </div>

      {/* Technology Architecture */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
          Engineering & Technical Architecture
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded border border-slate-100 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Cloud Firestore & Real-Time Sync</span>
            <p className="text-slate-600">
              Complaints, status transitions, and citizen notifications use Firestore reactive listeners (`onSnapshot`) ensuring live updates without manual page refreshes.
            </p>
          </div>

          <div className="p-3 rounded border border-slate-100 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Firebase Phone Authentication</span>
            <p className="text-slate-600">
              Citizen identity is anchored on verified Indian mobile numbers (`+91`) via real Firebase SMS OTP verification with reCAPTCHA anti-abuse defenses.
            </p>
          </div>

          <div className="p-3 rounded border border-slate-100 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Google Gemini AI Engine</span>
            <p className="text-slate-600">
              Multimodal Gemini 1.5 Flash models inspect photographs and incident descriptions to automatically suggest categories, assess severity, and flag duplicate reports.
            </p>
          </div>

          <div className="p-3 rounded border border-slate-100 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Leaflet & OpenStreetMap</span>
            <p className="text-slate-600">
              Interactive map pins with browser HTML5 geolocation permissions accurately log latitude and longitude coordinates without fabricated values.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-lg">
        <div>
          <h3 className="font-bold text-sm">Notice an issue in your neighborhood?</h3>
          <p className="text-xs text-slate-400">File a complaint in less than 2 minutes.</p>
        </div>
        <button
          onClick={() => setActivePage('report')}
          className="py-2 px-4 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm"
        >
          Report an Issue
        </button>
      </div>

    </div>
  );
}

