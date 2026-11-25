import React, { useState } from 'react';
import { 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Send 
} from 'lucide-react';

const FAQS = [
  {
    q: 'What is the format of the Complaint Reference ID?',
    a: 'Every complaint receives an official reference code in the format "NAG-2026-XXXXXXXX" (e.g. NAG-2026-7842B109). You can use this ID on the tracking page to inspect live updates at any time.'
  },
  {
    q: 'How does Firebase Phone Authentication work?',
    a: 'We use real Firebase Phone Authentication. You enter your 10-digit Indian mobile number (+91), solve a quick reCAPTCHA, and receive a 6-digit SMS verification code on your handset.'
  },
  {
    q: 'How are complaints assigned to departments?',
    a: 'When you submit an issue, our Gemini AI assistant examines the photograph and text to suggest the appropriate department. Municipal administrators review the dispatch and assign the work order to Public Works, Sanitation, Water Board, DISCOM, or Drainage.'
  },
  {
    q: 'Can I track a complaint without logging in?',
    a: 'Yes. Any citizen with a valid Complaint Reference ID can use the "Track Status" tab to inspect the public audit ledger, photo evidence, and resolution timeline.'
  },
  {
    q: 'What constitutes resolution proof?',
    a: 'Before a complaint can be transitioned to "Resolved", municipal field officers must upload an on-site completion photograph showing that the repair or cleanup was executed.'
  }
];

export function FaqContactPage({ setActivePage }) {
  const [openIndex, setOpenIndex] = useState(0);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSentSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-900 block mb-1">
          Citizen Help Desk & Inquiries
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Frequently Asked Questions & Contact
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Find answers regarding complaint workflows, reference IDs, and verified resolution procedures, or reach out to our platform support team.
        </p>
      </div>

      {/* Grid: Left FAQs, Right Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* FAQs (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
            Frequently Asked Questions
          </h2>

          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-blue-900" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Form & Emergency Numbers (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Helplines Directory */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-blue-900" />
              <span>Municipal Direct Helplines</span>
            </h3>

            <div className="text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Municipal Grievances:</span>
                <span className="font-mono font-bold text-slate-900">1913</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Drinking Water Pipeline SOS:</span>
                <span className="font-mono font-bold text-slate-900">1916</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Electricity Fault & Streetlights:</span>
                <span className="font-mono font-bold text-slate-900">1912</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">National Emergency Services:</span>
                <span className="font-mono font-bold text-red-700">112</span>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Send Support Inquiry
            </h3>

            {sentSuccess ? (
              <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Your inquiry has been received. Our team will contact you.</span>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="ramesh@example.in"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Message</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Explain your inquiry or technical issue..."
                    className="w-full rounded border border-slate-300 p-2.5 text-slate-900 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

