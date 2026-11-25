/**
 * NAGRIK - Municipal Data Store & Sample Database
 * Persists complaint records, audit trails, and status logs in browser localStorage.
 */

const STORAGE_KEY = 'nagrik_complaints_db_v2';

export const MUNICIPAL_WARDS = [
  { id: 'ward-01', name: 'Ward 01 - Connaught Hub', zone: 'Central' },
  { id: 'ward-04', name: 'Ward 04 - Indiranagar', zone: 'East' },
  { id: 'ward-07', name: 'Ward 07 - Sector 18 Commercial', zone: 'North' },
  { id: 'ward-12', name: 'Ward 12 - Green Glen Residential', zone: 'South' },
  { id: 'ward-15', name: 'Ward 15 - Metro Terminal Sector', zone: 'West' },
  { id: 'ward-22', name: 'Ward 22 - Industrial Growth Area', zone: 'Outer' },
];

export const SAMPLE_COMPLAINTS = [
  {
    id: 'NGK-2025-0842',
    title: 'Severe road pothole near Indiranagar Flyover descent',
    description: 'A deep pothole has formed on the right lane of Outer Ring Road right after the flyover ramp. Vehicles swerve abruptly during peak evening hours, creating accident risks for two-wheelers.',
    category: 'roads',
    categoryName: 'Roads & Infrastructure',
    priority: 'High',
    status: 'In Progress',
    department: 'Public Works Department (PWD)',
    assignedOfficer: 'Er. Rajeshwar Rao (PWD Division 4)',
    location: {
      address: 'Pillar 142, Outer Ring Road, Near Flyover Descent',
      ward: 'Ward 04 - Indiranagar',
      landmark: 'Opposite Metro Pillar 142',
      zone: 'East'
    },
    citizen: {
      name: 'Aditya Sharma',
      email: 'aditya.sharma@example.in',
      phone: '+91 98450 12891'
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    resolutionProofUrl: '',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    timeline: [
      {
        id: 'ev-1',
        status: 'Submitted',
        title: 'Grievance Registered',
        notes: 'Complaint submitted by citizen with photograph and geo-location.',
        officer: 'System Dispatch',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
      },
      {
        id: 'ev-2',
        status: 'Under Review',
        title: 'Jurisdiction Verified',
        notes: 'Verified as Ward 04 arterial corridor under PWD Road Division.',
        officer: 'Control Room Officer',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
      },
      {
        id: 'ev-3',
        status: 'Assigned',
        title: 'Assigned to Ward Engineer',
        notes: 'Assigned to Er. Rajeshwar Rao. Road repair work order issued.',
        officer: 'PWD Central Dispatch',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
      },
      {
        id: 'ev-4',
        status: 'In Progress',
        title: 'Repair Squad Dispatched',
        notes: 'Field crew arrived on site with bitumen cold-mix. Barricading installed.',
        officer: 'Er. Rajeshwar Rao',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      }
    ]
  },
  {
    id: 'NGK-2025-0791',
    title: 'Damaged electrical cable sparking near Convent School gate',
    description: 'Overhead service wire snapped during night wind and is hanging 5 feet above the pedestrian walkway right outside St. Jude School Gate 2. Sparks visible against the tree branch.',
    category: 'electrical',
    categoryName: 'Street Lighting & Power',
    priority: 'Emergency',
    status: 'Resolved',
    department: 'Electricity Distribution Company (DISCOM)',
    assignedOfficer: 'Vipin Chandran (DISCOM Line Unit)',
    location: {
      address: 'Lane 3, Behind St. Jude School, Green Glen',
      ward: 'Ward 12 - Green Glen Residential',
      landmark: 'Next to School Gate 2',
      zone: 'South'
    },
    citizen: {
      name: 'Priyanka Sen',
      email: 'priyanka.sen@example.in',
      phone: '+91 97118 54210'
    },
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    resolutionProofUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    timeline: [
      {
        id: 'ev-1',
        status: 'Submitted',
        title: 'Emergency Issue Logged',
        notes: 'Reported by citizen with safety alert flag.',
        officer: 'Citizen Portal',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString()
      },
      {
        id: 'ev-2',
        status: 'Assigned',
        title: 'Emergency Line Team Dispatched',
        notes: 'Feeder isolated remotely. Line crew dispatched on priority.',
        officer: 'DISCOM Control',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
      },
      {
        id: 'ev-3',
        status: 'Resolved',
        title: 'Cable Re-strung and Tested Safe',
        notes: 'Damaged conductor replaced with insulated armored cable. Voltage test normal.',
        officer: 'Vipin Chandran (DISCOM)',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
      }
    ]
  },
  {
    id: 'NGK-2025-0683',
    title: 'Overflowing community garbage bins on Market Road',
    description: 'Commercial market bins have not been emptied for three consecutive days. Waste has spilled over onto the road corridor, creating foul odor and blocking customer footpaths.',
    category: 'sanitation',
    categoryName: 'Sanitation & Solid Waste',
    priority: 'Medium',
    status: 'Assigned',
    department: 'Solid Waste Management (SWM)',
    assignedOfficer: 'Mohd. Salim (Sanitation Inspector)',
    location: {
      address: 'Sector 18 Commercial Market, Plaza Road',
      ward: 'Ward 07 - Sector 18 Commercial',
      landmark: 'Near Supermarket Delivery Gate',
      zone: 'North'
    },
    citizen: {
      name: 'Rohan Mehra',
      email: 'rohan.m@marketassoc.in',
      phone: '+91 99881 22345'
    },
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
    resolutionProofUrl: '',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    timeline: [
      {
        id: 'ev-1',
        status: 'Submitted',
        title: 'Sanitation Grievance Received',
        notes: 'Market association lodged grievance with photo.',
        officer: 'Citizen Portal',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
      },
      {
        id: 'ev-2',
        status: 'Assigned',
        title: 'Scheduled for Morning Compactor Route',
        notes: 'Assigned to Ward 07 secondary compactor vehicle for clearance.',
        officer: 'Mohd. Salim',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      }
    ]
  },
  {
    id: 'NGK-2025-0552',
    title: 'Main water supply pipeline fracture leaking clean drinking water',
    description: 'Underground supply main collar fractured near community park. Potable water is pooling on the road while water pressure in adjacent residential houses has dropped to zero.',
    category: 'water',
    categoryName: 'Water Supply & Drainage',
    priority: 'High',
    status: 'Under Review',
    department: 'Municipal Water & Sewerage Board',
    assignedOfficer: 'Sunil Kulkarni (Sub-Divisional Water Engineer)',
    location: {
      address: 'Cross 4, Green Glen Residential Layout',
      ward: 'Ward 12 - Green Glen Residential',
      landmark: 'Behind Community Center Water Tank',
      zone: 'South'
    },
    citizen: {
      name: 'Aditya Sharma',
      email: 'aditya.sharma@example.in',
      phone: '+91 98450 12891'
    },
    imageUrl: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=800&q=80',
    resolutionProofUrl: '',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    timeline: [
      {
        id: 'ev-1',
        status: 'Submitted',
        title: 'Leakage Logged by Resident',
        notes: 'Reported pipeline fracture and household supply stoppage.',
        officer: 'Citizen Portal',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString()
      },
      {
        id: 'ev-2',
        status: 'Under Review',
        title: 'Valve Isolation Pending',
        notes: 'Water board line supervisor reviewing feeder valve control.',
        officer: 'Water Board Duty Officer',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ]
  },
  {
    id: 'NGK-2025-0419',
    title: 'Broken swings with sharp rusty edges in children playground',
    description: 'The overhead iron swing support in the municipal sector park is cracked, with sharp rusted links dangling at head height for small children. Safety hazard for park visitors.',
    category: 'parks',
    categoryName: 'Public Parks & Amenities',
    priority: 'Low',
    status: 'Resolved',
    department: 'Horticulture Department',
    assignedOfficer: 'Suresh Patil (Parks Officer)',
    location: {
      address: 'Central Park Walkway, Sector 14',
      ward: 'Ward 01 - Connaught Hub',
      landmark: 'Near Rose Garden Gazebo',
      zone: 'Central'
    },
    citizen: {
      name: 'Meera Deshmukh',
      email: 'meera.d@example.in',
      phone: '+91 98200 44910'
    },
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    resolutionProofUrl: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    timeline: [
      {
        id: 'ev-1',
        status: 'Submitted',
        title: 'Park Hazard Reported',
        notes: 'Reported by parent visiting the public playground.',
        officer: 'Citizen Portal',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
      },
      {
        id: 'ev-2',
        status: 'Assigned',
        title: 'Work Order Issued to Workshop',
        notes: 'Maintenance unit notified to replace broken chains.',
        officer: 'Suresh Patil',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
      },
      {
        id: 'ev-3',
        status: 'Resolved',
        title: 'Swings Replaced and Inspected',
        notes: 'Installed heavy-duty rubber-coated replacement swing seats.',
        officer: 'Parks Maintenance Unit',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString()
      }
    ]
  }
];

export function initComplaintsDb() {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_COMPLAINTS));
      return SAMPLE_COMPLAINTS;
    }
    const parsed = JSON.parse(existing);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_COMPLAINTS));
      return SAMPLE_COMPLAINTS;
    }
    return parsed;
  } catch (err) {
    return SAMPLE_COMPLAINTS;
  }
}

export function getAllComplaints() {
  return initComplaintsDb();
}

export function getComplaintById(id) {
  if (!id) return null;
  const list = getAllComplaints();
  return list.find(item => item.id.toUpperCase() === id.trim().toUpperCase()) || null;
}

export function getComplaintsByCitizen(citizenEmail) {
  if (!citizenEmail) return [];
  const list = getAllComplaints();
  return list.filter(item => item.citizen?.email?.toLowerCase() === citizenEmail.trim().toLowerCase());
}

export function createComplaint(data) {
  const list = getAllComplaints();
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const complaintId = `NGK-${year}-${randomSuffix}`;

  const newRecord = {
    id: complaintId,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    categoryName: data.categoryName,
    priority: data.priority || 'Medium',
    status: 'Submitted',
    department: data.department || 'Central Grievance Redressal Cell',
    assignedOfficer: 'Unassigned (Pending Ward Dispatch)',
    location: {
      address: data.address.trim(),
      ward: data.ward,
      landmark: data.landmark ? data.landmark.trim() : '',
      zone: data.zone || 'Central'
    },
    citizen: {
      name: data.citizenName || 'Citizen',
      email: data.citizenEmail || 'citizen@portal.in',
      phone: data.citizenPhone || ''
    },
    imageUrl: data.imageUrl || '',
    resolutionProofUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      {
        id: `ev-${Date.now()}`,
        status: 'Submitted',
        title: 'Grievance Registered',
        notes: 'Complaint submitted by citizen through portal.',
        officer: data.citizenName || 'Citizen',
        timestamp: new Date().toISOString()
      }
    ]
  };

  const updated = [newRecord, ...list];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save complaint to localStorage:', e);
  }

  return newRecord;
}

export function updateComplaintStatus(id, newStatus, remarks = '', resolutionPhoto = '', assignedOfficer = '') {
  const list = getAllComplaints();
  const index = list.findIndex(c => c.id === id);
  if (index === -1) return null;

  const item = { ...list[index] };
  const prevStatus = item.status;
  item.status = newStatus;
  item.updatedAt = new Date().toISOString();

  if (assignedOfficer) {
    item.assignedOfficer = assignedOfficer;
  }

  if (resolutionPhoto) {
    item.resolutionProofUrl = resolutionPhoto;
  }

  const timelineEvent = {
    id: `ev-${Date.now()}`,
    status: newStatus,
    title: `Status updated to ${newStatus}`,
    notes: remarks || `Status changed from ${prevStatus} to ${newStatus} by municipal administrator.`,
    officer: assignedOfficer || item.assignedOfficer || 'Municipal Administrator',
    timestamp: new Date().toISOString()
  };

  item.timeline = [...(item.timeline || []), timelineEvent];
  list[index] = item;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }

  return item;
}

export function resetToSampleData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_COMPLAINTS));
    return SAMPLE_COMPLAINTS;
  } catch (e) {
    return SAMPLE_COMPLAINTS;
  }
}
