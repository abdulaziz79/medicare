
import { Patient, Appointment } from '../types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dob: '1982-05-14',
    gender: 'Female',
    mrn: 'MRN-48291',
    allergies: ['Penicillin', 'Latex'],
    medications: ['Lisinopril 10mg', 'Metformin 500mg'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    lastVisit: '2024-10-12',
    vitals: [
      { timestamp: '2024-10-12', bp: '128/82', hr: 72, temp: 98.6, o2: 98, weight: 165 },
      { timestamp: '2024-08-01', bp: '135/88', hr: 78, temp: 98.4, o2: 97, weight: 168 },
      { timestamp: '2024-06-15', bp: '130/84', hr: 74, temp: 98.7, o2: 98, weight: 170 },
    ]
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    dob: '1965-11-22',
    gender: 'Male',
    mrn: 'MRN-33104',
    allergies: ['Sulfa Drugs'],
    medications: ['Atorvastatin 20mg', 'Aspirin 81mg'],
    conditions: ['Hyperlipidemia', 'Coronary Artery Disease'],
    lastVisit: '2024-11-05',
    vitals: [
      { timestamp: '2024-11-05', bp: '118/76', hr: 64, temp: 98.2, o2: 99, weight: 182 },
    ]
  }
];

const today = new Date().toISOString().split('T')[0];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: '1', patientName: 'Sarah Johnson', date: today, time: '09:00 AM', type: 'Follow-up', status: 'Checked-in' },
  { id: 'a2', patientId: '2', patientName: 'Michael Chen', date: today, time: '10:30 AM', type: 'Initial', status: 'Scheduled' },
  { id: 'a3', patientId: '3', patientName: 'Robert Wilson', date: today, time: '11:15 AM', type: 'Procedure', status: 'Scheduled' },
  { id: 'a4', patientId: '4', patientName: 'Emily Davis', date: today, time: '01:45 PM', type: 'Consult', status: 'Scheduled' },
];
