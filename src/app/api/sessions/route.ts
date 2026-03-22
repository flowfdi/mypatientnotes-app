import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { getOrSeedStore, getApiUserId, addSessionToStore, getPracticeId } from '@/lib/demo/store'

const createSessionSchema = z.object({
  patientId: z.string(),
})

export async function POST(req: NextRequest) {
  const userId = await getApiUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createSessionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { patients, sessions } = getOrSeedStore(userId)
  const patient = patients.find((p) => p.id === parsed.data.patientId)
  if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

  const visitCount = sessions.filter((s) => s.patientId === parsed.data.patientId).length
  const practiceId = getPracticeId(userId)
  const sessionId = `session-${Date.now()}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newSession: any = {
    id: sessionId,
    practiceId,
    patientId: parsed.data.patientId,
    providerId: userId,
    sessionDate: new Date(),
    status: 'DRAFT',
    visitNumber: visitCount + 1,
    rawTranscript: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: { id: patient.id, firstName: patient.firstName, lastName: patient.lastName },
    provider: { firstName: 'Doctor', lastName: 'User' },
    note: null,
  }

  addSessionToStore(userId, newSession)

  await writeAuditLog({
    practiceId,
    userId,
    action: 'CREATED',
    resourceType: 'SESSION',
    resourceId: sessionId,
  })

  return NextResponse.json({ sessionId })
}
