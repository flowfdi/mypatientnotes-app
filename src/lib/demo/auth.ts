/**
 * Demo-mode auth helpers.
 * Returns the hardcoded demo user instead of hitting Clerk + DB.
 */
import { cookies } from 'next/headers'
import { DEMO_USER, DEMO_PRACTICE } from './mock-data'

export function isDemoMode() {
  return process.env.DEMO_MODE === 'true'
}

export async function getDemoUser() {
  return { ...DEMO_USER, practice: DEMO_PRACTICE }
}

export async function getDemoSession() {
  const cookieStore = await cookies()
  return cookieStore.get('demo_session')?.value ?? null
}
