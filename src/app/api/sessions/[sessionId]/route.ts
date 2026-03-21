import { NextRequest, NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { decryptFields } from '@/lib/hipaa/encrypt'
import { isDemoMode } from '@/lib/demo/auth'
import { DEMO_SESSIONS } from '@/lib/demo/mock-data'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  if (isDemoMode()) {
    const session = DEMO_SESSIONS.find((s) => s.id === sessionId)
    if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ session })
  }

  const { auth } = await import('@clerk/nextjs/server')
  const { db } = await import('@/lib/db/client')
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || !user.practiceId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { patient: true, provider: true, note: true },
  })

  if (!session || session.practiceId !== user.practiceId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const decryptedNote = session.note
    ? decryptFields(session.note, ['subjective', 'objective', 'assessment', 'plan', 'fullText'])
    : null

  await writeAuditLog({
    practiceId: user.practiceId,
    userId: user.id,
    action: 'READ',
    resourceType: 'SESSION',
    resourceId: sessionId,
  })

  return NextResponse.json({ session: { ...session, note: decryptedNote } })
}
