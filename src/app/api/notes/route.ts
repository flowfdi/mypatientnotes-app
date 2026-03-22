import { NextRequest, NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { getOrSeedStore, getApiUserId } from '@/lib/demo/store'

export async function GET(req: NextRequest) {
  const userId = await getApiUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''

  const { sessions, patients } = getOrSeedStore(userId)

  const notes = sessions
    .filter((s) => s.status === 'FINALIZED' && s.note)
    .filter((s) => {
      if (!search) return true
      const p = patients.find((p) => p.id === s.patientId)
      return p
        ? `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
        : false
    })
    .map((s) => {
      const patient = patients.find((p) => p.id === s.patientId)!
      return {
        id: s.note!.id,
        sessionId: s.id,
        finalizedAt: s.note!.finalizedAt,
        icd10Codes: s.note!.icd10Codes,
        cptCodes: s.note!.cptCodes,
        aiGenerated: s.note!.aiGenerated ?? false,
        session: {
          visitNumber: s.visitNumber,
          sessionDate: s.sessionDate,
          patient: { id: patient.id, firstName: patient.firstName, lastName: patient.lastName },
          provider: s.provider,
        },
      }
    })

  await writeAuditLog({
    practiceId: getOrSeedStore(userId).patients[0]?.practiceId ?? 'unknown',
    userId,
    action: 'READ',
    resourceType: 'NOTE',
    resourceId: 'LIST',
    metadata: { count: notes.length },
  })

  return NextResponse.json({ notes })
}
