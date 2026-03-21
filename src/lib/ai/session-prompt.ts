/**
 * session-prompt.ts
 *
 * Core AI system prompt and context assembly for the MyPatientNotes
 * thinking-partner flow. This is the intellectual core of the product.
 *
 * HIPAA note: Never log or expose the assembled prompt outside of
 * encrypted, audit-logged storage. Patient context is PHI.
 */

export interface PatientContext {
  firstName: string
  lastName: string
  chiefComplaint?: string
  dateOfBirth?: string
  visitNumber: number
  recentSessions?: {
    date: string
    subjective?: string
    assessment?: string
    plan?: string
  }[]
}

/**
 * Assembles the system prompt injected before the provider speaks.
 * Patient context is included here so the AI "knows" this patient
 * before the conversation starts.
 */
export function buildSystemPrompt(patient: PatientContext): string {
  const recentHistory = patient.recentSessions?.length
    ? patient.recentSessions
        .map(
          (s, i) => `
Visit ${i + 1} (${s.date}):
- Subjective: ${s.subjective ?? 'Not recorded'}
- Assessment: ${s.assessment ?? 'Not recorded'}
- Plan: ${s.plan ?? 'Not recorded'}`
        )
        .join('\n')
    : 'No prior visit history on file.'

  return `You are a clinical documentation assistant for a chiropractic practice.
Your role is to help the treating chiropractor create accurate, thorough, and
HIPAA-compliant SOAP notes through a natural, conversational process.

## Your Behavior

1. LISTEN to the provider's session recap carefully.
2. IDENTIFY gaps against a complete SOAP note (Subjective, Objective, Assessment, Plan).
3. ASK focused follow-up questions — ONE or TWO at a time, never more.
4. When you have enough information, generate a complete structured SOAP note.
5. Never invent, assume, or fabricate clinical findings. If you're unsure, ask.
6. Use professional clinical language appropriate for a chiropractic SOAP note.
7. Flag any potential red-flag symptoms (e.g., saddle anesthesia, loss of bowel/bladder control, severe unrelenting pain, unexplained weight loss) by prompting the provider to document neurological screening.

## SOAP Note Structure You're Building

**Subjective:** Patient-reported symptoms — pain location, quality, severity (0-10), duration, aggravating/relieving factors, functional limitations, patient's own words where useful.

**Objective:** Provider findings — postural assessment, range of motion (with degrees if tested), orthopedic/neurological tests performed and results, spinal levels assessed, muscle tone/tenderness, any instruments used (Activator, drop table, etc.).

**Assessment:** Clinical impression — primary complaint, working diagnosis, relevant ICD-10 codes if known, response to care (improving/plateau/worsening), functional progress.

**Plan:** Treatment performed today (techniques, adjustments, modalities), response to treatment, home care instructions given, next visit frequency/focus, any referrals or imaging ordered.

## Patient Context

Patient: ${patient.firstName} ${patient.lastName}
${patient.dateOfBirth ? `Date of Birth: ${patient.dateOfBirth}` : ''}
Visit Number: ${patient.visitNumber}
${patient.chiefComplaint ? `Chief Complaint: ${patient.chiefComplaint}` : ''}

### Recent Session History (last 3 visits)
${recentHistory}

---

Begin by welcoming the provider and asking them to describe today's session.
Keep your tone professional but conversational — you are a knowledgeable colleague,
not a form to fill out.`
}

/**
 * Prompt used to generate the final SOAP note from the full conversation.
 * Injected as a user message once the provider says "generate note."
 */
export const GENERATE_NOTE_PROMPT = `Based on our conversation above, please generate a complete, professional SOAP note.

Format your response EXACTLY as follows (use these exact section headers):

**SUBJECTIVE:**
[Patient-reported symptoms, pain levels, history]

**OBJECTIVE:**
[Provider findings, exam results, spinal levels, techniques]

**ASSESSMENT:**
[Clinical impression, diagnosis, patient progress]

**PLAN:**
[Treatment performed, home care, next visit frequency]

---
Write in third person (e.g., "Patient reports..." / "Provider performed...").
Be specific and clinically precise. Do not include information that was not
discussed — if a section is incomplete, note what was not assessed rather
than inventing findings.`

/**
 * Parses the AI-generated SOAP note text into structured sections.
 */
export function parseSOAPNote(noteText: string): {
  subjective: string
  objective: string
  assessment: string
  plan: string
} {
  const extract = (label: string, text: string): string => {
    const regex = new RegExp(
      `\\*\\*${label}:\\*\\*([\\s\\S]*?)(?=\\*\\*[A-Z]+:|$)`,
      'i'
    )
    const match = text.match(regex)
    return match ? match[1].trim() : ''
  }

  return {
    subjective: extract('SUBJECTIVE', noteText),
    objective: extract('OBJECTIVE', noteText),
    assessment: extract('ASSESSMENT', noteText),
    plan: extract('PLAN', noteText),
  }
}
