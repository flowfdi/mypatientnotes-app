import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { encryptFields, encrypt } from '@/lib/hipaa/encrypt'
import { isDemoMode } from '@/lib/demo/auth'

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
  const body = await req.json()

  if (isDemoMode()) {
    // In demo mode just acknowledge — no DB write needed
    return NextResponse.json({ success: true })
  }

  const { auth } = await import('@clerk/nextjs/server')
  const { db } = await import('@/lib/db/client')
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = finalizeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || !user.practiceId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.role === 'FRONT_DESK') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { sessionId } = await params
  const session = await db.session.findUnique({ where: { id: sessionId } })
  if (!session || session.practiceId !== user.practiceId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { soapNote, cptCodes, consentSigned, consentMethod } = parsed.data
  const encrypted = encryptFields(soapNote, ['subjective', 'objective', 'assessment', 'plan'])
  const fullTextPlain = `SUBJECTIVE:\n${soapNote.subjective}\n\nOBJECTIVE:\n${soapNote.objective}\n\nASSESSMENT:\n${soapNote.assessment}\n\nPLAN:\n${soapNote.plan}`
  const fullText = encrypt(fullTextPlain)
  const now = new Date()

  await db.$transaction([
    db.note.upsert({
      where: { sessionId },
      create: { sessionId, practiceId: session.practiceId, ...encrypted, fullText, cptCodes: cptCodes ?? [], finalizedAt: now, finalizedById: user.id },
      update: { ...encrypted, fullText, cptCodes: cptCodes ?? [], finalizedAt: now, finalizedById: user.id },
    }),
    db.session.update({
      where: { id: sessionId },
      data: {
        status: 'FINALIZED',
        consentSigned: consentSigned ?? false,
        consentAt: consentSigned ? now : null,
        consentMethod: consentMethod ?? null,
      },
    }),
  ])

  await writeAuditLog({
    practiceId: session.practiceId,
    userId: user.id,
    action: 'FINALIZED',
    resourceType: 'NOTE',
    resourceId: sessionId,
  })

  return NextResponse.json({ success: true })
}
