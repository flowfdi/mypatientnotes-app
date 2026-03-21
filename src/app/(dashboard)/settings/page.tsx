import { isDemoMode } from '@/lib/demo/auth'
import { DEMO_USER, DEMO_PRACTICE } from '@/lib/demo/mock-data'
import { ALL_STATES } from '@/lib/compliance/state-rules'

interface SettingsUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  npiNumber?: string | null
  practice: { name: string; npiNumber?: string | null; address?: string | null; phone?: string | null; state?: string | null }
}

async function getSettingsData(): Promise<{ user: SettingsUser }> {
  if (isDemoMode()) {
    return { user: { ...DEMO_USER, practice: DEMO_PRACTICE } }
  }
  const { auth } = await import('@clerk/nextjs/server')
  const { db } = await import('@/lib/db/client')
  const { redirect } = await import('next/navigation')
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const dbUser = await db.user.findUnique({ where: { clerkId: userId as string }, include: { practice: true } })
  if (!dbUser) redirect('/onboarding')
  const u = dbUser!
  return {
    user: {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: String(u.role),
      npiNumber: u.npiNumber ?? undefined,
      practice: { name: u.practice.name, npiNumber: u.practice.npiNumber ?? undefined, address: u.practice.address ?? undefined, phone: u.practice.phone ?? undefined },
    },
  }
}

export default async function SettingsPage() {
  const { user } = await getSettingsData()

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">{user.practice.name}</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Practice Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Practice Name', value: user.practice.name },
            { label: 'NPI Number', value: user.practice.npiNumber },
            { label: 'Address', value: user.practice.address },
            { label: 'Phone', value: user.practice.phone },
            { label: 'State / Jurisdiction', value: ALL_STATES.find(s => s.code === (user.practice.state ?? 'IA'))?.name ?? (user.practice.state ?? 'Iowa') },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-gray-700 mt-0.5">{value ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Your Account</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 font-medium">Name</p>
            <p className="text-gray-700 mt-0.5">Dr. {user.firstName} {user.lastName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Role</p>
            <p className="text-gray-700 mt-0.5 capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">NPI Number</p>
            <p className="text-gray-700 mt-0.5">{user.npiNumber ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Email</p>
            <p className="text-gray-700 mt-0.5">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Iowa compliance rules summary */}
      <div className="bg-forest-50 border border-forest-200 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-forest-800 mb-2">
          {ALL_STATES.find(s => s.code === (user.practice.state ?? 'IA'))?.name ?? 'Iowa'} Chiropractic Compliance
        </h3>
        <ul className="text-xs text-forest-700 space-y-1">
          {(ALL_STATES.find(s => s.code === (user.practice.state ?? 'IA'))?.notes ?? []).map((note, i) => (
            <li key={i}>· {note}</li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">HIPAA Compliance</h3>
        <p className="text-xs text-amber-700 leading-relaxed">
          All patient notes are encrypted at rest using AES-256-GCM. Session activity is
          logged for audit purposes. Your session automatically expires after 15 minutes of
          inactivity.
        </p>
      </div>

      {isDemoMode() && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-800 mb-1">Demo Mode Active</h3>
          <p className="text-xs text-blue-700">
            You&apos;re viewing a read-only demo with mock data. No real patient data is stored.
          </p>
        </div>
      )}
    </div>
  )
}
