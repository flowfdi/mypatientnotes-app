'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, Settings, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Patient Profiles', icon: Users },
  { href: '/notes', label: 'Session Notes', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
]

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex flex-col bg-white border-r border-gray-200 py-6 px-3">
      {/* Logo */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-forest-500 flex items-center justify-center">
            <FileText size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">ChiroNotes <span className="text-forest-500">IA</span></span>
        </div>
        {IS_DEMO && (
          <span className="mt-1.5 inline-block text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
            DEMO
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-forest-50 text-forest-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon
                size={16}
                className={active ? 'text-forest-500' : 'text-gray-400'}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 pt-4 border-t border-gray-100">
        {IS_DEMO ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-forest-50 flex items-center justify-center">
              <User size={14} className="text-forest-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">Dr. S. Johnson</p>
              <p className="text-[10px] text-gray-400">Demo Account</p>
            </div>
          </div>
        ) : (
          <DynamicUserButton />
        )}
      </div>
    </aside>
  )
}

function DynamicUserButton() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { UserButton } = require('@clerk/nextjs')
  return <UserButton />
}
