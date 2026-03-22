/**
 * POST /api/onboarding
 *
 * Creates the practice and links the Clerk user as the Owner.
 * Persists to the in-memory store so the dashboard can find the user immediately.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isDemoMode } from '@/lib/demo/auth'
import { setStoreUser } from '@/lib/demo/store'

const onboardingSchema = z.object({
  practiceName: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  npiNumber: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  providerNpi: z.string().optional(),
})

export async function POST(req: NextRequest) {
  if (isDemoMode()) {
    return NextResponse.json({ success: true, practiceId: 'demo-practice-1' })
  }

  const { auth } = await import('@clerk/nextjs/server')
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = onboardingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { practiceName, address, phone, npiNumber, firstName, lastName, providerNpi } = parsed.data
  const practiceId = `practice-${userId}`

  const { currentUser } = await import('@clerk/nextjs/server')
  const clerkUser = await currentUser()
  const email =
    clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${userId}@placeholder.com`

  // Persist to in-memory store (seeds demo data automatically)
  setStoreUser(userId, {
    id: userId,
    clerkId: userId,
    firstName,
    lastName,
    email,
    role: 'OWNER',
    npiNumber: providerNpi ?? null,
    practice: {
      id: practiceId,
      name: practiceName,
      address: address ?? null,
      phone: phone ?? null,
      npiNumber: npiNumber ?? null,
      state: 'IA',
    },
  })

  return NextResponse.json({ success: true, practiceId })
}
