import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  company_name?: string
  subscription_status?: string
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  isGuest: boolean
  setIsGuest: (isGuest: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      isGuest: false,
      setIsGuest: (isGuest) => set({ isGuest }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface OnboardingState {
  completed: boolean
  setCompleted: (completed: boolean) => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      setCompleted: (completed) => set({ completed }),
    }),
    {
      name: 'onboarding-storage',
    }
  )
)

interface DocumentState {
  currentDocument: any | null
  setCurrentDocument: (doc: any | null) => void
  clearCurrentDocument: () => void
}

export const useDocumentStore = create<DocumentState>()((set) => ({
  currentDocument: null,
  setCurrentDocument: (doc) => set({ currentDocument: doc }),
  clearCurrentDocument: () => set({ currentDocument: null }),
}))
