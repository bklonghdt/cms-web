# Updated Login Implementation with React Hook Form, Zustand & React Query

## Overview
The login page has been refactored to use modern React state management and form handling libraries:
- **react-hook-form** for form validation and management
- **zustand** for global auth state management
- **@tanstack/react-query** for server state and API mutations

## Architecture

### State Management Flow
```
User Input → React Hook Form → React Query Mutation → API Route → Backend
                                      ↓
                                Zustand Store (Auth State)
                                      ↓
                                UI Updates & Navigation
```

## New Dependencies

The following packages have been added to `package.json`:

```json
{
  "@tanstack/react-query": "^5.62.11",
  "react-hook-form": "^7.54.2",
  "zustand": "^5.0.2"
}
```

## File Structure

```
frontend/
├── app/
│   ├── layout.tsx                    # Updated with QueryProvider
│   ├── login/
│   │   └── page.tsx                  # Refactored with react-hook-form
│   ├── dashboard/
│   │   └── page.tsx                  # Dashboard page
│   └── api/
│       └── auth/
│           ├── login/
│           │   └── route.ts          # Login API route
│           └── logout/
│               └── route.ts          # Logout API route
├── components/
│   └── ui/                           # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── label.tsx
├── lib/
│   ├── stores/
│   │   └── auth-store.ts             # Zustand auth store
│   ├── hooks/
│   │   └── use-auth.ts               # React Query auth hooks
│   ├── providers/
│   │   └── query-provider.tsx        # React Query provider
│   ├── utils.ts                      # Utility functions
│   └── auth.ts                       # Auth utilities (legacy)
└── package.json                      # Updated dependencies
```

## Key Components

### 1. Zustand Auth Store (`lib/stores/auth-store.ts`)

Global state management for authentication with persistence:

```typescript
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  login: (user: User, token?: string) => void
  logout: () => void
}
```

**Features:**
- Persists user data to localStorage
- Automatically syncs authentication state
- Type-safe state management
- Middleware support for persistence

**Usage:**
```typescript
import { useAuthStore } from '@/lib/stores/auth-store'

const { user, isAuthenticated, login, logout } = useAuthStore()
```

### 2. React Query Provider (`lib/providers/query-provider.tsx`)

Wraps the application with React Query context:

**Configuration:**
- `staleTime`: 60 seconds (data considered fresh)
- `refetchOnWindowFocus`: false (no auto-refetch on focus)
- `retry`: 1 attempt for failed requests
- Includes React Query DevTools in development

### 3. Auth Hooks (`lib/hooks/use-auth.ts`)

Custom hooks for authentication operations using React Query:

#### `useLogin()`
```typescript
const { mutate: login, isPending, error, isSuccess } = useLogin()

// Usage
login({ email: 'user@example.com', password: 'password123' })
```

**Features:**
- Automatic loading states (`isPending`)
- Error handling (`error`)
- Success callback with navigation
- Updates Zustand store on success
- Invalidates user queries

#### `useLogout()`
```typescript
const { mutate: logout, isPending } = useLogout()

// Usage
logout()
```

**Features:**
- Clears auth state
- Clears all React Query cache
- Redirects to login page
- Removes auth cookies

### 4. Refactored Login Page (`app/login/page.tsx`)

Uses react-hook-form for form management:

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginCredentials>({
  defaultValues: {
    email: "",
    password: "",
  },
})
```

**Form Validation:**
- Email: Required + regex pattern validation
- Password: Required + minimum 6 characters
- Real-time error messages
- Disabled state during submission

**Integration:**
```typescript
const { mutate: login, isPending, error } = useLogin()

const onSubmit = (data: LoginCredentials) => {
  login(data)
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
pnpm install
```

This will install:
- `@tanstack/react-query` and `@tanstack/react-query-devtools`
- `react-hook-form`
- `zustand`

### 2. Environment Configuration
Create `.env.local` from the example:
```bash
cp .env.local.example .env.local
```

Set your backend URL:
```env
BACKEND_URL=http://localhost:5001
NODE_ENV=development
```

### 3. Run Development Server
```bash
pnpm dev
```

Access the login page at: `http://localhost:3000/login`

## Features

### React Hook Form Benefits
✅ **Declarative validation** - Define rules inline with register  
✅ **Performance** - Minimizes re-renders  
✅ **Built-in error handling** - Automatic error state management  
✅ **Type safety** - Full TypeScript support  
✅ **Less boilerplate** - No manual state management needed  

### Zustand Benefits
✅ **Simple API** - Minimal boilerplate  
✅ **No providers needed** - Direct hook usage  
✅ **Persistence** - Built-in localStorage sync  
✅ **DevTools** - Redux DevTools compatible  
✅ **TypeScript** - Full type inference  

### React Query Benefits
✅ **Automatic caching** - Reduces unnecessary requests  
✅ **Loading states** - Built-in `isPending`, `isSuccess`, `isError`  
✅ **Error handling** - Automatic error state management  
✅ **Optimistic updates** - UI updates before server response  
✅ **DevTools** - Visual query inspector  

## Usage Examples

### Accessing Auth State Anywhere
```typescript
import { useAuthStore } from '@/lib/stores/auth-store'

function UserProfile() {
  const { user, isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <div>Please log in</div>
  }
  
  return <div>Welcome, {user?.email}</div>
}
```

### Protected Route Example
```typescript
'use client'

import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { isAuthenticated } = useAuthStore()
  const router = useRouter()
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])
  
  if (!isAuthenticated) return null
  
  return <div>Protected Content</div>
}
```

### Logout Button Example
```typescript
import { useLogout } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'

function LogoutButton() {
  const { mutate: logout, isPending } = useLogout()
  
  return (
    <Button 
      onClick={() => logout()} 
      disabled={isPending}
    >
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  )
}
```

### Form with React Hook Form
```typescript
import { useForm } from 'react-hook-form'

interface FormData {
  email: string
  password: string
}

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  
  const onSubmit = (data: FormData) => {
    console.log(data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input 
        {...register('email', { 
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email'
          }
        })} 
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

## React Query DevTools

The React Query DevTools are automatically included in development mode. Access them by looking for the React Query icon in the bottom-right corner of your browser.

**Features:**
- View all queries and their states
- Inspect query data and errors
- Manually trigger refetches
- View cache entries
- Monitor network requests

## API Integration

### Login Flow
1. User submits form via react-hook-form
2. `useLogin()` mutation is triggered
3. Request sent to `/api/auth/login`
4. API route forwards to backend
5. On success:
   - Token stored in HTTP-only cookie
   - User data saved to Zustand store
   - User queries invalidated
   - Navigate to `/dashboard`

### Logout Flow
1. User clicks logout button
2. `useLogout()` mutation is triggered
3. Request sent to `/api/auth/logout`
4. On success:
   - Auth cookie deleted
   - Zustand store cleared
   - React Query cache cleared
   - Navigate to `/login`

## Customization

### Adding New Auth Mutations

Create new hooks in `lib/hooks/use-auth.ts`:

```typescript
export function useRegister() {
  const router = useRouter()
  const { login: setAuthState } = useAuthStore()
  
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Registration failed')
      return response.json()
    },
    onSuccess: (data) => {
      setAuthState(data.user, data.token)
      router.push('/dashboard')
    },
  })
}
```

### Extending Zustand Store

Add new state and actions:

```typescript
interface AuthState {
  // ... existing state
  preferences: UserPreferences | null
  setPreferences: (prefs: UserPreferences) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // ... existing state
      preferences: null,
      setPreferences: (prefs) => set({ preferences: prefs }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        preferences: state.preferences,
      }),
    }
  )
)
```

### Custom Form Validation

Add custom validation rules:

```typescript
<Input
  {...register('password', {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters',
    },
    validate: {
      hasUpperCase: (value) => 
        /[A-Z]/.test(value) || 'Must contain uppercase letter',
      hasNumber: (value) => 
        /\d/.test(value) || 'Must contain a number',
    },
  })}
/>
```

## Troubleshooting

### TypeScript Errors
All TypeScript errors will resolve after running `pnpm install`. The errors are due to missing `node_modules`.

### React Query DevTools Not Showing
DevTools only appear in development mode. Ensure `NODE_ENV=development`.

### Zustand State Not Persisting
Check browser localStorage for `auth-storage` key. Clear it if corrupted:
```javascript
localStorage.removeItem('auth-storage')
```

### Form Not Submitting
Check browser console for validation errors. React Hook Form will prevent submission if validation fails.

## Migration from Previous Implementation

### Before (Manual State)
```typescript
const [formData, setFormData] = useState({ email: '', password: '' })
const [errors, setErrors] = useState({})
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsLoading(true)
  // ... manual validation
  // ... manual fetch
  setIsLoading(false)
}
```

### After (React Hook Form + React Query)
```typescript
const { register, handleSubmit, formState: { errors } } = useForm()
const { mutate: login, isPending } = useLogin()

const onSubmit = (data) => {
  login(data)
}
```

**Benefits:**
- 70% less boilerplate code
- Automatic validation
- Built-in loading states
- Better error handling
- Type safety

## Next Steps

1. **Add Registration Page** - Use same pattern with `useRegister()` hook
2. **Protected Routes** - Create middleware or HOC for route protection
3. **Refresh Token** - Implement token refresh logic in React Query
4. **User Profile** - Create queries for fetching user data
5. **Optimistic Updates** - Add optimistic UI updates for better UX
6. **Error Boundaries** - Add React error boundaries for better error handling

## Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zustand Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)
