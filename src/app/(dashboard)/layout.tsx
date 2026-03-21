import { Sidebar } from '@/components/Sidebar'
import { isDemoMode } from '@/lib/demo/auth'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isDemoMode()) {
    const { auth } = await import('@clerk/nextjs/server')
    const { redirect } = await import('next/navigation')
    const { userId } = await auth()
    if (!userId) redirect('/sign-in')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
