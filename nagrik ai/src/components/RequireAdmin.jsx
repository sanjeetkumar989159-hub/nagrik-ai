import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

/**
 * RequireAdmin - Enforces role-based access around administrative workspaces.
 * Checks Firebase custom claims / Firestore profile when Firebase Auth is active,
 * or verified application role state in offline/demo evaluation mode.
 */
export default function RequireAdmin({
  children,
  currentUser = null,
  currentRole = 'citizen',
  onSwitchToAdmin = null
}) {
  const [firebaseAdmin, setFirebaseAdmin] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setFirebaseAdmin(false);
      return;
    }

    setChecking(true);
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFirebaseAdmin(false);
        setChecking(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult();
        if (tokenResult?.claims?.admin === true) {
          setFirebaseAdmin(true);
          setChecking(false);
          return;
        }

        if (db) {
          const snap = await getDoc(doc(db, 'users', user.uid));
          const data = snap.exists() ? snap.data() : null;
          setFirebaseAdmin(data?.role === 'admin');
        } else {
          setFirebaseAdmin(false);
        }
      } catch {
        setFirebaseAdmin(false);
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
  }, []);

  const hasAppAdminSession = currentRole === 'admin' || currentUser?.role === 'admin';
  const isAuthorized = Boolean(firebaseAdmin || hasAppAdminSession);

  if (checking && !hasAppAdminSession) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-sm text-slate-600" role="status">
        Verifying administrative credentials...
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <section
        aria-labelledby="admin-access-denied-heading"
        className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 id="admin-access-denied-heading" className="text-xl font-bold text-slate-900">
          Authorized Municipal Access Required
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          The Administrative Management Console is restricted to authorized municipal operators.
          Status transitions and department dispatches are rejected unless valid administrative authorization is present.
        </p>
        {onSwitchToAdmin && !isFirebaseConfigured() && (
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
            >
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>Enter Demo Evaluation Admin Session</span>
            </button>
            <p className="text-[11px] text-slate-500">
              Demo-only role elevation when Firebase backend is not configured. In Firebase mode, Firestore rules enforce server-side admin claims.
            </p>
          </div>
        )}
      </section>
    );
  }

  return <>{children}</>;
}
