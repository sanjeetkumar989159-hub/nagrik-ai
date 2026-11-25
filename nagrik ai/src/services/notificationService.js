import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp, 
  getDocs 
} from 'firebase/firestore';

export function subscribeUserNotifications(userId, callback) {
  if (!isFirebaseConfigured() || !db || !userId) {
    // If Firebase is not configured, listen to local notifications
    const getLocal = () => {
      try {
        const raw = localStorage.getItem(`nagrik_notifications_${userId}`);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    };
    callback(getLocal());
    const handler = () => callback(getLocal());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || doc.data().createdAt || new Date().toISOString()
      }));
      callback(items);
    }, (err) => {
      console.warn('Notifications onSnapshot error:', err);
    });
  } catch (err) {
    console.warn('Could not subscribe to notifications:', err);
    return () => {};
  }
}

export async function createNotification(userId, title, message, complaintId, type = 'status_update') {
  if (!userId) return null;

  const notifData = {
    userId,
    title,
    message,
    complaintId: complaintId || '',
    type,
    read: false,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured() && db) {
    try {
      const ref = await addDoc(collection(db, 'notifications'), {
        ...notifData,
        createdAt: serverTimestamp()
      });
      return ref.id;
    } catch (err) {
      console.error('Failed to create notification in Firestore:', err);
    }
  }

  // Local fallback
  try {
    const key = `nagrik_notifications_${userId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newRecord = { id: `notif-${Date.now()}`, ...notifData };
    localStorage.setItem(key, JSON.stringify([newRecord, ...existing]));
    window.dispatchEvent(new Event('storage'));
    return newRecord.id;
  } catch (e) {
    return null;
  }
}

export async function markNotificationAsRead(userId, notificationId) {
  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }

  try {
    const key = `nagrik_notifications_${userId}`;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = list.map(n => n.id === notificationId ? { ...n, read: true } : n);
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    return true;
  } catch (e) {
    return false;
  }
}

