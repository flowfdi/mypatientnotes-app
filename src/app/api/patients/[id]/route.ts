import { NextRequest, NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { decryptFields } from '@/lib/hipaa/encrypt'
import { isDemoMode } from '@/lib/demo/auth'
import { DEMO_PATIENTS, DEMO_DYNAMIC_PATIENTS, DEMO_SESSIONS } from '@/lib/demo/mock-data'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (isDemoMode()) {
    const patient =
      DEMO_PATIENTS.find((p) => p.id === id) ??
      DEMO_DYNAMIC_PATIENTS.find((p) => p.id === id)
    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const sessions = DEMO_SESSIONS.filter((s) => s.patientId === id)
    return NextResponse.json({ patient: { ...patient, sessions } })
  }

  const { auth } = await import('@clerk/nextjs/server')
  const { db } = await import('@/lib/db/client')
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || !user.practiceId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const patient = await db.patient.findUnique({
    where: { id },
    include: {
      sessions: {
        orderBy: { sessionDate: 'desc' },
        include: { note: true, provider: true },
      },
    },
  })

  if (!patient || patient.practiceId !== user.practiceId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const decrypted = decryptFields(patient, ['chiefComplaint'])

  await writeAuditLog({
    practiceId: user.practiceId,
    userId: user.id,
    action: 'READ',
    resourceType: 'PATIENT',
    resourceId: id,
  })

  return NextResponse.json({ patient: decrypted })
}
