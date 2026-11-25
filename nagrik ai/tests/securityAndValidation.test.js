import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeCsvCell,
  validateComplaintInput,
  validateImageFile,
  findDuplicateComplaint,
  validateStatusTransition,
  assertAdminAuthorized
} from '../src/utils/security';

describe('Security, Validation, Sanitization & Authorization Rules', () => {
  it('strips HTML/script tags and neutralizes CSV formula injection', () => {
    const dirty = '<script>alert("xss")</script><b>Broken Pipe</b>';
    expect(sanitizeText(dirty)).toBe('Broken Pipe');

    expect(sanitizeCsvCell('=CMD|"/C calc"!A0')).toBe('"\'=CMD|""/C calc""!A0"');
    expect(sanitizeCsvCell('+SUM(1,2)')).toBe('"\'+SUM(1,2)"');
    expect(sanitizeCsvCell('Normal street')).toBe('"Normal street"');
  });

  it('validates complete complaint input and rejects invalid payloads', () => {
    const bad = validateComplaintInput({
      title: 'Short',
      description: 'Too short',
      category: 'invalid-cat',
      address: '12',
      citizenName: 'A',
      citizenPhone: '12345'
    });
    expect(bad.valid).toBe(false);
    expect(bad.errors.title).toBeTruthy();
    expect(bad.errors.description).toBeTruthy();
    expect(bad.errors.category).toBeTruthy();
    expect(bad.errors.address).toBeTruthy();
    expect(bad.errors.citizenPhone).toBeTruthy();

    const good = validateComplaintInput({
      title: 'Deep pothole near metro pillar',
      description: 'Two-wheelers skidding on main carriageway since 3 days.',
      category: 'road-damage',
      address: 'Outer Ring Road, Indiranagar',
      citizenName: 'Aditya Sharma',
      citizenPhone: '9845012891',
      citizenEmail: 'aditya@example.in'
    });
    expect(good.valid).toBe(true);
    expect(Object.keys(good.errors)).toHaveLength(0);
  });

  it('enforces image upload MIME, extension, and 5MB limits', () => {
    const validPng = { name: 'evidence.png', type: 'image/png', size: 1024 * 500 };
    expect(validateImageFile(validPng).valid).toBe(true);

    const invalidSvg = { name: 'payload.svg', type: 'image/svg+xml', size: 1024 };
    expect(validateImageFile(invalidSvg).valid).toBe(false);

    const oversized = { name: 'huge.jpg', type: 'image/jpeg', size: 7 * 1024 * 1024 };
    expect(validateImageFile(oversized).valid).toBe(false);
  });

  it('detects duplicate complaints submitted recently or overlapping active records', () => {
    const existing = [
      {
        id: 'NAG-2026-TEST0001',
        title: 'Overflowing sewage drain near Plaza Gate',
        address: 'Sector 18 Market Road',
        category: 'drainage',
        ward: 'Ward 07 - Sector 18 Commercial',
        status: 'Submitted',
        createdAt: new Date().toISOString()
      }
    ];

    const dup = findDuplicateComplaint(
      {
        title: 'Overflowing sewage drain near Plaza Gate',
        address: 'Sector 18 Market Road',
        category: 'drainage',
        ward: 'Ward 07 - Sector 18 Commercial'
      },
      existing
    );
    expect(dup).not.toBeNull();
    expect(dup.isDuplicate).toBe(true);
    expect(dup.matchedComplaintId).toBe('NAG-2026-TEST0001');
  });

  it('validates status transitions and requires remarks for Resolved/Rejected', () => {
    expect(validateStatusTransition('Submitted', 'Under Review').valid).toBe(true);
    expect(validateStatusTransition('Under Review', 'Assigned').valid).toBe(true);
    expect(validateStatusTransition('Assigned', 'In Progress').valid).toBe(true);
    expect(validateStatusTransition('In Progress', 'Resolved', 'Repair completed').valid).toBe(true);

    // Invalid jump or unknown status
    expect(validateStatusTransition('Submitted', 'Resolved', 'Done').valid).toBe(false);
    expect(validateStatusTransition('Submitted', 'UNKNOWN_STATUS').valid).toBe(false);

    // Missing remarks for Resolved
    expect(validateStatusTransition('In Progress', 'Resolved', '').valid).toBe(false);
    expect(validateStatusTransition('Under Review', 'Rejected', 'ok').valid).toBe(false);
  });

  it('blocks unauthorized non-admin mutations', () => {
    expect(() => assertAdminAuthorized(null)).toThrow(/Unauthorized/);
    expect(() => assertAdminAuthorized({ role: 'citizen', user: { role: 'citizen' } })).toThrow(/Unauthorized/);
    expect(assertAdminAuthorized({ role: 'admin' })).toBe(true);
  });
});

