
export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  mrn: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
  vitals: VitalRecord[];
  lastVisit: string;
}

export interface VitalRecord {
  timestamp: string;
  bp: string;
  hr: number;
  temp: number;
  o2: number;
  weight: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  type: 'Initial' | 'Follow-up' | 'Procedure' | 'Consult';
  status: 'Scheduled' | 'Checked-in' | 'Completed' | 'No-show';
}

export interface Message {
  id: string;
  sender: 'User' | 'AI';
  content: string;
  timestamp: Date;
}

export type AppView = 'dashboard' | 'patients' | 'patient-detail' | 'patient-labs' | 'copilot' | 'schedule' | 'analytics';
