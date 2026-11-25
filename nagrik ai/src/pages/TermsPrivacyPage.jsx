import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

export function TermsPrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 block mb-1">
          Legal & Civic Governance
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Privacy Policy & Terms of Service
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Guidelines regarding citizen data security, telephone OTP verification, location permissions, and public grievance ledger rules.
        </p>
      </div>

      {/* Privacy Policy */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-blue-900" />
          <span>Citizen Privacy Policy</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>1. Phone Authentication:</strong> We collect and authenticate mobile telephone numbers via Firebase Phone Authentication to verify citizen identity and dispatch SMS status updates. Phone numbers are stored securely in Cloud Firestore and are never sold or shared with commercial marketing entities.
          </p>
          <p>
            <strong>2. Photographic Evidence:</strong> When you upload a photograph documenting a civic problem, the image is stored in Firebase Storage. The photograph is utilized strictly for municipal verification, public works assessment, and resolution proof.
          </p>
          <p>
            <strong>3. Location Data:</strong> Browser geolocation coordinates (latitude and longitude) are captured only upon explicit user permission to pin the exact physical location of the civic hazard on OpenStreetMap.
          </p>
          <p>
            <strong>4. Role Protection:</strong> Users can edit their permitted profile information (display name and street address). In compliance with platform security rules, citizens cannot edit their own administrative roles or bypass authorization checks.
          </p>
        </div>
      </div>

      {/* Terms of Service */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-900" />
          <span>Terms of Civic Participation</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>1. Genuine Grievances:</strong> Citizens must file authentic reports concerning physical public infrastructure. Submitting fraudulent, defamatory, or intentionally false complaints constitutes a violation of platform integrity.
          </p>
          <p>
            <strong>2. Public Redressal Ledger:</strong> Complaint titles, locations, assigned departments, and status progressions are indexed on the public ledger to foster civic transparency and hold departments accountable.
          </p>
          <p>
            <strong>3. Resolution Audits:</strong> Department work orders can only be designated as "Resolved" when valid completion photographs are recorded by authorized administrative inspectors.
          </p>
          <p>
            <strong>4. Platform Ownership:</strong> NAGRIK AI operates an independent issue reporting database. The platform operates independently to provide public intelligence and work order dispatching.
          </p>
        </div>
      </div>

    </div>
  );
}

