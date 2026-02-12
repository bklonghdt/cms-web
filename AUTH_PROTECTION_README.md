# Authentication Protection System

## Overview

A complete authentication protection system has been implemented to ensure users must be logged in to access admin pages. The system uses both server-side middleware and client-side guards for comprehensive protection.

## Architecture

### Two-Layer Protection

```
┌─────────────────────────────────────────────────────────────┐
│                    User Attempts Access                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Server-Side Middleware (middleware.ts)            │
│  - Checks auth-token cookie                                  │
│  - Redirects to /login if no token                          │
│  - Adds redirect parameter for return URL                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Client-Side AuthGuard Component                   │
│  - Checks Zustand auth state                                 │
│  - Shows loading state while checking                        │
│  - Redirects if not authenticated                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Protected Content Rendered                      │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Server-Side Middleware (`middleware.ts`)

Runs on the server before any page is rendered.

**Features:**
- ✅ Checks for `auth-token` cookie
- ✅ Protects `/dashboard` and `/admin` routes
- ✅ Redirects unauthenticated users to `/login?redirect=/original-path`
- ✅ Prevents authenticated users from accessing `/login` (redirects to `/dashboard`)
- ✅ Excludes API routes, static files, and images

**Protected Routes:**
```typescript
const protectedRoutes = ['/dashboard', '/admin']
```

**Configuration:**
```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 2. Client-Side AuthGuard (`components/auth/auth-guard.tsx`)

React component that wraps protected content.

**Features:**
- ✅ Checks Zustand authentication state
- ✅ Shows loading spinner while checking
- ✅ Redirects to login with return URL
- ✅ Customizable fallback UI
- ✅ Automatic re-check on auth state changes

**Usage:**
```tsx
import { AuthGuard } from "@/components/auth/auth-guard"

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <YourProtectedContent />
    </AuthGuard>
  )
}
```

**With Custom Fallback:**
```tsx
<AuthGuard fallback={<CustomLoadingComponent />}>
  <YourProtectedContent />
</AuthGuard>
```

### 3. Protected Pages

#### Dashboard (`app/dashboard/page.tsx`)
- Protected admin dashboard
- Displays user information
- Logout button with loading state
- Shows authentication status

#### Admin Panel (`app/admin/page.tsx`)
- Protected admin panel
- Example admin features grid
- User identification
- Logout functionality

## Authentication Flow

### Login Flow with Redirect

```
1. User tries to access /dashboard (not logged in)
   ↓
2. Middleware detects no auth-token cookie
   ↓
3. Redirects to /login?redirect=/dashboard
   ↓
4. User enters credentials and submits
   ↓
5. useLogin hook processes login
   ↓
6. On success:
   - Token stored in cookie
   - User data saved to Zustand
   - Reads redirect parameter
   - Navigates to /dashboard (original destination)
```

### Logout Flow

```
1. User clicks logout button
   ↓
2. useLogout mutation triggered
   ↓
3. API route deletes auth-token cookie
   ↓
4. Zustand store cleared
   ↓
5. React Query cache cleared
   ↓
6. Redirect to /login
```

### Access Attempt Flow (Unauthenticated)

```
1. User navigates to /admin
   ↓
2. Middleware checks cookie → Not found
   ↓
3. Redirect to /login?redirect=/admin
   ↓
4. Login page loads
   ↓
5. After successful login → Redirect to /admin
```

## File Structure

```
frontend/
├── middleware.ts                     # Server-side route protection
├── app/
│   ├── login/
│   │   └── page.tsx                  # Login page (handles redirect param)
│   ├── dashboard/
│   │   └── page.tsx                  # Protected dashboard with AuthGuard
│   ├── admin/
│   │   └── page.tsx                  # Protected admin panel with AuthGuard
│   └── api/
│       └── auth/
│           ├── login/
│           │   └── route.ts          # Sets auth-token cookie
│           └── logout/
│               └── route.ts          # Deletes auth-token cookie
├── components/
│   └── auth/
│       └── auth-guard.tsx            # Client-side protection component
└── lib/
    ├── hooks/
    │   └── use-auth.ts               # Login/logout hooks with redirect
    └── stores/
        └── auth-store.ts             # Zustand auth state
```

## Adding Protection to New Pages

### Method 1: Using AuthGuard (Recommended)

```tsx
"use client"

import { AuthGuard } from "@/components/auth/auth-guard"

function MyProtectedContent() {
  return <div>Protected content here</div>
}

export default function MyProtectedPage() {
  return (
    <AuthGuard>
      <MyProtectedContent />
    </AuthGuard>
  )
}
```

### Method 2: Update Middleware

Add your route to the protected routes array in `middleware.ts`:

```typescript
const protectedRoutes = ['/dashboard', '/admin', '/settings', '/profile']
```

### Method 3: Manual Check

```tsx
"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MyPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return <div>Protected content</div>
}
```

## Testing Protection

### Test Unauthenticated Access

1. Clear cookies and localStorage
2. Navigate to `http://localhost:3000/dashboard`
3. Should redirect to `/login?redirect=/dashboard`
4. Login successfully
5. Should redirect back to `/dashboard`

### Test Authenticated Access

1. Login at `/login`
2. Navigate to `/dashboard` - Should show dashboard
3. Navigate to `/admin` - Should show admin panel
4. Try to access `/login` - Should redirect to `/dashboard`

### Test Logout

1. From `/dashboard`, click logout button
2. Should redirect to `/login`
3. Try to access `/dashboard` again
4. Should redirect to `/login?redirect=/dashboard`

## Security Features

### Server-Side Protection
✅ **Cookie-based authentication** - HTTP-only cookies prevent XSS attacks  
✅ **Middleware validation** - Runs before page render  
✅ **Automatic redirects** - No protected content exposed  
✅ **Return URL preservation** - Seamless user experience  

### Client-Side Protection
✅ **State validation** - Checks Zustand auth state  
✅ **Loading states** - Prevents flash of protected content  
✅ **Automatic cleanup** - Clears state on logout  
✅ **Persistent state** - Survives page refreshes  

## Customization

### Adding Role-Based Access

Update `AuthGuard` to check user roles:

```tsx
interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (requiredRole && user?.role !== requiredRole) {
      router.push('/unauthorized')
    }
  }, [isAuthenticated, user, requiredRole, router])

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
```

Usage:
```tsx
<AuthGuard requiredRole="admin">
  <AdminContent />
</AuthGuard>
```

### Custom Redirect Logic

Modify `middleware.ts` to add custom redirect logic:

```typescript
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  const { pathname } = request.nextUrl
  
  // Custom logic for specific routes
  if (pathname.startsWith('/super-admin')) {
    const userRole = request.cookies.get('user-role')
    if (userRole?.value !== 'super-admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  // ... rest of middleware
}
```

### Custom Loading UI

Pass custom fallback to AuthGuard:

```tsx
<AuthGuard 
  fallback={
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p>Verifying your credentials...</p>
      </div>
    </div>
  }
>
  <ProtectedContent />
</AuthGuard>
```

## Troubleshooting

### Issue: Infinite Redirect Loop

**Cause:** Middleware and AuthGuard both redirecting  
**Solution:** Ensure middleware excludes `/login` from protection

```typescript
if (pathname === '/login' && token) {
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

### Issue: Protected Content Flashes Before Redirect

**Cause:** Client-side check is slower than render  
**Solution:** AuthGuard returns loading state immediately

```tsx
if (!isAuthenticated) {
  return <LoadingSpinner />
}
```

### Issue: Redirect Parameter Not Working

**Cause:** Query parameter not being read  
**Solution:** Check `useLogin` hook reads `redirect` param

```typescript
const params = new URLSearchParams(window.location.search)
const redirect = params.get('redirect')
router.push(redirect || "/dashboard")
```

### Issue: User Stays Logged In After Cookie Expires

**Cause:** Zustand state persists in localStorage  
**Solution:** Clear localStorage on logout

```typescript
logout: () => {
  localStorage.removeItem('auth-storage')
  set({ user: null, token: null, isAuthenticated: false })
}
```

## Best Practices

1. **Always use both layers** - Middleware + AuthGuard for maximum security
2. **Clear sensitive data** - Remove tokens and user data on logout
3. **Preserve return URLs** - Better user experience with redirect params
4. **Show loading states** - Prevent content flash during auth checks
5. **Test all scenarios** - Authenticated, unauthenticated, expired tokens
6. **Use HTTP-only cookies** - Prevent XSS attacks on tokens
7. **Validate on server** - Never trust client-side validation alone

## Next Steps

1. **Add token refresh** - Implement automatic token renewal
2. **Add session timeout** - Logout after inactivity period
3. **Add remember me** - Extend cookie expiration
4. **Add role-based access** - Different permissions per user
5. **Add 2FA support** - Two-factor authentication
6. **Add audit logging** - Track login/logout events
7. **Add rate limiting** - Prevent brute force attacks

## Resources

- [Next.js Middleware Docs](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [React Query Auth Guide](https://tanstack.com/query/latest/docs/framework/react/guides/auth)
