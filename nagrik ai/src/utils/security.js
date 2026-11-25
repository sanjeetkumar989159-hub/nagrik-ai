/**
 * NAGRIK AI - Input Validation, Output Sanitization & Authorization Utilities
 *
 * Provides deterministic client-side defense-in-depth helpers.
 * Server-side enforcement in production is handled by Firebase Auth & Firestore/Storage Rules
 * (firestore.rules and storage.rules). Local demo mode uses in-browser storage and explicitly
 * labels its scope without claiming cryptographic backend guarantees.
 */

export const ALLOWED_STATUSES = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected'
];

export const VALID_CATEGORY_IDS = [
  'road-damage',
  'water-supply',
  'electricity',
  'garbage-collection',
  'drainage',
  'street-lights',
  'public-safety',
  'sanitation',
  'public-infrastructure',
  'other'
];

export const STATUS_TRANSITIONS = {
  'Submitted': ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Rejected'],
  'Under Review': ['Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
  'Assigned': ['Assigned', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
  'In Progress': ['In Progress', 'Assigned', 'Under Review', 'Resolved', 'Rejected'],
  'Resolved': ['Resolved', 'Under Review'],
  'Rejected': ['Rejected', 'Under Review']
};

/**
 * Strips potentially dangerous HTML/script payloads and control characters from user text.
 */
export function sanitizeText(value, maxLength = 2000) {
  if (value === null || value === undefined) return '';
  const str = String(value)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();

  if (maxLength && str.length > maxLength) {
    return str.slice(0, maxLength);
  }
  return str;
}

/**
 * Neutralizes spreadsheet formula injection (=, +, -, @, tab, CR) when exporting CSV.
 */
export function sanitizeCsvCell(value) {
  const raw = sanitizeText(value, 1000);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * Validates Indian mobile number (10 digits starting 6-9, optional +91 prefix).
 */
export function isValidIndianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return /^[6-9]\d{9}$/.test(digits);
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(digits.slice(2));
  }
  return false;
}

/**
 * Validates email format if provided.
 */
export function isValidEmail(email) {
  if (!email || !String(email).trim()) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

/**
 * Validates uploaded image files (MIME type, extension, and size <= 5 MB).
 */
export function validateImageFile(file, maxBytes = 5 * 1024 * 1024) {
  if (!file) {
    return { valid: true, error: null };
  }
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid image format. Only JPEG, PNG, and WebP files are permitted.'
    };
  }

  const name = typeof file.name === 'string' ? file.name : '';
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  if (ext && !allowedExts.includes(ext)) {
    return {
      valid: false,
      error: 'Invalid file extension. Allowed extensions: .jpg, .jpeg, .png, .webp.'
    };
  }

  if (typeof file.size === 'number' && file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds the ${Math.round(maxBytes / (1024 * 1024))} MB limit.`
    };
  }

  return { valid: true, error: null };
}

/**
 * Validates complete complaint submission payload.
 */
export function validateComplaintInput(input = {}) {
  const errors = {};
  const title = sanitizeText(input.title, 160);
  const description = sanitizeText(input.description, 2000);
  const address = sanitizeText(input.address, 300);
  const landmark = sanitizeText(input.landmark, 160);
  const citizenName = sanitizeText(input.citizenName, 100);
  const citizenPhone = sanitizeText(input.citizenPhone, 20);
  const citizenEmail = sanitizeText(input.citizenEmail, 120);
  const category = sanitizeText(input.category, 60);

  if (!title || title.length < 8) {
    errors.title = 'Complaint title must be at least 8 characters.';
  }
  if (!description || description.length < 15) {
    errors.description = 'Description must provide at least 15 characters of detail.';
  }
  if (!category || !VALID_CATEGORY_IDS.includes(category)) {
    errors.category = 'Please select a valid civic category.';
  }
  if (!address || address.length < 5) {
    errors.address = 'Please specify a valid street address or location description (min 5 characters).';
  }
  if (!citizenName || citizenName.length < 2) {
    errors.citizenName = 'Please enter citizen name (min 2 characters).';
  }
  if (!isValidIndianPhone(citizenPhone)) {
    errors.citizenPhone = 'Please provide a valid 10-digit Indian mobile number.';
  }
  if (!isValidEmail(citizenEmail)) {
    errors.citizenEmail = 'Please provide a valid email address.';
  }

  if (input.latitude !== undefined && input.latitude !== null && input.latitude !== '') {
    const lat = Number(input.latitude);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      errors.location = 'Invalid latitude coordinate.';
    }
  }
  if (input.longitude !== undefined && input.longitude !== null && input.longitude !== '') {
    const lng = Number(input.longitude);
    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      errors.location = 'Invalid longitude coordinate.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      ...input,
      title,
      description,
      address,
      landmark,
      citizenName,
      citizenPhone,
      citizenEmail,
      category: VALID_CATEGORY_IDS.includes(category) ? category : 'other'
    }
  };
}

/**
 * Generates normalized fingerprint for duplicate complaint detection.
 */
export function computeComplaintFingerprint(title = '', address = '', category = '') {
  const normalize = (s) =>
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  return `${normalize(category)}::${normalize(title)}::${normalize(address)}`;
}

/**
 * Checks whether an incoming complaint duplicates a recent submission within windowMs.
 */
export function findDuplicateComplaint(candidate, existingComplaints = [], windowMs = 10 * 60 * 1000) {
  if (!Array.isArray(existingComplaints) || existingComplaints.length === 0) {
    return null;
  }

  const candidateFp = computeComplaintFingerprint(
    candidate.title,
    candidate.address,
    candidate.category
  );

  const candidateTokens = new Set(
    `${candidate.title} ${candidate.address}`
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  const now = Date.now();

  for (const existing of existingComplaints) {
    if (existing.status === 'Rejected' || existing.status === 'Resolved') continue;

    const existingTime = existing.createdAt ? new Date(existing.createdAt).getTime() : 0;
    const withinWindow = existingTime > 0 ? (now - existingTime) <= windowMs : true;
    const existingFp = computeComplaintFingerprint(
      existing.title,
      existing.address,
      existing.category
    );

    if (existingFp === candidateFp && withinWindow) {
      return {
        isDuplicate: true,
        reason: 'Identical complaint submitted within the last 10 minutes.',
        matchedComplaintId: existing.id
      };
    }

    // Check same category + same ward + high token overlap within 24 hours
    if (
      existing.category === candidate.category &&
      existing.ward === candidate.ward &&
      candidateTokens.size >= 3
    ) {
      const existingTokens = new Set(
        `${existing.title} ${existing.address}`
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3)
      );
      let overlap = 0;
      for (const tok of candidateTokens) {
        if (existingTokens.has(tok)) overlap++;
      }
      const jaccard = overlap / Math.max(1, new Set([...candidateTokens, ...existingTokens]).size);
      if (jaccard >= 0.65) {
        return {
          isDuplicate: true,
          reason: `Very similar active complaint (${existing.id}) already exists in ${existing.ward}.`,
          matchedComplaintId: existing.id
        };
      }
    }
  }

  return null;
}

/**
 * Validates workflow status transition and required administrative remarks.
 */
export function validateStatusTransition(currentStatus, nextStatus, remarks = '') {
  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    return {
      valid: false,
      error: `Invalid status "${nextStatus}". Allowed statuses: ${ALLOWED_STATUSES.join(', ')}.`
    };
  }

  const allowedNext = STATUS_TRANSITIONS[currentStatus] || ALLOWED_STATUSES;
  if (currentStatus && !allowedNext.includes(nextStatus)) {
    return {
      valid: false,
      error: `Cannot transition directly from "${currentStatus}" to "${nextStatus}". Allowed next states: ${allowedNext.join(', ')}.`
    };
  }

  const cleanRemarks = sanitizeText(remarks, 1000);
  if ((nextStatus === 'Resolved' || nextStatus === 'Rejected') && cleanRemarks.length < 5) {
    return {
      valid: false,
      error: `Administrative remarks (min 5 chars) are mandatory when marking a complaint as ${nextStatus}.`
    };
  }

  return { valid: true, error: null, sanitizedRemarks: cleanRemarks };
}

/**
 * Client-side submission rate limiter backed by storage (prevents rapid automated spam).
 */
export function checkClientRateLimit(key = 'default', maxRequests = 5, windowMs = 60 * 1000) {
  try {
    const storageKey = `nagrik_rate_limit_${key}`;
    const now = Date.now();
    const raw = localStorage.getItem(storageKey);
    const timestamps = raw ? JSON.parse(raw).filter((ts) => now - ts < windowMs) : [];

    if (timestamps.length >= maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((windowMs - (now - timestamps[0])) / 1000)
      };
    }

    timestamps.push(now);
    localStorage.setItem(storageKey, JSON.stringify(timestamps));
    return { allowed: true, remaining: maxRequests - timestamps.length };
  } catch {
    return { allowed: true, remaining: maxRequests };
  }
}

/**
 * Enforces explicit administrative authorization check before privileged state mutations.
 */
export function assertAdminAuthorized(actorContext) {
  if (!actorContext || (actorContext.role !== 'admin' && actorContext.user?.role !== 'admin')) {
    const err = new Error(
      'Unauthorized: Administrative privileges are required to modify complaint statuses or dispatch work orders.'
    );
    err.code = 'UNAUTHORIZED_ADMIN_ACTION';
    throw err;
  }
  return true;
}

