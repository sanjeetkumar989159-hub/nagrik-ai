import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';

export const DEFAULT_DEPARTMENTS = [
  {
    id: 'dept-pwd',
    name: 'Public Works Department',
    code: 'PWD',
    headOfficer: 'Chief Municipal Engineer',
    contactNumber: '+91 1800 11 2001',
    description: 'Infrastructure, road civil works, government structures, civic flyovers and bridges',
    color: '#1e3a8a'
  },
  {
    id: 'dept-swm',
    name: 'Sanitation & Solid Waste Management',
    code: 'SWM',
    headOfficer: 'Superintendent of Sanitation',
    contactNumber: '+91 1800 11 2002',
    description: 'Garbage segregation, bulk waste processing, compactor dispatch and street sweeping',
    color: '#15803d'
  },
  {
    id: 'dept-wsb',
    name: 'Water Supply Department',
    code: 'WSB',
    headOfficer: 'Executive Water Engineer',
    contactNumber: '+91 1800 11 2003',
    description: 'Drinking water distribution, pipeline maintenance, supply booster stations',
    color: '#0284c7'
  },
  {
    id: 'dept-drn',
    name: 'Drainage & Stormwater Board',
    code: 'DRN',
    headOfficer: 'Chief Drainage Inspector',
    contactNumber: '+91 1800 11 2004',
    description: 'Stormwater drains, sewage pipelines, manhole desilting and waterlogging prevention',
    color: '#0d9488'
  },
  {
    id: 'dept-discom',
    name: 'Electricity & Street Lighting Board',
    code: 'DISCOM',
    headOfficer: 'Senior Electrical Engineer',
    contactNumber: '+91 1800 11 2005',
    description: 'Public illumination, LED streetlight grid, hanging cables and exposed transformers',
    color: '#d97706'
  },
  {
    id: 'dept-rmd',
    name: 'Road Maintenance Division',
    code: 'RMD',
    headOfficer: 'Asphalt & Paving Supervisor',
    contactNumber: '+91 1800 11 2006',
    description: 'Pothole restoration, asphalt resurfacing, footpaths, road markings and dividers',
    color: '#475569'
  },
  {
    id: 'dept-psd',
    name: 'Public Safety & Encroachment Cell',
    code: 'PSD',
    headOfficer: 'City Enforcement Officer',
    contactNumber: '+91 1800 11 2007',
    description: 'Hazardous public obstructions, emergency routes, pedestrian safety hazards',
    color: '#dc2626'
  }
];

export async function fetchDepartments() {
  if (!isFirebaseConfigured() || !db) {
    return DEFAULT_DEPARTMENTS;
  }

  try {
    const colRef = collection(db, 'departments');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      // Seed default departments
      for (const d of DEFAULT_DEPARTMENTS) {
        await setDoc(doc(db, 'departments', d.id), d);
      }
      return DEFAULT_DEPARTMENTS;
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Could not fetch departments from Firestore, using defaults:', err);
    return DEFAULT_DEPARTMENTS;
  }
}

export function getDepartmentById(deptId) {
  return DEFAULT_DEPARTMENTS.find(d => d.id === deptId) || DEFAULT_DEPARTMENTS[0];
}

