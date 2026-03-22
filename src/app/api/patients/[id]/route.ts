import { NextRequest, NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { getOrSeedStore, getApiUserId } from '@/lib/demo/store'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const userId = await getApiUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { patients, sessions } = getOrSeedStore(userId)
  const patient = patients.find((p) => p.id === id)
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const patientSessions = sessions.filter((s) => s.patientId === id)

  await writeAuditLog({
    practiceId: patient.practiceId,
    userId,
    action: 'READ',
    resourceType: 'PATIENT',
    resourceId: id,
  })

  return NextResponse.json({ patient: { ...patient, sessions: patientSessions } })
}
