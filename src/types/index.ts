export type UserRole = 'Student' | 'Admin' | 'Responder';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  campusId: string;
}

export type IncidentType = 'Medical' | 'Fire' | 'Violence' | 'Hazard' | 'Structural' | 'General';

export type SeverityLevel = 'Low' | 'Medium' | 'High';

export type IncidentStatus = 'Pending' | 'Assigned' | 'In-Progress' | 'Resolved' | 'Dismissed';

export type ResponderStatus = 'Available' | 'On Duty' | 'Busy' | 'Off Duty';

export interface Responder {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  specialization: 'Medical' | 'Fire & Hazmat' | 'Security' | 'General Safety';
  status: ResponderStatus;
  latitude: number;
  longitude: number;
  vehicle: string;
  assignedIncidentsCount: number;
}

export interface IncidentUpdate {
  id: string;
  timestamp: string;
  author: string;
  status: string;
  notes: string;
}

export interface Incident {
  id: number;
  studentId: number;
  reporterName: string;
  reporterPhone: string;
  incidentType: IncidentType;
  message: string;
  locationName: string;
  latitude: number;
  longitude: number;
  peopleCount: number;
  severityScore: number; // 0.0 - 10.0
  severityLevel: SeverityLevel;
  summary: string;
  ruleScore: number;
  mlLevel: SeverityLevel;
  mlConfidence: number;
  triggeredRules: string[];
  status: IncidentStatus;
  assignedResponderId?: number;
  assignedResponderName?: string;
  assignedResponderSpecialty?: string;
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  updates: IncidentUpdate[];
}

export interface NotificationLog {
  id: string;
  incidentId: number;
  dispatchId: string;
  recipientName: string;
  recipientContact: string;
  channel: 'SMS' | 'Push' | 'Email';
  subject: string;
  content: string;
  status: 'Delivered' | 'Pending' | 'Failed';
  timestamp: string;
}

export interface CampusLocation {
  name: string;
  lat: number;
  lon: number;
  zone: string;
}
