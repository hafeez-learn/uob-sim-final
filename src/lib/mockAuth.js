// Mock Firebase auth — used when VITE_FIREBASE_API_KEY='demo' or VITE_MOCK_USER=true
// This prevents any real Firebase SDK from loading or making network calls

export const mockUser = {
  uid: 'test-uid',
  email: 'demo@uob.com',
  displayName: 'Hafeez Demo',
  phoneNumber: '+65 9123 4567',
  photoURL: null,
}

let _user = { ...mockUser }
let _listeners = []

export const mockAuth = {
  currentUser: _user,
  onAuthStateChanged: (callback) => {
    // Immediately call with mock user (simulates already-logged-in state)
    callback(_user)
    _listeners.push(callback)
    return () => { _listeners = _listeners.filter(l => l !== callback) }
  },
}

export const triggerAuthChange = (user) => {
  _user = user
  _listeners.forEach(cb => cb(user))
}

export const mockSignInWithEmailAndPassword = () => Promise.resolve({ user: mockUser })
export const mockCreateUserWithEmailAndPassword = () => Promise.resolve({ user: mockUser })
export const mockSignOut = () => {
  _user = null
  triggerAuthChange(null)
  return Promise.resolve()
}