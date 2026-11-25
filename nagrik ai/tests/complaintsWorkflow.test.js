import { describe, it, expect, vi } from 'vitest';

// Run integration workflow deterministically without live network Firestore calls
vi.mock('../src/services/firebase', () => ({
  app: null,
  auth: null,
  db: null,
  storage: null,
  firebaseConfig: {},
  isFirebaseConfigured: () => false
}));

import {
  createComplaintRecord,
  updateComplaintStatusFirestore,
  getLocalComplaints
} from '../src/services/complaintsService';

describe('Complaint Submission & Status Workflow Integration', () => {
  const validPayload = {
    userId: 'usr-test-100',
    citizenName: 'Priya Nair',
    citizenPhone: '9876543210',
    citizenEmail: 'priya@example.in',
    title: 'Broken drinking water pipeline near community gate',
    description: 'Clean water leaking continuously onto the lane for two days causing low pressure.',
    category: 'water-supply',
    subcategory: 'Pipeline Leakage / Burst',
    severity: 'High',
    address: 'Cross 4, Green Glen Layout',
    ward: 'Ward 12 - Green Glen Residential',
    zone: 'South'
  };

  it('creates a unique complaint record, blocks duplicates, enforces admin auth, and transitions lifecycle', async () => {
    // 1. Create record
    const created = await createComplaintRecord(validPayload);
    expect(created.id).toMatch(/^NAG-2026-[A-Z0-9]{8}$/);
    expect(created.status).toBe('Submitted');
    expect(created.timeline).toHaveLength(1);

    // 2. Prevent immediate duplicate submission
    await expect(createComplaintRecord(validPayload)).rejects.toThrow(/duplicate/i);

    // 3. Reject unauthorized citizen status update
    await expect(
      updateComplaintStatusFirestore(
        created.id,
        'Under Review',
        'Trying unauthorized update',
        null,
        null,
        'Citizen',
        { role: 'citizen' }
      )
    ).rejects.toThrow(/Unauthorized/);

    // 4. Authorized Admin lifecycle transitions: Submitted -> Under Review -> Assigned -> In Progress -> Resolved
    const stepReview = await updateComplaintStatusFirestore(
      created.id,
      'Under Review',
      'Control room verified pipeline location',
      null,
      'dept-wsb',
      'Duty Officer',
      { role: 'admin' }
    );
    expect(stepReview.status).toBe('Under Review');

    const stepAssigned = await updateComplaintStatusFirestore(
      created.id,
      'Assigned',
      'Assigned to South Division Water Unit',
      null,
      'dept-wsb',
      'Er. Sunil Kulkarni',
      { role: 'admin' }
    );
    expect(stepAssigned.status).toBe('Assigned');

    const stepResolved = await updateComplaintStatusFirestore(
      created.id,
      'Resolved',
      'Replaced fractured collar joint and pressure tested line',
      null,
      'dept-wsb',
      'Er. Sunil Kulkarni',
      { role: 'admin' }
    );
    expect(stepResolved.status).toBe('Resolved');
    expect(stepResolved.timeline).toHaveLength(4);

    // 5. Verify persisted record matches final state
    const persisted = getLocalComplaints().find((c) => c.id === created.id);
    expect(persisted.status).toBe('Resolved');
    expect(persisted.assignedOfficer).toBe('Er. Sunil Kulkarni');
  });

  it('rejects invalid submission inputs at service layer', async () => {
    await expect(
      createComplaintRecord({ ...validPayload, title: 'Bad', citizenPhone: '111' })
    ).rejects.toThrow(/title/i);
  });
});
