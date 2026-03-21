import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { isDemoMode } from '@/lib/demo/auth'

const createSessionSchema = z.object({
  patientId: z.string(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (isDemoMode()) {
    const sessionId = `session-demo-${Date.now()}`
    return NextResponse.json({ sessionId })
  }

  const { auth } = await import('@clerk/nextjs/server')
  const { db } = await import('@/lib/db/client')
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createSessionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || !user.practiceId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.role === 'FRONT_DESK') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const patient = await db.patient.findUnique({ where: { id: parsed.data.patientId } })
  if (!patient || patient.practiceId !== user.practiceId) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
  }

  const visitCount = await db.session.count({ where: { patientId: parsed.data.patientId } })

  const session = await db.session.create({
    data: {
      patientId: parsed.data.patientId,
      practiceId: user.practiceId,
      providerId: user.id,
      visitNumber: visitCount + 1,
      status: 'DRAFT',
    },
  })

  await writeAuditLog({
    practiceId: user.practiceId,
    userId: user.id,
    action: 'CREATED',
    resourceType: 'SESSION',
    resourceId: session.id,
  })

  return NextResponse.json({ sessionId: session.id })
}
