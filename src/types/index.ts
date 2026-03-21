// Shared TypeScript types used across the app

export interface SOAPNote {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

export interface PatientSummary {
  id: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  phone?: string
  email?: string
  chiefComplaint?: string
  sessionCount: number
  createdAt: string
}

export interface SessionSummary {
  id: string
  patientId: string
  patientName: string
  sessionDate: string
  visitNumber: number
  status: 'DRAFT' | 'IN_PROGRESS' | 'FINALIZED'
  note?: SOAPNote
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export type UserRole = 'OWNER' | 'PROVIDER' | 'FRONT_DESK'
