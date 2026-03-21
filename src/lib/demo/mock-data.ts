/**
 * Mock data for demo mode (DEMO_MODE=true)
 * No database, no Clerk, no OpenAI required.
 */

export const DEMO_USER = {
  id: 'demo-user-1',
  clerkId: 'demo',
  practiceId: 'demo-practice-1',
  email: 'dr.johnson@sunshineChiro.com',
  firstName: 'Sarah',
  lastName: 'Johnson',
  role: 'OWNER' as const,
  npiNumber: '1234567890',
}

export const DEMO_PRACTICE = {
  id: 'demo-practice-1',
  name: 'Sunshine Chiropractic',
  address: '1420 Harbor Blvd, Suite 105, Fullerton, CA 92835',
  phone: '(714) 555-0192',
  npiNumber: '9876543210',
  state: 'IA',
}

export const DEMO_PATIENTS = [
  {
    id: 'patient-1',
    practiceId: 'demo-practice-1',
    firstName: 'Marcus',
    lastName: 'Rivera',
    dateOfBirth: new Date('1985-03-14'),
    sex: 'Male',
    phone: '(714) 555-0201',
    email: 'marcus.r@email.com',
    insuranceProvider: 'Blue Shield',
    insuranceId: 'BS-449201',
    chiefComplaint: 'Chronic lower lumbar pain with radiation down left leg, worsening over 6 months',
    isArchived: false,
    createdAt: new Date('2025-09-10'),
    updatedAt: new Date('2025-09-10'),
    _count: { sessions: 8 },
  },
  {
    id: 'patient-2',
    practiceId: 'demo-practice-1',
    firstName: 'Elena',
    lastName: 'Marchetti',
    dateOfBirth: new Date('1991-07-22'),
    sex: 'Female',
    phone: '(714) 555-0334',
    email: 'elena.m@email.com',
    insuranceProvider: 'Aetna',
    insuranceId: 'AET-881120',
    chiefComplaint: 'Cervical tension and headaches following rear-end MVA in July 2025',
    isArchived: false,
    createdAt: new Date('2025-08-02'),
    updatedAt: new Date('2025-08-02'),
    _count: { sessions: 12 },
  },
  {
    id: 'patient-3',
    practiceId: 'demo-practice-1',
    firstName: 'David',
    lastName: 'Chen',
    dateOfBirth: new Date('1972-11-05'),
    sex: 'Male',
    phone: '(714) 555-0477',
    email: 'dchen@email.com',
    insuranceProvider: 'Kaiser',
    insuranceId: 'KP-334417',
    chiefComplaint: 'Mid-thoracic pain and stiffness, computer work 10+ hours daily',
    isArchived: false,
    createdAt: new Date('2025-11-15'),
    updatedAt: new Date('2025-11-15'),
    _count: { sessions: 4 },
  },
  {
    id: 'patient-4',
    practiceId: 'demo-practice-1',
    firstName: 'Priya',
    lastName: 'Nair',
    dateOfBirth: new Date('1998-02-18'),
    sex: 'Female',
    phone: '(714) 555-0588',
    email: 'pnair@email.com',
    insuranceProvider: 'Cigna',
    insuranceId: 'CG-992841',
    chiefComplaint: 'Sacroiliac joint dysfunction, 28 weeks pregnant',
    isArchived: false,
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-01'),
    _count: { sessions: 3 },
  },
]

export const DEMO_SESSIONS = [
  {
    id: 'session-1',
    practiceId: 'demo-practice-1',
    patientId: 'patient-2',
    providerId: 'demo-user-1',
    sessionDate: new Date('2026-03-21'),
    status: 'FINALIZED',
    visitNumber: 12,
    rawTranscript: null,
    consentSigned: true,
    consentAt: new Date('2026-03-21T09:00:00'),
    consentMethod: 'verbal',
    createdAt: new Date('2026-03-21'),
    updatedAt: new Date('2026-03-21'),
    patient: { id: 'patient-2', firstName: 'Elena', lastName: 'Marchetti' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-1',
      sessionId: 'session-1',
      finalizedAt: new Date('2026-03-21T10:42:00'),
      subjective: 'Patient reports headache frequency has decreased from daily to 2-3x per week since last visit. Cervical pain rated 3/10 today vs 5/10 last visit. Still experiencing morning stiffness lasting approximately 20 minutes. No new symptoms. Continues home ice/heat protocol.',
      objective: 'Posture: Forward head posture improved, ear-to-shoulder alignment within 1 inch. Cervical ROM: Flexion 50° (improved from 40°), Extension 55°, Left lateral flexion 35°, Right lateral flexion 38°. Palpation: Decreased paraspinal tension at C4-C6 bilaterally compared to previous visit. Positive Spurling\'s test on left, negative on right. Cervical compression test negative. Adjusted C2, C4, C5 using Diversified technique with good cavitation.',
      assessment: 'Cervical sprain/strain post-MVA (ICD-10: S13.4XXA), resolving. Cervicogenic headaches (G44.309), improving. Patient progressing well — headache frequency reduced 60% from intake. Functional improvement noted in ROM.',
      plan: 'Continue current protocol. Adjusted C2, C4, C5 — Diversified technique. Applied interferential current therapy 10 min to cervical/upper thoracic region. Home care: continue ice 15 min BID, chin tucks 3x10 reps daily. Reduce visit frequency to 1x/week. Re-evaluate in 4 visits for discharge planning.',
      icd10Codes: ['S13.4XXA', 'G44.309'],
      cptCodes: ['98940', '97014'],
    },
  },
  {
    id: 'session-2',
    practiceId: 'demo-practice-1',
    patientId: 'patient-1',
    providerId: 'demo-user-1',
    sessionDate: new Date('2026-03-20'),
    status: 'FINALIZED',
    visitNumber: 8,
    rawTranscript: null,
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-20'),
    patient: { id: 'patient-1', firstName: 'Marcus', lastName: 'Rivera' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-2',
      sessionId: 'session-2',
      finalizedAt: new Date('2026-03-20T14:15:00'),
      subjective: 'Patient reports lower back pain at 4/10 today, down from 7/10 at intake 6 weeks ago. Left leg radiation has decreased significantly — now only occasional tingling in calf with prolonged sitting. Able to return to light jogging 3x/week. Reports sleeping better.',
      objective: 'Lumbar ROM: Flexion 65° (improved from 45°), Extension 20°, Side bending symmetrical at 25° bilaterally. SLR negative bilaterally. FABER negative. Palpation: L4-L5, L5-S1 hypomobility. Decreased paraspinal hypertonicity compared to previous visit. Lumbar adjusted at L4-L5 and L5-S1 Diversified, right SI joint drop technique.',
      assessment: 'Lumbar disc herniation with radiculopathy (ICD-10: M51.16), significantly improving. Patient responding well to conservative chiropractic care. Functional goals being met.',
      plan: 'Adjusted L4-L5, L5-S1 Diversified technique; right SI joint — drop technique. Applied moist heat 10 min pre-adjustment. Home exercise: McGill Big 3 protocol, bird-dog, dead bug, side plank. Continue current visit frequency 1x/week x4 more visits then re-evaluate for discharge.',
      icd10Codes: ['M51.16'],
      cptCodes: ['98941', '97010'],
    },
  },
  {
    id: 'session-3',
    practiceId: 'demo-practice-1',
    patientId: 'patient-3',
    providerId: 'demo-user-1',
    sessionDate: new Date('2026-03-19'),
    status: 'FINALIZED',
    visitNumber: 4,
    rawTranscript: null,
    createdAt: new Date('2026-03-19'),
    updatedAt: new Date('2026-03-19'),
    patient: { id: 'patient-3', firstName: 'David', lastName: 'Chen' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-3',
      sessionId: 'session-3',
      finalizedAt: new Date('2026-03-19T11:00:00'),
      subjective: 'Patient reports mid-thoracic ache 5/10. Worse after long work sessions. Has implemented standing desk — using 3 hours/day. Notices relief after stretching.',
      objective: 'Thoracic ROM limited in extension. T4-T6 restricted. Palpation reveals bilateral paraspinal tenderness T4-T7. Adjusted T4, T5, T6 prone with good response.',
      assessment: 'Thoracic sprain/strain (ICD-10: M54.6). Work-related postural dysfunction. Gradual improvement.',
      plan: 'Adjusted T4-T6 prone Diversified. Soft tissue work upper trapezius bilaterally. Home: doorway chest stretch, thoracic foam roll 2x/day. Ergonomic review recommended.',
      icd10Codes: ['M54.6'],
      cptCodes: ['98940'],
    },
  },
]

/**
 * Mutable store for patients created during a demo session.
 * Persists in process memory so /api/patients/[id] can find them after creation.
 */
// eslint-disable-next-line prefer-const
export let DEMO_DYNAMIC_PATIENTS: typeof DEMO_PATIENTS = []

// Canned AI responses for the demo thinking-partner flow
export const DEMO_AI_RESPONSES = [
  "Thanks for that overview. To build a complete SOAP note, a couple of quick questions:\n\n1. You mentioned they're doing better — can you give me a specific pain rating today (0–10) compared to their last visit?\n2. Which spinal levels did you address today, and what technique did you use?",
  "Got it. A couple more to round out the objective section:\n\n1. Did you perform any orthopedic or neurological tests today? If so, what were the findings?\n2. How was their range of motion — any specific measurements or notable changes from last time?",
  "Perfect. One last thing for the plan section:\n\n1. What home care instructions did you give them?\n2. What's the frequency for their next visits, and are you on track with their overall care goals?",
  "I have everything I need. Click **Generate SOAP Note** when you're ready and I'll put together the complete note.",
]

export const DEMO_GENERATED_NOTE = `**SUBJECTIVE:**
Patient reports significant improvement since last visit. Pain level rated 3/10 today, down from 6/10 at previous appointment. Describes pain as a dull ache primarily in the lower lumbar region with intermittent stiffness in the morning lasting approximately 15 minutes. Denies any new neurological symptoms. Reports compliance with home exercise program and notes that the prescribed stretches have been helpful. Able to perform activities of daily living with minimal limitation.

**OBJECTIVE:**
Postural assessment reveals improved lumbar lordosis compared to previous visit. Lumbar range of motion: Flexion 60° (previously 45°), Extension 18°, Right lateral flexion 28°, Left lateral flexion 25°. Straight leg raise negative bilaterally. Palpation reveals residual tenderness at L4-L5 and L5-S1 with moderate paraspinal hypertonicity, decreased from prior visit. Lumbar adjustment performed at L4-L5 and L5-S1 using Diversified technique with good cavitation response. Moist heat applied to lumbar region 10 minutes pre-adjustment.

**ASSESSMENT:**
Lumbar sprain/strain (ICD-10: M54.5), improving. Patient is responding positively to chiropractic care with measurable improvement in pain intensity and range of motion. Functional progress toward discharge goals is on track. No red flags identified.

**PLAN:**
Adjusted L4-L5 and L5-S1 — Diversified technique. Applied moist heat therapy 10 minutes pre-adjustment. Home care instructions reinforced: continue prescribed McKenzie extension exercises 2x daily, avoid prolonged sitting greater than 45 minutes without movement break. Next visit in 1 week. Re-evaluate in 3 visits for potential reduction in visit frequency. Patient verbalized understanding and agreement with plan.`
