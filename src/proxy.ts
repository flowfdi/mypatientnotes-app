import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DEMO_MODE = process.env.DEMO_MODE === 'true'
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000

// In production this file imports from @clerk/nextjs/server.
// In demo mode we use a lightweight cookie-based mock.
async function handleProduction(req: NextRequest) {
  const { clerkMiddleware, createRouteMatcher } =
    await import('@clerk/nextjs/server')

  const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhooks(.*)'])
  const isDashboardRoute = createRouteMatcher([
    '/dashboard(.*)', '/patients(.*)', '/notes(.*)', '/settings(.*)', '/onboarding(.*)',
  ])

  return clerkMiddleware(async (auth, request: NextRequest) => {
    if (isPublicRoute(request)) return NextResponse.next()

    if (isDashboardRoute(request)) {
      const { userId } = await auth()
      if (!userId) {
        const signInUrl = new URL('/sign-in', request.url)
        signInUrl.searchParams.set('redirect_url', request.url)
        return NextResponse.redirect(signInUrl)
      }

      const lastActive = request.cookies.get('last_active')?.value
      if (lastActive) {
        const lastActiveMs = parseInt(lastActive, 10)
        if (!isNaN(lastActiveMs) && Date.now() - lastActiveMs > INACTIVITY_TIMEOUT_MS) {
          const signInUrl = new URL('/sign-in', request.url)
          signInUrl.searchParams.set('reason', 'timeout')
          const response = NextResponse.redirect(signInUrl)
          response.cookies.delete('last_active')
          return response
        }
      }

      const response = NextResponse.next()
      response.cookies.set('last_active', String(Date.now()), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: INACTIVITY_TIMEOUT_MS / 1000,
      })
      return response
    }

    return NextResponse.next()
  })(req, {} as never)
}

function handleDemo(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // Public routes pass through
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return NextResponse.next()
  }

  // Root → demo dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Inject demo session cookie + last_active on every request
  const response = NextResponse.next()
  response.cookies.set('demo_session', 'demo-user-1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours for demo
  })
  response.cookies.set('last_active', String(Date.now()), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return response
}

export default async function middleware(req: NextRequest) {
  if (DEMO_MODE) return handleDemo(req)
  return handleProduction(req)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
