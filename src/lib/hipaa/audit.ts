/**
 * audit.ts
 *
 * HIPAA-required audit logging. Every access, modification, and export
 * of PHI must be logged here. This table is INSERT-ONLY — never delete
 * or update audit log entries.
 *
 * Call writeAuditLog() from every API route that touches patient data.
 */

import { headers } from 'next/headers'
import { isDemoMode } from '@/lib/demo/auth'

export type AuditAction =
  | 'CREATED'
  | 'READ'
  | 'UPDATED'
  | 'FINALIZED'
  | 'EXPORTED'
  | 'DELETED'
  | 'LOGIN'
  | 'LOGOUT'

export type AuditResource =
  | 'PATIENT'
  | 'SESSION'
  | 'NOTE'
  | 'USER'
  | 'PRACTICE'

interface AuditEntry {
  practiceId: string
  userId?: string
  action: AuditAction
  resourceType: AuditResource
  resourceId: string
  metadata?: Record<string, unknown> // NEVER include PHI here
}

/**
 * Writes an audit log entry. Extracts IP and user agent from request headers.
 * Safe to call from any server-side context (API routes, Server Actions).
 *
 * IMPORTANT: metadata must never contain PHI. Only include IDs, counts,
 * or other non-identifying operational context.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  // Demo mode: no DB — skip silently
  if (isDemoMode()) return

  try {
    const { db } = await import('@/lib/db/client')
    const headersList = await headers()
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headersList.get('x-real-ip') ??
      'unknown'
    const userAgent = headersList.get('user-agent') ?? 'unknown'

    await db.auditLog.create({
      data: {
        practiceId: entry.practiceId,
        userId: entry.userId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        ipAddress,
        userAgent,
        metadata: (entry.metadata ?? {}) as Record<string, string | number | boolean | null>,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    // Always log to stderr — captured by Vercel/Sentry log drain
    console.error('[AUDIT LOG FAILURE]', {
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      error: message,
    })
    // Surface to error tracking in production so on-call is alerted
    // (Wire to Sentry, Datadog, etc. by setting NEXT_PUBLIC_SENTRY_DSN)
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch(process.env.AUDIT_ALERT_WEBHOOK_URL ?? '', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 AUDIT LOG FAILURE — ${entry.action} on ${entry.resourceType}:${entry.resourceId} — ${message}`,
          }),
        }).catch(() => undefined)
      } catch {
        // Never throw from the audit logger
      }
    }
    // Do NOT throw — let the main operation succeed; alert separately
  }
}
