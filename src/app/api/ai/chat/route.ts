/**
 * POST /api/ai/chat
 *
 * Streaming AI endpoint for the session thinking-partner flow.
 * In DEMO_MODE returns canned chiropractic responses without hitting OpenAI.
 */

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { buildSystemPrompt, GENERATE_NOTE_PROMPT, parseSOAPNote } from '@/lib/ai/session-prompt'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { decryptFields, encryptFields, encrypt } from '@/lib/hipaa/encrypt'
import { isDemoMode } from '@/lib/demo/auth'
import { DEMO_AI_RESPONSES, DEMO_GENERATED_NOTE } from '@/lib/demo/mock-data'

const requestSchema = z.object({
  sessionId: z.string(),
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })),
  generateNote: z.boolean().optional().default(false),
})

// Streams a string as a text/plain response (simulates OpenAI streaming)
function streamString(text: string): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      // Stream word-by-word for a realistic feel
      const words = text.split(' ')
      for (const word of words) {
        controller.enqueue(encoder.encode(word + ' '))
        await new Promise((r) => setTimeout(r, 18))
      }
      controller.close()
    },
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) return new Response('Invalid request', { status: 400 })

  const { messages, generateNote } = parsed.data

  // ── Demo mode: return canned responses ─────────────────────────────────
  if (isDemoMode()) {
    if (generateNote) {
      return streamString(DEMO_GENERATED_NOTE)
    }
    // Pick follow-up response based on how many exchanges have happened
    const assistantCount = messages.filter((m) => m.role === 'assistant').length
    const response = DEMO_AI_RESPONSES[Math.min(assistantCount, DEMO_AI_RESPONSES.length - 1)]
    return streamString(response)
  }

  // ── Production mode: real OpenAI ───────────────────────────────────────
  const { auth } = await import('@clerk/nextjs/server')
  const { db } = await import('@/lib/db/client')
  const { streamText } = await import('ai')
  const { openai } = await import('@ai-sdk/openai')
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { sessionId } = parsed.data

  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: { patient: true, provider: true, aiConversation: true },
  })
  if (!session) return new Response('Session not found', { status: 404 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || !user.practiceId || user.practiceId !== session.practiceId) {
    return new Response('Forbidden', { status: 403 })
  }
  if (user.role === 'FRONT_DESK') return new Response('Forbidden', { status: 403 })

  const patient = decryptFields(session.patient, ['chiefComplaint'])

  const recentSessions = await db.session.findMany({
    where: { patientId: session.patientId, id: { not: sessionId }, status: 'FINALIZED' },
    orderBy: { sessionDate: 'desc' },
    take: 3,
    include: { note: true },
  })

  const recentSessionContext = recentSessions.map((s) => {
    const note = s.note ? decryptFields(s.note, ['subjective', 'assessment', 'plan']) : null
    return {
      date: s.sessionDate.toLocaleDateString(),
      subjective: note?.subjective ?? undefined,
      assessment: note?.assessment ?? undefined,
      plan: note?.plan ?? undefined,
    }
  })

  const systemPrompt = buildSystemPrompt({
    firstName: patient.firstName,
    lastName: patient.lastName,
    chiefComplaint: (patient.chiefComplaint as string | undefined) ?? undefined,
    dateOfBirth: patient.dateOfBirth?.toLocaleDateString() ?? undefined,
    visitNumber: session.visitNumber,
    recentSessions: recentSessionContext,
  })

  const finalMessages = generateNote
    ? [...messages, { role: 'user' as const, content: GENERATE_NOTE_PROMPT }]
    : messages

  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: finalMessages,
    maxOutputTokens: generateNote ? 2000 : 500,
    temperature: 0.3,
    onFinish: async ({ text, usage }) => {
      const allMessages = [
        ...messages,
        { role: 'assistant', content: text, timestamp: new Date().toISOString() },
      ]

      await db.aIConversation.upsert({
        where: { sessionId },
        create: {
          sessionId,
          messages: allMessages,
          followUpQuestionsAsked: messages.filter((m) => m.role === 'assistant').length,
          modelUsed: 'gpt-4o',
          tokensUsed: usage.totalTokens,
        },
        update: {
          messages: allMessages,
          followUpQuestionsAsked: messages.filter((m) => m.role === 'assistant').length,
          tokensUsed: usage.totalTokens,
        },
      })

      if (generateNote) {
        const soapParsed = parseSOAPNote(text)
        const encrypted = encryptFields(soapParsed, ['subjective', 'objective', 'assessment', 'plan'])
        const encryptedFullText = encrypt(text)

        await db.note.upsert({
          where: { sessionId },
          create: { sessionId, practiceId: session.practiceId, ...encrypted, aiDraft: encryptedFullText, fullText: encryptedFullText },
          update: { ...encrypted, aiDraft: encryptedFullText, fullText: encryptedFullText },
        })

        await db.session.update({ where: { id: sessionId }, data: { status: 'IN_PROGRESS' } })
      }

      await writeAuditLog({
        practiceId: session.practiceId,
        userId: user.id,
        action: 'UPDATED',
        resourceType: 'SESSION',
        resourceId: sessionId,
        metadata: { event: generateNote ? 'note_generated' : 'ai_message', tokensUsed: usage.totalTokens },
      })
    },
  })

  return result.toTextStreamResponse()
}
