import { NextRequest, NextResponse } from 'next/server'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { getOrSeedStore, getApiUserId } from '@/lib/demo/store'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  const userId = await getApiUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessions } = getOrSeedStore(userId)
  const session = sessions.find((s) => s.id === sessionId)
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await writeAuditLog({
    practiceId: session.practiceId,
    userId,
    action: 'READ',
    resourceType: 'SESSION',
    resourceId: sessionId,
  })

  return NextResponse.json({ session })
}
