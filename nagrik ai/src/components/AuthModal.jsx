import React, { useState } from 'react';
import { X, User, Lock, Mail, Phone, MapPin, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginCitizen, registerCitizen, switchRole } from '../services/authService';
import { MUNICIPAL_WARDS } from '../services/storage';

export function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState(MUNICIPAL_WARDS[0].name);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const res = loginCitizen(email, password);
    if (res.success) {
      setSuccess('Signed in successfully.');
      setTimeout(() => {
        onAuthSuccess(res.user, 'citizen');
        onClose();
      }, 500);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    const res = registerCitizen({ name, email, phone, ward });
    if (res.success) {
      setSuccess('Account created successfully.');
      setTimeout(() => {
        onAuthSuccess(res.user, 'citizen');
        onClose();
      }, 500);
    } else {
      setError(res.message || 'Registration failed.');
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const res = switchRole('admin');
    setSuccess('Signed in as Municipal Administrator.');
    setTimeout(() => {
      onAuthSuccess(res.user, 'admin');
      onClose();
    }, 500);
  };

  const fillDemoCitizen = () => {
    setEmail('aditya.sharma@example.in');
    setPassword('demo1234');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-200 font-medium uppercase tracking-wider block">
              Citizen Access
            </span>
            <h3 className="text-base font-semibold">
              {tab === 'login' && 'Sign In to Citizen Portal'}
              {tab === 'register' && 'Register New Citizen Account'}
              {tab === 'admin' && 'Municipal Official Login'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-3 px-2 font-medium text-center border-b-2 transition-colors ${
              tab === 'login' ? 'border-blue-700 text-blue-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Citizen Login
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-3 px-2 font-medium text-center border-b-2 transition-colors ${
              tab === 'register' ? 'border-blue-700 text-blue-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            New Registration
          </button>
          <button
            onClick={() => { setTab('admin'); setError(''); }}
            className={`flex-1 py-3 px-2 font-medium text-center border-b-2 transition-colors ${
              tab === 'admin' ? 'border-blue-700 text-blue-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Official Access
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Citizen Login Tab */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aditya.sharma@example.in"
                  className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <button
                  type="button"
                  onClick={fillDemoCitizen}
                  className="text-blue-700 hover:underline text-[11px] font-medium"
                >
                  Fill Demo Citizen Account
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white rounded font-medium text-xs shadow-sm transition-colors"
              >
                Sign In to Citizen Account
              </button>
            </form>
          )}

          {/* Citizen Register Tab */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@example.in"
                  className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number (for SMS Tracking) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Ward
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full text-xs rounded border border-slate-300 px-3 py-2 text-slate-900 bg-white"
                >
                  {MUNICIPAL_WARDS.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white rounded font-medium text-xs shadow-sm transition-colors mt-2"
              >
                Register Citizen Profile
              </button>
            </form>
          )}

          {/* Municipal Official Login */}
          {tab === 'admin' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Authorized Official Access</p>
                <p>Municipal engineers and zone commissioners can review grievance dispatches, update field statuses, and upload work order photos.</p>
              </div>

              <div className="border border-slate-200 rounded p-3 text-xs space-y-1">
                <p className="text-slate-500">Official Profile:</p>
                <p className="font-bold text-slate-900">Er. Rajeshwar Rao</p>
                <p className="text-slate-600">Assistant Executive Engineer, PWD Central Division</p>
              </div>

              <button
                onClick={handleAdminLogin}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs shadow-sm transition-colors"
              >
                Enter Municipal Operations Desk
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

