import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { encryptFields, decryptFields } from '@/lib/hipaa/encrypt'
import { isDemoMode } from '@/lib/demo/auth'
import { DEMO_PATIENTS, DEMO_DYNAMIC_PATIENTS } from '@/lib/demo/mock-data'

const PHI_FIELDS = ['chiefComplaint'] as const

const createPatientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().optional(),
  sex: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  insuranceProvider: z.string().optional(),
  insuranceId: z.string().optional(),
  chiefComplaint: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''

  if (isDemoMode()) {
    const all = [...DEMO_PATIENTS, ...DEMO_DYNAMIC_PATIENTS]
    const filtered = all.filter((p) =>
      search
        ? `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
        : true
    )
    return NextResponse.json({ patients: filtered })
  }

  const { auth } = await import('@clerk/nextjs/server')
  const { db } = await import('@/lib/db/client')
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || !user.practiceId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const patients = await db.patient.findMany({
    where: {
      practiceId: user.practiceId,
      isArchived: false,
      OR: search
        ? [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    },
    orderBy: { lastName: 'asc' },
    include: { _count: { select: { sessions: true } } },
  })

  const decrypted = patients.map((p) => decryptFields(p, [...PHI_FIELDS]))

  await writeAuditLog({
    practiceId: user.practiceId,
    userId: user.id,
    action: 'READ',
    resourceType: 'PATIENT',
    resourceId: 'LIST',
    metadata: { count: patients.length },
  })

  return NextResponse.json({ patients: decrypted })
}

export async function POST(req: NextRequest) {
  if (isDemoMode()) {
    const body = await req.json()
    const newPatient = {
      id: `patient-demo-${Date.now()}`,
      practiceId: 'demo-practice-1',
      ...body,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      sessions: [],
      _count: { sessions: 0 },
    }
    // Persist in process memory so GET /api/patients/[id] can find it
    DEMO_DYNAMIC_PATIENTS.push(newPatient as typeof DEMO_DYNAMIC_PATIENTS[number])
    return NextResponse.json({ patient: newPatient })
  }

  const { auth } = await import('@clerk/nextjs/server')
  const { db } = await import('@/lib/db/client')
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId: userId } })
  if (!user || !user.practiceId) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.role === 'FRONT_DESK') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const parsed = createPatientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const data = parsed.data
  const encrypted = encryptFields(data, [...PHI_FIELDS])

  const patient = await db.patient.create({
    data: {
      ...encrypted,
      practiceId: user.practiceId,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    },
  })

  await writeAuditLog({
    practiceId: user.practiceId,
    userId: user.id,
    action: 'CREATED',
    resourceType: 'PATIENT',
    resourceId: patient.id,
  })

  return NextResponse.json({ patient })
}
