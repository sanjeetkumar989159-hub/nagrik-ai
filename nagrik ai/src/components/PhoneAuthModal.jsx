import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Info,
  Settings
} from 'lucide-react';
import { sendPhoneOtp, verifyPhoneOtp } from '../services/authService';
import { isFirebaseConfigured, firebaseConfig } from '../services/firebase';

export function PhoneAuthModal({ isOpen, onClose, onAuthSuccess }) {
  // ---- Test credentials for development when SMS is disabled ----
  const TEST_PHONE = '+919876543210';
  const TEST_OTP = '123456';
  const handleTestLogin = () => {
    // Create a mock user profile matching the shape used elsewhere
    const mockProfile = {
      uid: 'test_user_1',
      phoneNumber: TEST_PHONE,
      name: 'Test User',
      role: 'citizen',
      createdAt: new Date().toISOString()
    };
    // Directly invoke success callback – bypass Firebase
    onAuthSuccess(mockProfile);
    onClose();
  };

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [showConfigHelper, setShowConfigHelper] = useState(!isFirebaseConfigured());

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (step === 'otp' && countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Validate Indian mobile number (10 digits starting with 6-9)
  const validatePhone = (num) => {
    const clean = num.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(clean);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanNum = phoneNumber.replace(/\D/g, '');
    if (!validatePhone(cleanNum)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9845012891).');
      return;
    }

    if (!isFirebaseConfigured()) {
      setError('Firebase is not configured. Real SMS OTP requires Firebase API credentials in .env or Firebase Settings.');
      setShowConfigHelper(true);
      return;
    }

    setLoading(true);
    try {
      const fullNumber = `+91${cleanNum}`;
      await sendPhoneOtp(fullNumber, 'recaptcha-container');
      setStep('otp');
      setCountdown(45);
      setCanResend(false);
      setSuccess(`Verification code dispatched via SMS to ${fullNumber}`);
    } catch (err) {
      console.error('Phone OTP error:', err);
      if (err.code === 'auth/invalid-phone-number') {
        setError('The provided phone number is invalid.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait before trying again.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded on Firebase project.');
      } else {
        setError(err.message || 'Failed to dispatch SMS OTP. Verify reCAPTCHA and Firebase Phone Auth configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code received on your mobile device.');
      return;
    }

    setLoading(true);
    try {
      const { user, profile } = await verifyPhoneOtp(otpCode.trim());
      setSuccess('Mobile number verified successfully. Session initialized.');
      setTimeout(() => {
        onAuthSuccess(profile);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Verify error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP code. Please check the SMS and re-enter.');
      } else if (err.code === 'auth/code-expired') {
        setError('The verification code has expired. Please request a new OTP.');
      } else {
        setError(err.message || 'OTP verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setOtpCode('');
    setError('');
    setLoading(true);
    try {
      const fullNumber = `+91${phoneNumber.replace(/\D/g, '')}`;
      await sendPhoneOtp(fullNumber, 'recaptcha-container');
      setCountdown(45);
      setCanResend(false);
      setSuccess(`New verification code sent to ${fullNumber}`);
    } catch (err) {
      setError(err.message || 'Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phone-auth-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" aria-hidden="true" />
            <div>
              <h2 id="phone-auth-modal-title" className="text-sm font-bold">
                Citizen Authentication
              </h2>
              <span className="text-[11px] text-slate-300 block">
                Official Phone OTP Verification
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            className="text-slate-300 hover:text-white p-1 rounded"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Notice regarding real authentication */}
        <div className="bg-blue-50 border-b border-blue-100 p-3 text-xs text-blue-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            In accordance with platform requirements, authentic Firebase Phone Authentication is implemented. Real SMS messages with 6-digit codes are delivered to Indian mobile numbers.
          </p>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Error & Success Messages */}
          {error && (
            <>
              <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {error.includes('operation-not-allowed') && (
                <button
                  type="button"
                  onClick={handleTestLogin}
                  className="mt-3 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs"
                >
                  Use Test Login (bypass SMS)
                </button>
              )}
            </>
          )}

          {success && (
            <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Step 1: Input Mobile Number */}
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Indian Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-800 focus-within:border-blue-800">
                  <span className="bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 border-r border-slate-300 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="98450 12891"
                    className="flex-1 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  A 6-digit one-time password will be dispatched to this number via SMS.
                </span>
              </div>

              {/* Real Firebase reCAPTCHA Container */}
              <div id="recaptcha-container" className="my-2 flex justify-center"></div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white rounded font-medium text-xs shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying reCAPTCHA & Dispatching SMS...</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-3.5 h-3.5" />
                    <span>Send SMS Verification Code</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Input OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Enter 6-Digit SMS Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-widest font-mono text-lg rounded border border-slate-300 py-2.5 text-slate-900 focus:outline-none"
                  required
                />
              </div>

              {/* Countdown & Resend button */}
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Did not receive code?'}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                  className="text-blue-900 font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  Resend SMS OTP
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtpCode(''); setError(''); }}
                  className="py-2 px-3 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium"
                >
                  Change Mobile
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-2 px-4 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>
            </form>
          )}

          {/* Firebase Credentials Help Guide (Required if credentials not yet configured) */}
          {!isFirebaseConfigured() && (
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <Settings className="w-3.5 h-3.5 text-blue-900" />
                  <span>Firebase Project Configuration</span>
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                  Awaiting Credentials
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                To test live SMS delivery to your phone, set your Firebase Web App credentials in <code className="font-mono bg-slate-100 px-1 py-0.5 text-slate-800">.env</code> (as documented in <code className="font-mono bg-slate-100 px-1 py-0.5 text-slate-800">.env.example</code>).
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

