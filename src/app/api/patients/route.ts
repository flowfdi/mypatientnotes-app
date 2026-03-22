import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { writeAuditLog } from '@/lib/hipaa/audit'
import { getOrSeedStore, getApiUserId, addPatientToStore } from '@/lib/demo/store'

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
  const userId = await getApiUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''

  const { patients } = getOrSeedStore(userId)
  const filtered = patients.filter((p) =>
    search
      ? `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
      : true
  )

  return NextResponse.json({ patients: filtered })
}

export async function POST(req: NextRequest) {
  const userId = await getApiUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createPatientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const practiceId = getOrSeedStore(userId).patients[0]?.practiceId ?? `practice-${userId}`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newPatient: any = {
    id: `patient-${Date.now()}`,
    practiceId,
    ...parsed.data,
    dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { sessions: 0 },
  }

  addPatientToStore(userId, newPatient)

  await writeAuditLog({
    practiceId,
    userId,
    action: 'CREATED',
    resourceType: 'PATIENT',
    resourceId: newPatient.id,
  })

  return NextResponse.json({ patient: newPatient })
}
