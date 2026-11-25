import { auth, db, isFirebaseConfigured } from './firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const LOCAL_SESSION_KEY = 'nagrik_user_session_v3';

// Set up Firebase reCAPTCHA for Phone Auth
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase is not configured. Please supply Firebase credentials in .env.');
  }

  // Clear previous verifier if exists
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // ignore
    }
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'normal',
    callback: (response) => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired');
    }
  });

  return window.recaptchaVerifier;
}

// Send real SMS OTP to Indian phone number (+91)
export async function sendPhoneOtp(fullPhoneNumber, containerId = 'recaptcha-container') {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error('Firebase credentials not configured in .env. Real SMS OTP requires a connected Firebase project.');
  }

  // Ensure +91 format
  const sanitized = fullPhoneNumber.startsWith('+') ? fullPhoneNumber : `+91${fullPhoneNumber}`;

  const verifier = setupRecaptcha(containerId);
  const confirmationResult = await signInWithPhoneNumber(auth, sanitized, verifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
}

// Confirm OTP code sent to user
export async function verifyPhoneOtp(otpCode) {
  if (!window.confirmationResult) {
    throw new Error('No pending OTP verification found. Please request a new OTP code.');
  }

  const result = await window.confirmationResult.confirm(otpCode);
  const user = result.user;

  // Retrieve or create citizen profile in Firestore
  let profile = await syncUserProfile(user);
  return { user, profile };
}

// Sync user profile in Firestore
export async function syncUserProfile(firebaseUser, additionalData = {}) {
  const uid = firebaseUser.uid;
  let profile = {
    uid,
    phoneNumber: firebaseUser.phoneNumber || '',
    name: additionalData.name || firebaseUser.displayName || 'Citizen',
    address: additionalData.address || '',
    photoURL: additionalData.photoURL || firebaseUser.photoURL || '',
    role: 'citizen',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const existingData = snap.data();
        profile = {
          ...existingData,
          ...additionalData,
          uid,
          role: existingData.role || 'citizen' // Never overwrite role!
        };
        await updateDoc(userRef, {
          updatedAt: serverTimestamp(),
          ...(additionalData.name ? { name: additionalData.name } : {}),
          ...(additionalData.address ? { address: additionalData.address } : {})
        });
      } else {
        await setDoc(userRef, {
          ...profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn('Could not sync user profile in Firestore:', err);
    }
  }

  // Persist session to local storage
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
  return profile;
}

// Update profile details permitted for citizen
export async function updateUserProfile(uid, { name, address, photoURL }) {
  const current = getCurrentSessionUser();
  const updated = {
    ...current,
    ...(name !== undefined ? { name } : {}),
    ...(address !== undefined ? { address } : {}),
    ...(photoURL !== undefined ? { photoURL } : {})
  };

  if (isFirebaseConfigured() && db && uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...(name !== undefined ? { name } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(photoURL !== undefined ? { photoURL } : {}),
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Error updating user document:', e);
    }
  }

  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updated));
  return updated;
}

// Read current cached session user
export function getCurrentSessionUser() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Sign out user
export async function logoutUser() {
  if (isFirebaseConfigured() && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
  }
  localStorage.removeItem(LOCAL_SESSION_KEY);
  window.confirmationResult = null;
  return true;
}

// Listen to Firebase Auth state
export function initAuthListener(onUserChange) {
  if (isFirebaseConfigured() && auth) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await syncUserProfile(firebaseUser);
        onUserChange(profile);
      } else {
        const local = getCurrentSessionUser();
        // If Firebase says not logged in, clear session
        if (local && local.uid?.startsWith('usr-real')) {
          localStorage.removeItem(LOCAL_SESSION_KEY);
          onUserChange(null);
        } else {
          onUserChange(local);
        }
      }
    });
  }

  // If Firebase not connected, return stored session
  onUserChange(getCurrentSessionUser());
  return () => {};
}

// Admin role check (enforced server-side in security rules and client-side guards)
export function isUserAdmin(user) {
  if (!user) return false;
  return user.role === 'admin';
}
