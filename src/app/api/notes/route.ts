import { NextRequest, NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { isDemoMode } from '@/lib/demo/auth'
import { DEMO_SESSIONS, DEMO_PATIENTS } from '@/lib/demo/mock-data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''

  if (isDemoMode()) {
    const notes = DEMO_SESSIONS.filter((s) => s.status === 'FINALIZED' && s.note)
      .filter((s) => {
        if (!search) return true
        const p = DEMO_PATIENTS.find((p) => p.id === s.patientId)
        return p
          ? `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
          : false
      })
      .map((s) => {
        const patient = DEMO_PATIENTS.find((p) => p.id === s.patientId)!
        return {
          id: s.note!.id,
          sessionId: s.id,
          finalizedAt: s.note!.finalizedAt,
          icd10Codes: s.note!.icd10Codes,
          cptCodes: s.note!.cptCodes,
          session: {
            visitNumber: s.visitNumber,
            sessionDate: s.sessionDate,
            patient: { id: patient.id, firstName: patient.firstName, lastName: patient.lastName },
            provider: s.provider,
          },
        }
      })
    return NextResponse.json({ notes })
  }

  const { auth } = await import('@clerk/nextjs/server')
  const { db } = await import('@/lib/db/client')
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || !user.practiceId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const notes = await db.note.findMany({
    where: {
      practiceId: user.practiceId,
      finalizedAt: { not: null },
      ...(search
        ? {
            session: {
              patient: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          }
        : {}),
    },
    orderBy: { finalizedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      sessionId: true,
      finalizedAt: true,
      icd10Codes: true,
      cptCodes: true,
      session: {
        select: {
          visitNumber: true,
          sessionDate: true,
          patient: { select: { id: true, firstName: true, lastName: true } },
          provider: { select: { firstName: true, lastName: true } },
        },
      },
    },
  })

  await writeAuditLog({
    practiceId: user.practiceId,
    userId: user.id,
    action: 'READ',
    resourceType: 'NOTE',
    resourceId: 'LIST',
    metadata: { count: notes.length },
  })

  return NextResponse.json({ notes })
}
