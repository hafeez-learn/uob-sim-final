import { createContext, useContext, useEffect, useState } from 'react'
import { mockAuth, mockUser, mockSignInWithEmailAndPassword, mockCreateUserWithEmailAndPassword, mockSignOut } from '../lib/mockAuth'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

// Demo when VITE_MOCK_USER is set OR when Firebase key is absent/demo/placeholder
const DEMO_MODE =
  import.meta.env.VITE_MOCK_USER === 'true' ||
  !import.meta.env.VITE_FIREBASE_API_KEY ||
  import.meta.env.VITE_FIREBASE_API_KEY === 'demo' ||
  import.meta.env.VITE_FIREBASE_API_KEY === '***'

const _initialUser = DEMO_MODE ? mockUser : null

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(_initialUser)
  const [loading, setLoading] = useState(DEMO_MODE ? false : true)

  useEffect(() => {
    if (DEMO_MODE) return // user already set synchronously — no Firebase SDK needed

    // Real Firebase auth — wrapped to never crash
    let mounted = true
    let timer = setTimeout(() => {
      if (mounted) { setUser(null); setLoading(false) }
    }, 10000)

    import('firebase/auth').then(({ onAuthStateChanged }) => {
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