import { db, storage, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createNotification } from './notificationService';
import { getDepartmentById } from './departmentService';
import {
  validateComplaintInput,
  validateImageFile,
  findDuplicateComplaint,
  validateStatusTransition,
  checkClientRateLimit,
  assertAdminAuthorized,
  sanitizeText
} from '../utils/security';

// 10 Official Categories with Subcategories
export const COMPLAINT_CATEGORIES = [
  {
    id: 'road-damage',
    name: 'Road Damage',
    departmentId: 'dept-rmd',
    subcategories: [
      'Potholes and Craters',
      'Road Cave-in / Collapse',
      'Broken Footpath / Pavement',
      'Damaged Divider / Curb',
      'Damaged Speed Breaker'
    ]
  },
  {
    id: 'garbage-collection',
    name: 'Garbage Collection',
    departmentId: 'dept-swm',
    subcategories: [
      'Uncollected Garbage Dump',
      'Overflowing Community Bin',
      'Commercial Waste Dumping',
      'Bio-medical Waste Dump',
      'Dead Animal Removal'
    ]
  },
  {
    id: 'water-supply',
    name: 'Water Supply',
    departmentId: 'dept-wsb',
    subcategories: [
      'Pipeline Leakage / Burst',
      'Contaminated Drinking Water',
      'No Water Supply Outage',
      'Low Water Pressure',
      'Water Meter Fault'
    ]
  },
  {
    id: 'drainage',
    name: 'Drainage',
    departmentId: 'dept-drn',
    subcategories: [
      'Open / Broken Manhole Cover',
      'Sewage Overflow on Street',
      'Blocked Stormwater Drain',
      'Waterlogging on Road',
      'Foul Odor from Gutter'
    ]
  },
  {
    id: 'street-lights',
    name: 'Street Lights',
    departmentId: 'dept-discom',
    subcategories: [
      'Streetlight Not Working (Dark Corridor)',
      'Flickering / Damaged LED',
      'Continuous Day Burning',
      'Broken Light Pole',
      'Broken Timer Circuit'
    ]
  },
  {
    id: 'electricity',
    name: 'Electricity',
    departmentId: 'dept-discom',
    subcategories: [
      'Hanging Live Wire / Sparking',
      'Damaged Feeder Transformer',
      'Exposed Low-Tension Cable',
      'Frequent Voltage Fluctuations',
      'Electric Pole Tilting Danger'
    ]
  },
  {
    id: 'public-safety',
    name: 'Public Safety',
    departmentId: 'dept-psd',
    subcategories: [
      'Illegal Encroachment Blocking Road',
      'Unauthorized Parking on Footpath',
      'Open Construction Excavation',
      'Hazardous Building Structure',
      'Missing Road Warning Signs'
    ]
  },
  {
    id: 'sanitation',
    name: 'Sanitation',
    departmentId: 'dept-swm',
    subcategories: [
      'Uncleaned Public Restroom',
      'Open Urination / Defecation Spot',
      'Mosquito Breeding Stagnant Water',
      'Stray Cattle / Dog Hazard',
      'Debris & Construction Dust'
    ]
  },
  {
    id: 'public-infrastructure',
    name: 'Public Infrastructure',
    departmentId: 'dept-pwd',
    subcategories: [
      'Damaged Flyover Barrier / Railing',
      'Broken Bus Stop Shelter',
      'Public Park Bench / Equipment Damage',
      'Subway Waterlogging / Darkness',
      'Pedestrian Subway Elevator Fault'
    ]
  },
  {
    id: 'other',
    name: 'Other Civic Grievance',
    departmentId: 'dept-pwd',
    subcategories: [
      'General Civic Problem',
      'Noise / Smoke Pollution in Residential Area',
      'Unauthorized Hoarding / Banner',
      'Miscellaneous'
    ]
  }
];

// Generate unique compliant complaint ID: NAG-2026-XXXXXXXX
export function generateComplaintId() {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 8; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `NAG-2026-${randomStr}`;
}

const LOCAL_STORAGE_COMPLAINTS_KEY = 'nagrik_firestore_complaints_backup_v3';

// Initial seed records for realistic demonstration
export const INITIAL_SEED_COMPLAINTS = [
  {
    id: 'NAG-2026-7842B109',
    complaintId: 'NAG-2026-7842B109',
    userId: 'usr-demo-01',
    citizenName: 'Aditya Sharma',
    citizenPhone: '+91 98450 12891',
    citizenEmail: 'aditya.sharma@example.in',
    title: 'Severe road crater pothole near Outer Ring Road flyover descent',
    description: 'A 2-foot deep pothole has emerged on the right lane of Outer Ring Road right after the flyover descent. Vehicles swerve abruptly during peak evening hours, causing skid hazards for two-wheelers.',
    category: 'road-damage',
    categoryName: 'Road Damage',
    subcategory: 'Potholes and Craters',
    severity: 'High',
    departmentId: 'dept-rmd',
    departmentName: 'Road Maintenance Division',
    status: 'In Progress',
    address: 'Pillar 142, Outer Ring Road, Near Flyover Descent',
    latitude: 12.9716,
    longitude: 77.6412,
    ward: 'Ward 04 - Indiranagar Tech Corridor',
    landmark: 'Opposite Metro Pillar 142',
    imageUrls: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
    resolutionProofUrl: '',
    aiAnalysis: {
      suggestedCategory: 'Road Damage',
      suggestedSeverity: 'High',
      suggestedDepartment: 'Road Maintenance Division',
      confidence: 0.94,
      isAiSuggestion: true,
      reasoning: 'Extracted high risk road keywords: "crater", "pothole", "flyover descent", "skid hazard".'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    timeline: [
      {
        id: 'tl-1',
        status: 'Submitted',
        title: 'Complaint Registered',
        remarks: 'Complaint lodged by citizen with photograph and location coordinates.',
        officer: 'Citizen Portal Automated Intake',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      },
      {
        id: 'tl-2',
        status: 'Under Review',
        title: 'Preliminary Triage Completed',
        remarks: 'Control Room verified jurisdictional boundary under Ward 04 arterial corridor.',
        officer: 'Municipal Control Room',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
      },
      {
        id: 'tl-3',
        status: 'In Progress',
        title: 'Asphalt Repair Crew Dispatched',
        remarks: 'Work order #RMD-402 issued. Cold-mix patch truck on site with barricading.',
        officer: 'Er. Rajeshwar Rao (Asphalt Supervisor)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
      }
    ]
  },
  {
    id: 'NAG-2026-9281C440',
    complaintId: 'NAG-2026-9281C440',
    userId: 'usr-demo-02',
    citizenName: 'Priyanka Sen',
    citizenPhone: '+91 97118 54210',
    citizenEmail: 'priyanka.s@example.in',
    title: 'Dangling live electrical cable sparking outside St. Jude School Gate 2',
    description: 'During yesterday windstorm, an overhead 440V line broke from the insulator and is dangling right at eye-level near the pedestrian school bus gate. Sparks visible in damp conditions.',
    category: 'electricity',
    categoryName: 'Electricity',
    subcategory: 'Hanging Live Wire / Sparking',
    severity: 'High',
    departmentId: 'dept-discom',
    departmentName: 'Electricity & Street Lighting Board',
    status: 'Resolved',
    address: 'Gate 2, St. Jude School Lane, Green Glen Layout',
    latitude: 12.9234,
    longitude: 77.6710,
    ward: 'Ward 12 - Green Glen Residential',
    landmark: 'Outside School Gate 2',
    imageUrls: ['https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'],
    resolutionProofUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    aiAnalysis: {
      suggestedCategory: 'Electricity',
      suggestedSeverity: 'High',
      suggestedDepartment: 'Electricity & Street Lighting Board',
      confidence: 0.98,
      isAiSuggestion: true,
      reasoning: 'Detected urgent electrical safety hazards: "live wire", "sparking", "school gate".'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    timeline: [
      {
        id: 'tl-1',
        status: 'Submitted',
        title: 'Emergency Complaint Registered',
        remarks: 'Citizen reported high-risk electrical wire near school.',
        officer: 'Citizen Portal',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString()
      },
      {
        id: 'tl-2',
        status: 'Under Review',
        title: 'Feeder De-energized',
        remarks: 'Sub-station line operator tripped 440V distribution breaker.',
        officer: 'DISCOM Central Grid',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 38).toISOString()
      },
      {
        id: 'tl-3',
        status: 'In Progress',
        title: 'Line Crew on Site',
        remarks: 'Emergency bucket truck deployed to replace ceramic cross-arm.',
        officer: 'Vipin Chandran (Line Inspector)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
      },
      {
        id: 'tl-4',
        status: 'Resolved',
        title: 'Cable Restrung & Verified Safe',
        remarks: 'Installed replacement insulated armored conductor. Voltage tests nominal.',
        officer: 'Vipin Chandran (Line Inspector)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
      }
    ]
  },
  {
    id: 'NAG-2026-6102A882',
    complaintId: 'NAG-2026-6102A882',
    userId: 'usr-demo-03',
    citizenName: 'Rohan Mehra',
    citizenPhone: '+91 99881 22345',
    citizenEmail: 'rohan.m@marketassoc.in',
    title: 'Commercial market garbage dump overflow spilling into traffic lane',
    description: 'Community garbage collection containers at Sector 18 shopping market have not been cleared for 3 consecutive days. Waste has spilled over into the vehicular roadway.',
    category: 'garbage-collection',
    categoryName: 'Garbage Collection',
    subcategory: 'Overflowing Community Bin',
    severity: 'Medium',
    departmentId: 'dept-swm',
    departmentName: 'Sanitation & Solid Waste Management',
    status: 'Under Review',
    address: 'Main Entrance, Sector 18 Commercial Market, Plaza Road',
    latitude: 28.5700,
    longitude: 77.3200,
    ward: 'Ward 07 - Sector 18 Commercial',
    landmark: 'Near Supermarket Parking Lot',
    imageUrls: ['https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80'],
    resolutionProofUrl: '',
    aiAnalysis: {
      suggestedCategory: 'Garbage Collection',
      suggestedSeverity: 'Medium',
      suggestedDepartment: 'Sanitation & Solid Waste Management',
      confidence: 0.91,
      isAiSuggestion: true,
      reasoning: 'Detected waste obstruction in commercial area.'
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    timeline: [
      {
        id: 'tl-1',
        status: 'Submitted',
        title: 'Sanitation Complaint Lodged',
        remarks: 'Reported by Market Association.',
        officer: 'Citizen Portal',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString()
      },
      {
        id: 'tl-2',
        status: 'Under Review',
        title: 'Reviewing Compactor Route',
        remarks: 'Assigned to Ward 07 morning mechanical compactor schedule.',
        officer: 'Mohd. Salim (Sanitation Inspector)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ]
  }
];

function getLocalComplaints() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COMPLAINTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_COMPLAINTS_KEY, JSON.stringify(INITIAL_SEED_COMPLAINTS));
      return INITIAL_SEED_COMPLAINTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_COMPLAINTS;
  } catch (e) {
    return INITIAL_SEED_COMPLAINTS;
  }
}

function saveLocalComplaints(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_COMPLAINTS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to save to local backup:', e);
  }
}

// Upload actual image to Firebase Storage with strict validation
export async function uploadComplaintImage(file, complaintId) {
  if (!file) return null;

  const fileValidation = validateImageFile(file);
  if (!fileValidation.valid) {
    const err = new Error(fileValidation.error);
    err.code = 'INVALID_IMAGE_FILE';
    throw err;
  }

  // Client-side compression using canvas when supported in browser
  const compressImage = (blob) => new Promise((resolve) => {
    if (typeof Image === 'undefined' || typeof document === 'undefined' || !URL?.createObjectURL) {
      resolve(blob);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1024;
      let { width, height } = img;
      if (width > height) {
        if (width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
      } else {
        if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((compressed) => resolve(compressed || blob), file.type, 0.75);
    };
    img.onerror = () => resolve(blob);
    img.src = URL.createObjectURL(blob);
  });

  let fileToUpload = file;
  try {
    if (file.type.startsWith('image/')) {
      fileToUpload = await compressImage(file);
    }
  } catch {
    fileToUpload = file;
  }

  if (isFirebaseConfigured() && storage) {
    try {
      const extension = (file.name && file.name.split('.').pop()) || 'jpg';
      const storageRef = ref(storage, `complaints/${complaintId}/${Date.now()}_evidence.${extension}`);
      const uploadResult = await uploadBytes(storageRef, fileToUpload, { contentType: file.type });
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload failed, using local DataURL:', err);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(fileToUpload);
  });
}

export { getLocalComplaints, saveLocalComplaints };

export async function createComplaintRecord(complaintInput, imageFile = null, options = {}) {
  // 1. Validate & sanitize all inputs server/service-side
  const validation = validateComplaintInput(complaintInput);
  if (!validation.valid) {
    const firstMsg = Object.values(validation.errors)[0] || 'Invalid complaint input.';
    const err = new Error(firstMsg);
    err.code = 'VALIDATION_ERROR';
    err.validationErrors = validation.errors;
    throw err;
  }

  const clean = validation.sanitized;

  // 2. Client-side rate limiting guard
  if (!options.skipRateLimit) {
    const rate = checkClientRateLimit(clean.userId || 'guest-user', 5, 60 * 1000);
    if (!rate.allowed) {
      const err = new Error(`Too many submissions. Please wait ${rate.retryAfterSeconds}s before submitting again.`);
      err.code = 'RATE_LIMIT_EXCEEDED';
      throw err;
    }
  }

  // 3. Duplicate submission detection
  const currentList = getLocalComplaints();
  if (!options.allowDuplicate) {
    const dup = findDuplicateComplaint(clean, currentList);
    if (dup) {
      const err = new Error(`Potential duplicate complaint detected (${dup.matchedComplaintId}): ${dup.reason}`);
      err.code = 'DUPLICATE_COMPLAINT';
      err.matchedComplaintId = dup.matchedComplaintId;
      throw err;
    }
  }

  const complaintId = generateComplaintId();
  const categoryConfig = COMPLAINT_CATEGORIES.find(c => c.id === clean.category) || COMPLAINT_CATEGORIES[0];
  const deptConfig = getDepartmentById(categoryConfig.departmentId);

  // 4. Upload & validate image
  let uploadedImageUrl = clean.imageUrl || '';
  if (imageFile) {
    uploadedImageUrl = await uploadComplaintImage(imageFile, complaintId);
  }

  const newDocData = {
    id: complaintId,
    complaintId: complaintId,
    userId: sanitizeText(clean.userId || 'guest-user', 80),
    citizenName: clean.citizenName,
    citizenPhone: clean.citizenPhone,
    citizenEmail: clean.citizenEmail,
    title: clean.title,
    description: clean.description,
    category: clean.category,
    categoryName: categoryConfig.name,
    subcategory: sanitizeText(clean.subcategory || categoryConfig.subcategories[0], 100),
    severity: clean.severity || 'Medium',
    priority: clean.severity || 'Medium',
    departmentId: deptConfig.id,
    departmentName: deptConfig.name,
    status: 'Submitted',
    address: clean.address,
    latitude: clean.latitude !== undefined ? Number(clean.latitude) : 28.6139,
    longitude: clean.longitude !== undefined ? Number(clean.longitude) : 77.2090,
    ward: sanitizeText(clean.ward || 'Ward 01 - Connaught Hub', 100),
    landmark: clean.landmark || '',
    imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [],
    resolutionProofUrl: '',
    aiAnalysis: clean.aiAnalysis || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      {
        id: `tl-${Date.now()}`,
        status: 'Submitted',
        title: 'Complaint Registered',
        remarks: 'Complaint lodged by citizen with validated inputs and location coordinates.',
        officer: clean.citizenName || 'Citizen Portal Automated Intake',
        timestamp: new Date().toISOString()
      }
    ]
  };

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'complaints', complaintId), {
        ...newDocData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Write initial update to subcollection
      await addDoc(collection(db, 'complaints', complaintId, 'updates'), {
        status: 'Submitted',
        title: 'Complaint Registered',
        remarks: 'Complaint lodged by citizen with photograph and location coordinates.',
        officer: clean.citizenName || 'Citizen Portal Automated Intake',
        timestamp: serverTimestamp()
      });

      // Add to audit_logs
      await addDoc(collection(db, 'audit_logs'), {
        complaintId,
        action: 'COMPLAINT_CREATED',
        userId: newDocData.userId,
        timestamp: serverTimestamp()
      });

      // Send confirmation notification
      await createNotification(
        newDocData.userId,
        'Grievance Registered',
        `Your complaint ${complaintId} has been successfully submitted and queued for review.`,
        complaintId,
        'complaint_submitted'
      );
    } catch (err) {
      console.error('Firestore complaint creation failed:', err);
      // fallback to local
    }
  }

  // Save to local backup as well to guarantee persistence
  const latestList = getLocalComplaints();
  saveLocalComplaints([newDocData, ...latestList]);

  // Also create local notification
  await createNotification(
    newDocData.userId,
    'Grievance Registered',
    `Your complaint ${complaintId} has been successfully submitted and queued for review.`,
    complaintId,
    'complaint_submitted'
  );

  return newDocData;
}

// Subscribe to a single complaint with real-time Firestore listener
export function subscribeComplaintById(complaintId, callback) {
  if (!complaintId) {
    callback(null);
    return () => {};
  }

  const cleanId = complaintId.trim().toUpperCase();

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'complaints', cleanId);
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt
          });
        } else {
          // Check local backup
          const list = getLocalComplaints();
          callback(list.find(c => c.id.toUpperCase() === cleanId) || null);
        }
      }, (err) => {
        console.warn('Complaint snapshot error:', err);
        const list = getLocalComplaints();
        callback(list.find(c => c.id.toUpperCase() === cleanId) || null);
      });
    } catch (e) {
      // fallback
    }
  }

  // Local reactive listener
  const findLocal = () => {
    const list = getLocalComplaints();
    return list.find(c => c.id.toUpperCase() === cleanId) || null;
  };

  callback(findLocal());
  const handler = () => callback(findLocal());
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

// Subscribe to a user's complaints
export function subscribeUserComplaints(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  if (isFirebaseConfigured() && db) {
    try {
      const q = query(
        collection(db, 'complaints'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            createdAt: d.createdAt?.toDate?.()?.toISOString?.() || d.createdAt,
            updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() || d.updatedAt
          };
        });
        callback(items);
      }, (err) => {
        console.warn('User complaints query error:', err);
        const list = getLocalComplaints().filter(c => c.userId === userId);
        callback(list);
      });
    } catch (e) {
      // fallback
    }
  }

  const getFilteredLocal = () => {
    return getLocalComplaints().filter(c => c.userId === userId);
  };

  callback(getFilteredLocal());
  const handler = () => callback(getFilteredLocal());
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

// Subscribe to all complaints for Admin Dashboard
export function subscribeAllComplaints(callback) {
  if (isFirebaseConfigured() && db) {
    try {
      const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            createdAt: d.createdAt?.toDate?.()?.toISOString?.() || d.createdAt,
            updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() || d.updatedAt
          };
        });
        callback(items);
      }, (err) => {
        console.warn('All complaints query error:', err);
        callback(getLocalComplaints());
      });
    } catch (e) {
      // fallback
    }
  }

  callback(getLocalComplaints());
  const handler = () => callback(getLocalComplaints());
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

// Update complaint status & assign department (Admin operation - authorization enforced)
export async function updateComplaintStatusFirestore(
  complaintId,
  newStatus,
  remarks = '',
  resolutionPhotoFile = null,
  assignedDepartmentId = null,
  assignedOfficer = '',
  actorContext = null
) {
  // Enforce administrative authorization before any state mutation
  assertAdminAuthorized(actorContext);

  const localList = getLocalComplaints();
  const existingRecord = localList.find(c => c.id === complaintId);
  const currentStatus = existingRecord?.status || 'Submitted';

  const transitionCheck = validateStatusTransition(currentStatus, newStatus, remarks);
  if (!transitionCheck.valid) {
    const err = new Error(transitionCheck.error);
    err.code = 'INVALID_STATUS_TRANSITION';
    throw err;
  }

  const cleanRemarks = transitionCheck.sanitizedRemarks;
  const cleanOfficer = sanitizeText(assignedOfficer, 100) || 'Municipal Administrative Officer';

  let resolutionPhotoUrl = '';
  if (resolutionPhotoFile) {
    if (typeof resolutionPhotoFile === 'string') {
      resolutionPhotoUrl = sanitizeText(resolutionPhotoFile, 500);
    } else {
      resolutionPhotoUrl = await uploadComplaintImage(resolutionPhotoFile, `${complaintId}_resolution`);
    }
  }

  const newTimelineEvent = {
    id: `tl-${Date.now()}`,
    status: newStatus,
    title: `Status Updated to ${newStatus}`,
    remarks: cleanRemarks || `Workflow status transitioned to ${newStatus}.`,
    officer: cleanOfficer,
    timestamp: new Date().toISOString()
  };

  let targetUserId = '';

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'complaints', complaintId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        targetUserId = snap.data().userId;
        const currentTimeline = snap.data().timeline || [];

        const updatePayload = {
          status: newStatus,
          updatedAt: serverTimestamp(),
          timeline: [...currentTimeline, newTimelineEvent]
        };

        if (resolutionPhotoUrl) {
          updatePayload.resolutionProofUrl = resolutionPhotoUrl;
        }

        if (assignedDepartmentId) {
          const dept = getDepartmentById(assignedDepartmentId);
          updatePayload.departmentId = dept.id;
          updatePayload.departmentName = dept.name;
        }

        if (cleanOfficer) {
          updatePayload.assignedOfficer = cleanOfficer;
        }

        await updateDoc(docRef, updatePayload);

        await addDoc(collection(db, 'complaints', complaintId, 'updates'), {
          status: newStatus,
          remarks: cleanRemarks || `Status marked as ${newStatus}`,
          officer: cleanOfficer,
          timestamp: serverTimestamp()
        });

        await addDoc(collection(db, 'audit_logs'), {
          complaintId,
          action: `STATUS_CHANGE_${newStatus.toUpperCase()}`,
          officer: cleanOfficer,
          timestamp: serverTimestamp()
        });
      }
    } catch (err) {
      if (err?.code === 'permission-denied' || err?.code === 'unauthenticated') {
        throw err;
      }
      console.warn('Firestore status update unreachable, applying local state fallback:', err?.message || err);
    }
  }

  // Update local record
  const list = getLocalComplaints();
  const index = list.findIndex(c => c.id === complaintId);
  if (index === -1) {
    const err = new Error(`Complaint record "${complaintId}" not found.`);
    err.code = 'COMPLAINT_NOT_FOUND';
    throw err;
  }

  const item = { ...list[index] };
  targetUserId = item.userId;
  item.status = newStatus;
  item.updatedAt = new Date().toISOString();
  item.timeline = [...(item.timeline || []), newTimelineEvent];

  if (resolutionPhotoUrl) {
    item.resolutionProofUrl = resolutionPhotoUrl;
  }
  if (assignedDepartmentId) {
    const dept = getDepartmentById(assignedDepartmentId);
    item.departmentId = dept.id;
    item.departmentName = dept.name;
  }
  item.assignedOfficer = cleanOfficer;

  list[index] = item;
  saveLocalComplaints(list);

  if (targetUserId) {
    await createNotification(
      targetUserId,
      `Complaint ${complaintId} Status: ${newStatus}`,
      cleanRemarks || `Your complaint has been updated to ${newStatus}.`,
      complaintId,
      'status_update'
    );
  }

  return item;
}

