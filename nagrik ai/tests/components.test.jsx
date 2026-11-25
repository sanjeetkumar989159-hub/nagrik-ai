import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RequireAdmin from '../src/components/RequireAdmin';
import { CivicAssistantWidget } from '../src/components/CivicAssistantWidget';
import { SubmitComplaintPage } from '../src/pages/SubmitComplaintPage';
import { AdminDashboard } from '../src/pages/AdminDashboard';
import { INITIAL_SEED_COMPLAINTS } from '../src/services/complaintsService';

// Mock Firebase & Leaflet map component for deterministic JSDOM tests
vi.mock('../src/services/firebase', () => ({
  app: null,
  auth: null,
  db: null,
  storage: null,
  firebaseConfig: {},
  isFirebaseConfigured: () => false
}));

vi.mock('../src/components/CivicLeafletMap', () => ({
  CivicLeafletMap: () => <div data-testid="mock-leaflet-map">Map Mock</div>
}));

describe('UI Components, Accessibility & Role Protection', () => {
  it('RequireAdmin blocks non-admin role and unlocks for admin role', () => {
    const onSwitch = vi.fn();
    const { rerender } = render(
      <RequireAdmin currentRole="citizen" onSwitchToAdmin={onSwitch}>
        <div>Secret Admin Console</div>
      </RequireAdmin>
    );

    expect(screen.getByText(/Authorized Municipal Access Required/i)).toBeInTheDocument();
    expect(screen.queryByText('Secret Admin Console')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Enter Demo Evaluation Admin Session/i }));
    expect(onSwitch).toHaveBeenCalledTimes(1);

    rerender(
      <RequireAdmin currentRole="admin">
        <div>Secret Admin Console</div>
      </RequireAdmin>
    );
    expect(screen.getByText('Secret Admin Console')).toBeInTheDocument();
  });

  it('CivicAssistantWidget preserves context across turns and triggers prefill', () => {
    const onPrefill = vi.fn();
    render(
      <CivicAssistantWidget
        isOpen={true}
        onClose={vi.fn()}
        onPrefillComplaint={onPrefill}
      />
    );

    const input = screen.getByLabelText(/Describe your civic issue/i);
    fireEvent.change(input, {
      target: { value: 'Hanging live wire sparking near St. Jude School Gate 2 Ward 12' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Send message/i }));

    expect(screen.getByText(/AI Suggestions \(Rule-Based Heuristic\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified Context & Official Directory/i)).toBeInTheDocument();

    const prefillBtn = screen.getByRole('button', { name: /Pre-fill Complaint Form/i });
    fireEvent.click(prefillBtn);
    expect(onPrefill).toHaveBeenCalledTimes(1);
    expect(onPrefill.mock.calls[0][0].category).toBe('electricity');
    expect(onPrefill.mock.calls[0][0].severity).toBe('Emergency');
  });

  it('SubmitComplaintPage shows live heuristic triage and accessible validation errors', () => {
    render(
      <SubmitComplaintPage
        currentUser={{ uid: 'usr-1', name: 'Rohan', phoneNumber: '9876543210' }}
        setActivePage={vi.fn()}
        setSelectedComplaintId={vi.fn()}
      />
    );

    // Submit empty form -> accessible errors must appear
    fireEvent.click(screen.getByRole('button', { name: /Submit Complaint to Dispatch/i }));
    expect(screen.getByText(/Complaint title must be at least 8 characters/i)).toBeInTheDocument();

    // Type civic description -> live AI triage panel activates and applies suggestion
    const titleInput = screen.getByLabelText(/Complaint Title/i);
    fireEvent.change(titleInput, {
      target: { value: 'Overflowing garbage bin near market square' }
    });
    expect(screen.getByText(/Live AI Triage Analysis/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Apply AI Suggestion/i }));

    const catSelect = screen.getByLabelText(/^Category/i);
    expect(catSelect.value).toBe('garbage-collection');
  });

  it('AdminDashboard displays High-Priority metric, search/filtering, and details modal when authorized', () => {
    render(
      <AdminDashboard
        complaints={INITIAL_SEED_COMPLAINTS}
        currentRole="admin"
        currentUser={{ role: 'admin' }}
        setActivePage={vi.fn()}
        setSelectedComplaintId={vi.fn()}
      />
    );

    expect(screen.getByText(/Total Complaints/i)).toBeInTheDocument();
    expect(screen.getByText(/High Priority/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Category-Wise Analytics/i })).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/Search complaints/i);
    fireEvent.change(searchInput, { target: { value: '9281C440' } });
    expect(screen.getByText(/Showing/i)).toHaveTextContent('1');
  });
});
