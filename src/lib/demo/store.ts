/**
 * Per-user in-memory store with auto-seeding.
 *
 * Works for both DEMO_MODE users (userId = 'demo-user-1') and real Clerk users.
 * On Vercel cold start the store is empty — getOrSeedStore() re-seeds automatically
 * so the dashboard never shows empty state.
 */

import { DEMO_PATIENTS, DEMO_SESSIONS, DEMO_PRACTICE } from './mock-data'

// ── Types ─────────────────────────────────────────────────────────────────

export type StorePatient = (typeof DEMO_PATIENTS)[number]
export type StoreSession = (typeof DEMO_SESSIONS)[number]

export interface StoreUser {
  id: string
  clerkId: string
  firstName: string
  lastName: string
  email: string
  role: string
  npiNumber: string | null
  practice: {
    id: string
    name: string
    address: string | null
    phone: string | null
    npiNumber: string | null
    state: string
  }
}

interface UserData {
  patients: StorePatient[]
  sessions: StoreSession[]
}

// ── Module-level maps (persist within a single serverless instance) ────────

const userData = new Map<string, UserData>()
const userRecords = new Map<string, StoreUser>()

// ── Seeding ───────────────────────────────────────────────────────────────

function buildSeed(practiceId: string, providerId: string): UserData {
  return {
    patients: DEMO_PATIENTS.map((p) => ({ ...p, practiceId })),
    sessions: DEMO_SESSIONS.map((s) => ({
      ...s,
      practiceId,
      providerId,
    })),
  }
}

// ── Public API ────────────────────────────────────────────────────────────

/** Returns (and seeds if necessary) the patient/session store for a user. */
export function getOrSeedStore(userId: string): UserData {
  if (!userData.has(userId)) {
    const practiceId = userRecords.get(userId)?.practice.id ?? `practice-${userId}`
    userData.set(userId, buildSeed(practiceId, userId))
  }
  return userData.get(userId)!
}

/** Returns the stored user profile, or null if not yet created. */
export function getStoreUser(userId: string): StoreUser | null {
  return userRecords.get(userId) ?? null
}

/** Creates/updates a user profile in the store and seeds their data. */
export function setStoreUser(userId: string, user: StoreUser): void {
  userRecords.set(userId, user)
  if (!userData.has(userId)) {
    userData.set(userId, buildSeed(user.practice.id, userId))
  }
}

/**
 * Auto-creates a minimal user record from a Clerk userId + optional display info.
 * Called when a Clerk user lands on the dashboard without having done onboarding.
 */
export function autoProvisionUser(
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
): StoreUser {
  const existing = userRecords.get(userId)
  if (existing) return existing

  const user: StoreUser = {
    id: userId,
    clerkId: userId,
    firstName,
    lastName,
    email,
    role: 'OWNER',
    npiNumber: null,
    practice: {
      id: `practice-${userId}`,
      name: `${lastName} Chiropractic`,
      address: null,
      phone: null,
      npiNumber: null,
      state: 'IA',
    },
  }
  setStoreUser(userId, user)
  return user
}

// ── Patient CRUD ──────────────────────────────────────────────────────────

export function addPatientToStore(userId: string, patient: StorePatient): void {
  getOrSeedStore(userId).patients.push(patient)
}

export function removePatientFromStore(userId: string, patientId: string): void {
  const store = getOrSeedStore(userId)
  store.patients = store.patients.filter((p) => p.id !== patientId)
  store.sessions = store.sessions.filter((s) => s.patientId !== patientId)
}

// ── Session CRUD ──────────────────────────────────────────────────────────

export function addSessionToStore(userId: string, session: StoreSession): void {
  getOrSeedStore(userId).sessions.push(session)
}

export function finalizeSessionInStore(
  userId: string,
  sessionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  noteData: any,
): void {
  const store = getOrSeedStore(userId)
  const session = store.sessions.find((s) => s.id === sessionId) as StoreSession & {
    status: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    note: any
  }
  if (session) {
    session.status = 'FINALIZED'
    session.note = noteData
  }
}

// ── Helper — get userId for any API context ────────────────────────────────

/**
 * Returns the effective userId for the current request.
 * In demo mode returns the hardcoded demo user id.
 * In production calls Clerk auth().
 */
export async function getApiUserId(): Promise<string | null> {
  if (process.env.DEMO_MODE === 'true') return 'demo-user-1'
  const { auth } = await import('@clerk/nextjs/server')
  const { userId } = await auth()
  return userId
}

/**
 * Returns the default practice id for a userId.
 * For demo-user-1, returns DEMO_PRACTICE.id.
 */
export function getPracticeId(userId: string): string {
  if (userId === 'demo-user-1') return DEMO_PRACTICE.id
  return userRecords.get(userId)?.practice.id ?? `practice-${userId}`
}
