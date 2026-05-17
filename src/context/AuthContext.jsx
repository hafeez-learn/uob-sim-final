import { createContext, useContext, useEffect, useState } from 'react'
import { mockAuth, mockUser, mockSignInWithEmailAndPassword, mockCreateUserWithEmailAndPassword, mockSignOut } from '../lib/mockAuth'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

// Demo mode: resolve synchronously so ProtectedRoute can read user immediately
const DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'demo' ||
  import.meta.env.VITE_MOCK_USER === 'true'

const _initialUser = DEMO_MODE ? mockUser : null

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(_initialUser)
  const [loading, setLoading] = useState(DEMO_MODE ? false : true)

  useEffect(() => {
    if (DEMO_MODE) return // user already set synchronously — no Firebase needed

    // Real Firebase auth — wrapped to never crash
    let mounted = true
    let timer = setTimeout(() => {
      if (mounted) { setUser(null); setLoading(false) }
    }, 10000)

    import('firebase/auth').then(({ onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut }) => {
      import('../lib/firebase').then(({ auth }) => {
        if (!mounted) return
        unsubscribe = onAuthStateChanged(
          auth,
          (firebaseUser) => {
            if (mounted) {
              clearTimeout(timer)
              setUser(firebaseUser)
              setLoading(false)
            }
          },
          () => { if (mounted) { clearTimeout(timer); setUser(null); setLoading(false) } }
        )
      })
    }).catch(() => {
      if (mounted) { clearTimeout(timer); setUser(null); setLoading(false) }
    })

    let unsubscribe = () => {}
    return () => { mounted = false; clearTimeout(timer); unsubscribe() }
  }, [])

  const login = (email, password) => mockSignInWithEmailAndPassword(email, password)
  const signup = (email, password) => mockCreateUserWithEmailAndPassword(email, password)
  const logout = () => mockSignOut()

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}