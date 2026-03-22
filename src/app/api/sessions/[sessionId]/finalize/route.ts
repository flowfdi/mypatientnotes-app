import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { getApiUserId, getOrSeedStore, finalizeSessionInStore, getPracticeId } from '@/lib/demo/store'

const finalizeSchema = z.object({
  soapNote: z.object({
    subjective: z.string().min(1, 'Subjective section is required'),
    objective: z.string().min(1, 'Objective section is required'),
    assessment: z.string().min(1, 'Assessment section is required'),
    plan: z.string().min(1, 'Plan section is required'),
  }),
  cptCodes: z.array(z.string()).optional(),
  consentSigned: z.boolean().optional(),
  consentMethod: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const userId = await getApiUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = finalizeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { sessionId } = await params
  const { sessions } = getOrSeedStore(userId)
  const session = sessions.find((s) => s.id === sessionId)
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { soapNote, cptCodes, consentSigned, consentMethod } = parsed.data
  const now = new Date()
  const noteData = {
    id: `note-${sessionId}`,
    sessionId,
    aiGenerated: false,
    finalizedAt: now,
    subjective: soapNote.subjective,
    objective: soapNote.objective,
    assessment: soapNote.assessment,
    plan: soapNote.plan,
    icd10Codes: [] as string[],
    cptCodes: cptCodes ?? [],
  }

  finalizeSessionInStore(userId, sessionId, noteData)

  // Update consent on the session object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const liveSession = sessions.find((s) => s.id === sessionId) as any
  if (liveSession) {
    liveSession.consentSigned = consentSigned ?? false
    liveSession.consentAt = consentSigned ? now : null
    liveSession.consentMethod = consentMethod ?? null
  }

  const practiceId = getPracticeId(userId)
  await writeAuditLog({
    practiceId,
    userId,
    action: 'FINALIZED',
    resourceType: 'NOTE',
    resourceId: sessionId,
  })

  return NextResponse.json({ success: true })
}
