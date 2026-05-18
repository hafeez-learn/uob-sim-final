import { createContext, useContext, useEffect, useState } from 'react'
import { initFirebase, isDemoMode } from '../lib/firebase'
import {
  mockUser,
  mockSignInWithEmailAndPassword,
  mockCreateUserWithEmailAndPassword,
  mockSignOut
} from '../lib/mockAuth'

const AuthContext = createContext({})
export const useAuth = () => useContext(AuthContext)

const _initialUser = isDemoMode ? mockUser : null

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(_initialUser)
  const [loading, setLoading] = useState(isDemoMode ? false : true)

  useEffect(() => {
    if (isDemoMode) return

    let mounted = true
    let timer = setTimeout(() => {
      if (mounted) { setUser(null); setLoading(false) }
    }, 10000)

    const init = async () => {
      try {
        const [{ onAuthStateChanged }, firebase] = await Promise.all([
          import('firebase/auth'),
          initFirebase(),
        ])
        if (!mounted) return
        const { auth } = firebase
        if (!auth) { setLoading(false); return }
        const unsubscribe = onAuthStateChanged(
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
        return unsubscribe
      } catch {
        if (mounted) { clearTimeout(timer); setUser(null); setLoading(false) }
      }
    }

    let unsubscribe = () => {}
    init().then(fn => { if (fn) unsubscribe = fn })
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