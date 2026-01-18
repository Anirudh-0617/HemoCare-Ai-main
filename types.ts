
export enum BleedType {
  JOINT = 'Joint',
  MUSCLE = 'Muscle',
  INTRACRANIAL = 'Intracranial',
  GASTROINTESTINAL = 'Gastrointestinal',
  URINARY = 'Urinary',
  SOFT_TISSUE = 'Soft Tissue',
  EXTERNAL = 'External',
  OTHER = 'Other'
}

export enum Severity {
  MILD = 'Mild',
  MODERATE = 'Moderate',
  SEVERE = 'Severe',
  EMERGENCY = 'Emergency'
}

export enum Trigger {
  TRAUMA = 'Trauma',
  SPONTANEOUS = 'Spontaneous',
  POST_ACTIVITY = 'Post-Activity',
  MISSED_DOSE = 'Missed Dose',
  UNKNOWN = 'Unknown'
}

export enum MedicationType {
  FACTOR_VII = 'Factor VII',
  FACTOR_VIII = 'Factor VIII',
  FACTOR_IX = 'Factor IX',
  FACTOR_XI = 'Factor XI (Hemo C)',
  VWF = 'von Willebrand Factor',
  BLOOD_PRODUCTS = 'Blood and Blood Products',
  EMICIZUMAB = 'Emicizumab',
  GENE_THERAPY = 'Gene Therapy'
}

export enum Frequency {
  DAILY = 'Daily',
  EVERY_OTHER_DAY = 'Every other day',
  TWO_X_WEEK = '2x/week',
  THREE_X_WEEK = '3x/week',
  WEEKLY = 'Weekly',
  ON_DEMAND = 'On-demand'
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

export interface BleedEntry {
  id: string;
  date: string;
  time: string;
  type: BleedType;
  location: string;
  severity: number;
  trigger: Trigger;
  treatment: string;
  notes: string;
  photoUrl?: string;
}

export interface GeneticProfile {
  gene: 'F7' | 'F8' | 'F9' | 'F11' | 'VWF';
  nucleotideChange: string;
  aminoAcidChange: string;
  location: string;
  factorActivity: number;
  inhibitorRiskScore: number;
  exposureDays: number;
}

export interface InsuranceProfile {
  provider: string;
  priorAuthNumber: string;
  expirationDate: string;
  maxOutOfPocket: number;
  currentSpending: number;
  planType: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

export interface Medication {
  id: string;
  name: string;
  type: MedicationType;
  dosageBase: string;
  frequency: Frequency;
  startDate: string;
  prescribingHTC: string;
  currentWeight: number;
  vialSizes: number[];
  stockRemaining: number;
}

export interface InfusionRecord {
  id: string;
  medicationId: string;
  timestamp: string;
  lotNumber: string;
  site: string;
  reaction: string;
  notes: string;
  isMissed?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  specialty: string;
  phone: string;
  email: string;
  type?: 'medical' | 'personal';
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  provider: string;
  location: string;
  reason: string;
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  isEmergency?: boolean;
}