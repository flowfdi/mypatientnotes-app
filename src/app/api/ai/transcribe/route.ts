/**
 * POST /api/ai/transcribe
 *
 * Proxies audio to OpenAI Whisper for transcription.
 * We proxy server-side to keep the OpenAI API key off the client
 * and to apply HIPAA audit logging.
 */

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { db } from '@/lib/db/client'
import { writeAuditLog } from '@/lib/hipaa/audit'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || !user.practiceId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // RBAC — only providers and owners can transcribe session audio
  if (user.role === 'FRONT_DESK') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const sessionId = formData.get('sessionId') as string | null

  if (!file) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
  }

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'en',
    prompt:
      'This is a chiropractic session dictation. Medical terms may include: subluxation, sacroiliac, cervical, lumbar, thoracic, ROM, palpation, paraspinal, Activator, diversified technique.',
  })

  // HIPAA audit log — PHI is processed here (voice → text of clinical session)
  await writeAuditLog({
    practiceId: user.practiceId,
    userId: user.id,
    action: 'UPDATED',
    resourceType: 'SESSION',
    resourceId: sessionId ?? 'unknown',
    metadata: { event: 'audio_transcribed', transcriptLength: transcription.text.length },
  })

  return NextResponse.json({ text: transcription.text })
}
