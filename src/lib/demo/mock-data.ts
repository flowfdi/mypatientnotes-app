/**
 * Mock/seed data for demo mode and in-memory store.
 * DEMO_PATIENTS and DEMO_SESSIONS are the canonical seed for every user.
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

// ── Seed patients (5) ─────────────────────────────────────────────────────

export const DEMO_PATIENTS = [
  {
    id: 'patient-1',
    practiceId: 'demo-practice-1',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: new Date('1990-06-15'),
    sex: 'Male',
    phone: '(319) 555-0121',
    email: 'jsmith@email.com',
    insuranceProvider: 'Blue Shield',
    insuranceId: 'BS-224891',
    chiefComplaint:
      'Acute lower back pain with left leg radiation following workplace lifting injury, 3 weeks duration',
    isArchived: false,
    createdAt: new Date('2025-10-12'),
    updatedAt: new Date('2026-01-22'),
    _count: { sessions: 6 },
  },
  {
    id: 'patient-2',
    practiceId: 'demo-practice-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: new Date('1983-11-08'),
    sex: 'Female',
    phone: '(319) 555-0244',
    email: 'sjohnson@email.com',
    insuranceProvider: 'Aetna',
    insuranceId: 'AET-554433',
    chiefComplaint:
      'Cervical pain and daily headaches following rear-end MVA — post-traumatic cervical sprain/strain',
    isArchived: false,
    createdAt: new Date('2025-09-17'),
    updatedAt: new Date('2026-02-14'),
    _count: { sessions: 5 },
  },
  {
    id: 'patient-3',
    practiceId: 'demo-practice-1',
    firstName: 'Mike',
    lastName: 'Davis',
    dateOfBirth: new Date('1997-03-22'),
    sex: 'Male',
    phone: '(319) 555-0367',
    email: 'mdavis@email.com',
    insuranceProvider: 'Cigna',
    insuranceId: 'CG-778820',
    chiefComplaint:
      'Right shoulder pain with overhead activity — suspected rotator cuff tendinopathy, construction worker',
    isArchived: false,
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-08'),
    _count: { sessions: 3 },
  },
  {
    id: 'patient-4',
    practiceId: 'demo-practice-1',
    firstName: 'Emily',
    lastName: 'Chen',
    dateOfBirth: new Date('1994-07-30'),
    sex: 'Female',
    phone: '(319) 555-0489',
    email: 'echen@email.com',
    insuranceProvider: 'Kaiser',
    insuranceId: 'KP-112233',
    chiefComplaint:
      'Right sciatica — sharp shooting pain posterior thigh to calf, lumbar disc herniation, competitive runner',
    isArchived: false,
    createdAt: new Date('2026-02-25'),
    updatedAt: new Date('2026-03-15'),
    _count: { sessions: 3 },
  },
  {
    id: 'patient-5',
    practiceId: 'demo-practice-1',
    firstName: 'Bob',
    lastName: 'Wilson',
    dateOfBirth: new Date('1970-01-12'),
    sex: 'Male',
    phone: '(319) 555-0512',
    email: 'bwilson@email.com',
    insuranceProvider: 'Self-Pay',
    insuranceId: '',
    chiefComplaint:
      'Wellness and maintenance chiropractic care — retired physician, mild thoracic spinal restriction',
    isArchived: false,
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2026-03-10'),
    _count: { sessions: 4 },
  },
]

// ── Seed sessions with full SOAP notes (8) ────────────────────────────────

export const DEMO_SESSIONS = [
  // ── John Smith — Initial Evaluation (Manual) ──────────────────────────
  {
    id: 'session-1',
    practiceId: 'demo-practice-1',
    patientId: 'patient-1',
    providerId: 'demo-user-1',
    sessionDate: new Date('2025-10-15'),
    status: 'FINALIZED',
    visitNumber: 1,
    rawTranscript: null,
    consentSigned: true,
    consentAt: new Date('2025-10-15T09:00:00'),
    consentMethod: 'verbal',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-15'),
    patient: { id: 'patient-1', firstName: 'John', lastName: 'Smith' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-1',
      sessionId: 'session-1',
      aiGenerated: false,
      finalizedAt: new Date('2025-10-15T11:22:00'),
      subjective:
        'Patient, 35-year-old warehouse worker, presents with 3-week history of lower back pain following a lifting injury at work. Pain rated 7/10, sharp with movement and dull at rest. Radiates intermittently to the left buttock and posterior thigh. Denies lower extremity numbness or tingling. Reports significant difficulty sleeping on his left side and inability to perform household tasks including yard work. Has tried OTC ibuprofen with minimal relief.',
      objective:
        'Antalgic gait with mild right lateral lean. Lumbar ROM severely limited: flexion 30° with guarding, extension 10° with pain. Bilateral side-bending 15° each. SLR positive left at 45° reproducing buttock pain. Kemp\'s test positive bilaterally. Palpation reveals marked paraspinal hypertonicity and point tenderness at L4-L5 and L5-S1. No lower extremity motor or sensory deficits noted. Reflexes intact bilaterally.',
      assessment:
        'Lumbar disc herniation with radiculopathy (ICD-10: M51.16). Lumbar sprain/strain (M54.5). Patient presents in acute phase with significant functional limitation. Positive SLR with referred pain pattern consistent with L5-S1 nerve root involvement. Guarded prognosis — will re-evaluate response to initial treatment within 4 visits.',
      plan:
        'Initial exam performed. X-ray referral ordered to rule out fracture or other pathology. Adjusted L4-L5 and L5-S1 using gentle Diversified technique, low-force given acute presentation. Moist heat applied 10 minutes lumbar pre-adjustment. Post-treatment ice 15 min. Patient instructed: ice q2h at home (15 min), modified activity — no lifting >10 lbs, avoid forward flexion. Visit frequency: 2x/week x4 weeks. Re-evaluate at visit 8 for progress and care plan modification.',
      icd10Codes: ['M51.16', 'M54.5'],
      cptCodes: ['98942', '97010'],
    },
  },

  // ── John Smith — Visit #6 (Manual) ───────────────────────────────────
  {
    id: 'session-2',
    practiceId: 'demo-practice-1',
    patientId: 'patient-1',
    providerId: 'demo-user-1',
    sessionDate: new Date('2026-01-22'),
    status: 'FINALIZED',
    visitNumber: 6,
    rawTranscript: null,
    createdAt: new Date('2026-01-22'),
    updatedAt: new Date('2026-01-22'),
    patient: { id: 'patient-1', firstName: 'John', lastName: 'Smith' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-2',
      sessionId: 'session-2',
      aiGenerated: false,
      finalizedAt: new Date('2026-01-22T14:18:00'),
      subjective:
        'Patient reports significant improvement since intake. Pain currently 3/10, down from 7/10 at initial evaluation. Left leg radiation has decreased substantially — now only occasional tingling in calf with prolonged sitting greater than 45 minutes. Sleeping on his left side again without pain. Able to return to light walking 30 minutes per day. Reports compliance with home exercise program.',
      objective:
        'Gait normal, no antalgic posture. Lumbar ROM improved: flexion 60° (from 30° at intake), extension 18°, side-bending 25° bilaterally. SLR negative bilaterally. FABER negative. Palpation: residual tenderness at L4-L5 with moderate paraspinal hypertonicity, noticeably decreased from prior visit. Adjusted L4-L5 and L5-S1 Diversified technique, right SI joint drop table — excellent cavitation response.',
      assessment:
        'Lumbar disc herniation with radiculopathy (ICD-10: M51.16), significantly improving. Patient responding well to conservative chiropractic care. Functional goals on track — 57% reduction in pain intensity, ROM improved 100% from baseline. No red flags.',
      plan:
        'Adjusted L4-L5, L5-S1 Diversified technique; right SI joint — drop table. Moist heat 10 min pre-adjustment. Home exercise reinforced: McGill Big 3 protocol (bird-dog, dead bug, side plank), modified for current pain level. Continue 1x/week x4 more visits, then re-evaluate for discharge planning. Patient verbalized understanding.',
      icd10Codes: ['M51.16'],
      cptCodes: ['98941', '97010'],
    },
  },

  // ── Sarah Johnson — Post-MVA Initial (AI-Generated) ──────────────────
  {
    id: 'session-3',
    practiceId: 'demo-practice-1',
    patientId: 'patient-2',
    providerId: 'demo-user-1',
    sessionDate: new Date('2025-09-20'),
    status: 'FINALIZED',
    visitNumber: 1,
    rawTranscript: null,
    consentSigned: true,
    consentAt: new Date('2025-09-20T10:00:00'),
    consentMethod: 'written',
    createdAt: new Date('2025-09-20'),
    updatedAt: new Date('2025-09-20'),
    patient: { id: 'patient-2', firstName: 'Sarah', lastName: 'Johnson' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-3',
      sessionId: 'session-3',
      aiGenerated: true,
      finalizedAt: new Date('2025-09-20T11:45:00'),
      subjective:
        'Patient, 42-year-old, was involved in a rear-end MVA 3 weeks ago with immediate onset of cervical pain and occipital headache. Denies loss of consciousness. Reports cervical stiffness and pain 7/10 daily, significantly worse in morning with approximately 45 minutes to loosen up. Headaches 5/10 daily, frontal and occipital distribution, associated with cervical pain. No upper extremity numbness or tingling. Cannot fully rotate head in either direction. Currently working from home, reports significant difficulty with computer work.',
      objective:
        'Cervical ROM severely limited: flexion 25°, extension 20°, left rotation 30°, right rotation 28°, bilateral lateral flexion 18°. Significant forward head posture — EAR line 3 inches anterior to plumb line. Palpation: marked bilateral paraspinal hypertonicity C2-C7, acute tenderness C4-C5 bilaterally. Cervical compression test positive right with pain reproduction to right shoulder. Distraction test positive — pain relief noted. Upper and lower extremity reflexes intact bilaterally.',
      assessment:
        'Cervical sprain/strain post-MVA (ICD-10: S13.4XXA). Cervicogenic headaches (G44.309). Post-traumatic cervical pain syndrome with significant functional limitation. MVA mechanism with velocity component — fair to guarded prognosis pending imaging.',
      plan:
        'Adjusted C4, C5, C6 using gentle Diversified technique, low-force given acute presentation. Cervical traction 10 min continuous. Cold pack cervical/upper thoracic 15 min post-treatment. Referral for cervical X-ray series ordered (AP, lateral, oblique, odontoid). Patient instructed: ice 20 min q2-3h, limit screen time and forward head posture, avoid heavy lifting. Discuss with PCP regarding muscle relaxant and NSAID trial. Coordinate with auto insurance adjuster. Visit frequency: 3x/week x4 weeks.',
      icd10Codes: ['S13.4XXA', 'G44.309'],
      cptCodes: ['98941', '97018', '97014'],
    },
  },

  // ── Sarah Johnson — Visit #5 Cervicogenic Headache (Manual) ──────────
  {
    id: 'session-4',
    practiceId: 'demo-practice-1',
    patientId: 'patient-2',
    providerId: 'demo-user-1',
    sessionDate: new Date('2026-02-14'),
    status: 'FINALIZED',
    visitNumber: 5,
    rawTranscript: null,
    createdAt: new Date('2026-02-14'),
    updatedAt: new Date('2026-02-14'),
    patient: { id: 'patient-2', firstName: 'Sarah', lastName: 'Johnson' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-4',
      sessionId: 'session-4',
      aiGenerated: false,
      finalizedAt: new Date('2026-02-14T10:55:00'),
      subjective:
        'Patient reports headache frequency reduced from daily to 3x/week — significant improvement. Cervical pain rated 3/10 today versus 6/10 at last visit. Morning stiffness resolving within 10 minutes now (was 45 min at intake). Continuing ice/heat home protocol. Returned to 50% capacity at computer workstation with ergonomic adjustments made.',
      objective:
        'Cervical ROM improving: flexion 45° (from 25° at intake), extension 40°, bilateral rotation 45°. Forward head posture improved to 1.5 inches from plumb line. Palpation: significantly decreased paraspinal tension C4-C6, residual tenderness bilateral upper trapezius and suboccipital region. Spurling\'s negative bilaterally. Adjusted C2, C4, C5 Diversified with good cavitation bilaterally.',
      assessment:
        'Cervical sprain/strain post-MVA (ICD-10: S13.4XXA), improving — approximately 50% improvement from baseline. Cervicogenic headaches (G44.309), improving with frequency reduction. Patient progressing appropriately. X-ray results reviewed — no fracture, mild degenerative changes C5-C6.',
      plan:
        'Adjusted C2, C4, C5 Diversified technique. Interferential current therapy 12 min cervical/upper thoracic region. Home care: continue ice BID, chin tuck exercises 3x10 reps daily, add thoracic extension over foam roller. Reduce visit frequency to 2x/week. Continue auto insurance documentation per visit. Re-evaluate in 4 visits for discharge planning.',
      icd10Codes: ['S13.4XXA', 'G44.309'],
      cptCodes: ['98940', '97014'],
    },
  },

  // ── Mike Davis — Shoulder Evaluation (AI-Generated) ──────────────────
  {
    id: 'session-5',
    practiceId: 'demo-practice-1',
    patientId: 'patient-3',
    providerId: 'demo-user-1',
    sessionDate: new Date('2026-01-08'),
    status: 'FINALIZED',
    visitNumber: 1,
    rawTranscript: null,
    consentSigned: true,
    consentAt: new Date('2026-01-08T08:30:00'),
    consentMethod: 'verbal',
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-01-08'),
    patient: { id: 'patient-3', firstName: 'Mike', lastName: 'Davis' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-5',
      sessionId: 'session-5',
      aiGenerated: true,
      finalizedAt: new Date('2026-01-08T09:50:00'),
      subjective:
        'Patient, 28-year-old construction worker, presents with 6-week history of right shoulder pain following repetitive overhead work on a framing project. Pain rated 6/10 with overhead activity, 2/10 at rest. No cervical radiation or paresthesias. Cannot raise arm above shoulder height without sharp pain at the acromion. Reports a clicking/popping sensation with shoulder rotation. Cannot reach behind his back. Missing work due to inability to perform overhead tasks.',
      objective:
        'Right shoulder ROM limited: abduction 90° (normal 180°), forward flexion 110°, external rotation 40°, internal rotation limited. Empty can test positive right reproducing pain. Neer\'s impingement sign positive. Hawkins-Kennedy positive right. Speed\'s bicipital test negative. AC joint palpation mildly tender right. Cervical screen: full ROM, Spurling\'s negative, no radicular symptoms. Cross-body adduction positive right.',
      assessment:
        'Rotator cuff tendinopathy — supraspinatus (ICD-10: M75.1). Shoulder impingement syndrome, right. Work-related repetitive stress injury. Cervicothoracic junction dysfunction contributing to scapular dyskinesis. Rule out partial rotator cuff tear if inadequate response to conservative care.',
      plan:
        'Adjusted C5, C6, T1-T3 Diversified technique to address cervicothoracic contribution and improve scapular kinematics. Soft tissue therapy to supraspinatus and infraspinatus 8 min. Cold pack applied 15 min post-treatment. Patient instructed: avoid overhead lifting, pendulum exercises 3x daily, cross-body stretch 3x30 seconds. Refer for shoulder ultrasound if no improvement in 4 visits. Visit frequency: 2x/week x3 weeks then re-evaluate. Workers\' compensation documentation initiated.',
      icd10Codes: ['M75.1'],
      cptCodes: ['98941', '97010', '97530'],
    },
  },

  // ── Emily Chen — Sciatica Initial (AI-Generated) ──────────────────────
  {
    id: 'session-6',
    practiceId: 'demo-practice-1',
    patientId: 'patient-4',
    providerId: 'demo-user-1',
    sessionDate: new Date('2026-02-28'),
    status: 'FINALIZED',
    visitNumber: 1,
    rawTranscript: null,
    consentSigned: true,
    consentAt: new Date('2026-02-28T13:00:00'),
    consentMethod: 'verbal',
    createdAt: new Date('2026-02-28'),
    updatedAt: new Date('2026-02-28'),
    patient: { id: 'patient-4', firstName: 'Emily', lastName: 'Chen' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-6',
      sessionId: 'session-6',
      aiGenerated: true,
      finalizedAt: new Date('2026-02-28T14:30:00'),
      subjective:
        'Patient, 31-year-old office manager and competitive recreational runner, presents with 2-week onset of right lower extremity pain and lower back pain. Describes sharp, shooting pain originating in right buttock radiating through posterior thigh to mid-calf — pain 8/10 with activity, 4/10 at rest. Running is impossible; had been training for a half-marathon. Prolonged sitting at desk aggravates symptoms. Coughing and sneezing reproduce leg pain. Denies bowel or bladder changes.',
      objective:
        'Antalgic posture with mild left lateral lean. Lumbar ROM severely limited: flexion 25° with immediate right leg pain reproduction, extension 10°. SLR positive right at 30° reproducing posterior leg pain down to calf. Contralateral SLR negative. FABER positive right with buttock pain. Piriformis stretch test reproduces familiar right posterior thigh pain. Palpation: L4-L5 hypomobility with paraspinal hypertonicity, piriformis hypertonicity and tenderness right. No motor deficits — EHL, dorsiflexion, plantarflexion normal bilaterally.',
      assessment:
        'Sciatica — lumbar nerve root compression (ICD-10: M54.4). Lumbar disc herniation (M51.16). Right piriformis syndrome contributing factor. Acute presentation with positive SLR at 30° — guarded short-term prognosis. MRI referral recommended to confirm disc level.',
      plan:
        'Adjusted L3-L4, L4-L5 Diversified technique, gentle given acute presentation. Soft tissue therapy to right piriformis 5 min. Ice pack lumbar/SI 15 min. Patient instructed: avoid forward flexion and prolonged sitting >30 min without break, running on hold (swimming acceptable), piriformis stretch 3x daily each side. MRI lumbar spine referral placed. Visit frequency: 3x/week x2 weeks, then reassess based on MRI findings and clinical response.',
      icd10Codes: ['M54.4', 'M51.16'],
      cptCodes: ['98941', '97010', '97530'],
    },
  },

  // ── Emily Chen — Visit #3 (Manual) ───────────────────────────────────
  {
    id: 'session-7',
    practiceId: 'demo-practice-1',
    patientId: 'patient-4',
    providerId: 'demo-user-1',
    sessionDate: new Date('2026-03-15'),
    status: 'FINALIZED',
    visitNumber: 3,
    rawTranscript: null,
    createdAt: new Date('2026-03-15'),
    updatedAt: new Date('2026-03-15'),
    patient: { id: 'patient-4', firstName: 'Emily', lastName: 'Chen' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-7',
      sessionId: 'session-7',
      aiGenerated: false,
      finalizedAt: new Date('2026-03-15T15:10:00'),
      subjective:
        'Patient reports approximately 40% improvement in leg symptoms since starting care. Walking without pain. Right posterior leg shooting pain reduced from 8/10 to 4/10. Still no running — compliant. Able to sit at workstation 60 minutes without symptom aggravation (was 20 minutes at intake). Good compliance with home piriformis stretching protocol. MRI results reviewed today — L4-L5 disc herniation with mild right-sided foraminal narrowing, no canal stenosis.',
      objective:
        'Lumbar ROM improved: flexion 50° (from 25°), extension 20°. SLR positive right at 55° (from 30° at intake) — pain less intense. Piriformis tension notably decreased on palpation. Adjusted L4-L5, L5-S1 prone Diversified technique — patient tolerating well. Soft tissue therapy piriformis right 5 min.',
      assessment:
        'Sciatica (ICD-10: M54.4), improving — positive clinical response. MRI confirms L4-L5 disc herniation with foraminal narrowing consistent with presentation. Continue conservative care.',
      plan:
        'Adjusted L4-L5, L5-S1 prone Diversified. Soft tissue piriformis right 5 min. Home: continue piriformis stretching, add prone press-up (McKenzie extension) 10 reps 3x/day. Begin graded walking program — 20 min/day flat surface, no hills. Reduce visit frequency to 2x/week. Follow up on MRI results with referring physician.',
      icd10Codes: ['M54.4'],
      cptCodes: ['98940', '97530'],
    },
  },

  // ── Dr. Bob Wilson — Wellness Maintenance (Manual) ────────────────────
  {
    id: 'session-8',
    practiceId: 'demo-practice-1',
    patientId: 'patient-5',
    providerId: 'demo-user-1',
    sessionDate: new Date('2026-03-10'),
    status: 'FINALIZED',
    visitNumber: 4,
    rawTranscript: null,
    createdAt: new Date('2026-03-10'),
    updatedAt: new Date('2026-03-10'),
    patient: { id: 'patient-5', firstName: 'Bob', lastName: 'Wilson' },
    provider: { firstName: 'Sarah', lastName: 'Johnson' },
    note: {
      id: 'note-8',
      sessionId: 'session-8',
      aiGenerated: false,
      finalizedAt: new Date('2026-03-10T10:35:00'),
      subjective:
        'Established wellness patient, 55-year-old retired physician, presents for regular quarterly maintenance care. No acute complaints. Reports mild thoracic stiffness after prolonged reading sessions (2-3 hours). Traveling to Portugal in 3 weeks — concerned about back management during long-haul flights. Sleeping well. Exercise routine maintained: swimming 4x/week and daily walking. Energy and mood excellent.',
      objective:
        'Posture within normal limits, well-conditioned physique for age. Full lumbar and cervical ROM. Palpation: mild segmental restriction T4-T6, asymptomatic. C5 end-range motion restriction. Muscle tone excellent. Neurological screening negative throughout. Global joint mobility good.',
      assessment:
        'Maintenance chiropractic care — well patient (ICD-10: Z00.00). Thoracic spinal restriction (M99.02). Patient in excellent health; appropriate long-term candidate for periodic wellness/maintenance care. Functional goals maintained.',
      plan:
        'Adjusted C5, T4, T5 using Diversified technique — low-force maintenance protocol. Cervical traction 8 min. Travel preparation counseled: lumbar support cushion for flights (provided handout), active stretching every 45-60 min during flight, hydration minimum 8 oz/hour, ambulate during layovers. Next visit in 4 weeks post-travel. Annual X-ray review scheduled for next appointment.',
      icd10Codes: ['Z00.00', 'M99.02'],
      cptCodes: ['98940'],
    },
  },
]

/**
 * Mutable store for patients created during a session.
 * Persists in process memory so /api/patients/[id] can find them after creation.
 */
// eslint-disable-next-line prefer-const
export let DEMO_DYNAMIC_PATIENTS: typeof DEMO_PATIENTS = []

// ── AI demo responses ─────────────────────────────────────────────────────

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
