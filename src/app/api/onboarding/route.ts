/**
 * POST /api/onboarding
 *
 * Creates the practice and links the Clerk user as the Owner.
 * Called once during first-run onboarding.
 */
import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { isDemoMode } from '@/lib/demo/auth'

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

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = onboardingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Check if user already onboarded
  const existingUser = await db.user.findUnique({ where: { clerkId: userId } })
  if (existingUser) {
    return NextResponse.json({ error: 'Already onboarded' }, { status: 400 })
  }

  const { practiceName, address, phone, npiNumber, firstName, lastName, providerNpi } = parsed.data

  // Get email from Clerk token
  const clerkUser = await auth()
  const email = `${userId}@placeholder.com` // replaced by real email via Clerk webhook in prod

  const { practice, user } = await db.$transaction(async (tx) => {
    const practice = await tx.practice.create({
      data: { name: practiceName, address, phone, npiNumber },
    })

    const user = await tx.user.create({
      data: {
        practiceId: practice.id,
        clerkId: userId,
        email,
        firstName,
        lastName,
        role: 'OWNER',
        npiNumber: providerNpi,
      },
    })

    return { practice, user }
  })

  await writeAuditLog({
    practiceId: practice.id,
    userId: user.id,
    action: 'CREATED',
    resourceType: 'PRACTICE',
    resourceId: practice.id,
    metadata: { event: 'onboarding_complete' },
  })

  return NextResponse.json({ success: true, practiceId: practice.id })
}
