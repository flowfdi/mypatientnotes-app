import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users, FileText, Clock, Zap, TrendingUp } from 'lucide-react'
import { format, startOfMonth } from 'date-fns'
import { isDemoMode } from '@/lib/demo/auth'
import { DEMO_USER, DEMO_PRACTICE } from '@/lib/demo/mock-data'
import { getOrSeedStore, getStoreUser, autoProvisionUser } from '@/lib/demo/store'

async function getDashboardData() {
  // ── Demo mode ──────────────────────────────────────────────────────────
  if (isDemoMode()) {
    const { sessions, patients } = getOrSeedStore('demo-user-1')
    const thisMonth = sessions.filter(
      (s) => new Date(s.sessionDate) >= startOfMonth(new Date())
    ).length
    return {
      user: { ...DEMO_USER, practice: DEMO_PRACTICE },
      patientCount: patients.length,
      sessionCount: sessions.filter((s) => s.status === 'FINALIZED').length,
      sessionsThisMonth: thisMonth,
      recentSessions: sessions.slice(0, 5),
      isPro: false,
    }
  }

  // ── Production (Clerk + in-memory store) ──────────────────────────────
  const { auth } = await import('@clerk/nextjs/server')
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Try DB first (noop stub returns null — that's fine)
  const { db } = await import('@/lib/db/client')
  let dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    include: { practice: true },
  })

  // If DB has no record, check in-memory store (set during onboarding)
  let user = dbUser ?? getStoreUser(userId)

  if (!user) {
    // Auto-provision: fetch name from Clerk and seed demo data immediately
    const { currentUser } = await import('@clerk/nextjs/server')
    const clerkUser = await currentUser()
    const firstName = clerkUser?.firstName ?? 'Doctor'
    const lastName = clerkUser?.lastName ?? 'User'
    const email =
      clerkUser?.emailAddresses?.[0]?.emailAddress ?? `${userId}@example.com`
    user = autoProvisionUser(userId, firstName, lastName, email)
  }

  const { sessions, patients } = getOrSeedStore(userId)
  const thisMonth = sessions.filter(
    (s) => new Date(s.sessionDate) >= startOfMonth(new Date())
  ).length

  return {
    user,
    patientCount: patients.length,
    sessionCount: sessions.filter((s) => s.status === 'FINALIZED').length,
    sessionsThisMonth: thisMonth,
    recentSessions: sessions.slice(0, 5),
    isPro: false,
  }
}

const HOUR = new Date().getHours()
const GREETING = HOUR < 12 ? 'Good morning' : HOUR < 17 ? 'Good afternoon' : 'Good evening'

export default async function DashboardPage() {
  const { user, patientCount, sessionCount, sessionsThisMonth, recentSessions, isPro } =
    await getDashboardData()

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {GREETING}, Dr. {user.lastName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{user.practice.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Patients', value: patientCount, icon: Users, color: 'forest' },
          { label: 'Notes Finalized', value: sessionCount, icon: FileText, color: 'emerald' },
          { label: 'Sessions This Month', value: sessionsThisMonth, icon: TrendingUp, color: 'blue' },
          { label: 'Avg. Note Time', value: '< 5 min', icon: Clock, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-9 h-9 rounded-lg bg-${color}-50 flex items-center justify-center mb-3`}>
              <Icon size={17} className={`text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent sessions */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Sessions</h2>
            <Link href="/notes" className="text-xs text-forest-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentSessions.length === 0 && (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">No sessions yet.</p>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {recentSessions.map((session: any) => (
              <Link
                key={session.id}
                href={`/patients/${session.patientId ?? session.patient?.id}/session/${session.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {session.patient.firstName} {session.patient.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    Visit #{session.visitNumber} ·{' '}
                    {format(new Date(session.sessionDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    session.status === 'FINALIZED'
                      ? 'bg-forest-50 text-forest-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {session.status === 'FINALIZED' ? 'Finalized' : 'Draft'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column: actions + Stripe CTA */}
        <div className="space-y-3">
          <Link
            href="/patients/new"
            className="flex items-center gap-3 p-4 bg-forest-500 hover:bg-forest-600 text-white rounded-xl transition-colors"
          >
            <Plus size={18} />
            <div>
              <p className="text-sm font-medium">New Patient</p>
              <p className="text-xs text-forest-200">Add to your practice</p>
            </div>
          </Link>
          <Link
            href="/patients"
            className="flex items-center gap-3 p-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl transition-colors"
          >
            <Users size={18} className="text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Start Session</p>
              <p className="text-xs text-gray-400">Select a patient</p>
            </div>
          </Link>

          {/* Pro upgrade CTA */}
          {!isPro && (
            <div className="bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl p-4 text-white">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap size={14} className="text-forest-200" />
                <span className="text-xs font-semibold text-forest-100 uppercase tracking-wider">
                  ChiroNotes IA Pro
                </span>
              </div>
              <p className="text-sm font-semibold mb-1">Unlimited AI notes</p>
              <p className="text-xs text-forest-200 mb-3 leading-relaxed">
                Unlimited sessions, team members, and priority support.
              </p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold">$99</span>
                <span className="text-xs text-forest-200">/month per provider</span>
              </div>
              <a
                href="https://buy.stripe.com/chironomia_placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2 bg-white text-forest-700 text-xs font-semibold rounded-lg hover:bg-forest-50 transition-colors"
              >
                Upgrade to Pro →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
