import { ref } from 'vue'
import { getFirebase } from '../config/firebase'

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '/api'

const user = ref(null)
const loading = ref(true)
const error = ref(null)
const allowlistDenied = ref(false)

let initialized = false

// Mock user for demo mode
const DEMO_USER = {
  uid: 'demo-user',
  email: 'demo@example.com',
  displayName: 'Demo User',
  getIdToken: async () => 'demo-token'
}

export function useAuth() {
  // Initialize auth state
  if (!initialized) {
    initialized = true

    if (DEMO_MODE) {
      // In demo mode, immediately set mock user
      user.value = DEMO_USER
      loading.value = false
    } else {
      // Load Firebase and set up auth listener
      initFirebaseAuth()
    }
  }

  async function initFirebaseAuth() {
    try {
      const firebase = await getFirebase()
      if (!firebase) {
        // Firebase not available (shouldn't happen if not demo mode)
        loading.value = false
        return
      }

      const { auth } = firebase
      const { onAuthStateChanged, signOut: firebaseSignOut } = await import('firebase/auth')

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Check if email is from redhat.com domain
          if (!firebaseUser.email.endsWith('@redhat.com')) {
            error.value = 'Access denied. Only @redhat.com email addresses are allowed.'
            await firebaseSignOut(auth)
            user.value = null
            loading.value = false
            return
          }

          // Valid domain — check allowlist
          user.value = firebaseUser
          error.value = null

          try {
            const token = await firebaseUser.getIdToken()
            const res = await fetch(`${API_ENDPOINT}/allowlist`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.status === 403) {
              allowlistDenied.value = true
            } else {
              allowlistDenied.value = false
            }
          } catch {
            // Network error in dev — don't block if server isn't running
            allowlistDenied.value = false
          }
        } else {
          user.value = null
          allowlistDenied.value = false
        }

        loading.value = false
      })
    } catch (err) {
      console.error('Firebase init error:', err)
      error.value = 'Failed to initialize authentication'
      loading.value = false
    }
  }

  const signIn = async () => {
    if (DEMO_MODE) {
      // In demo mode, just ensure mock user is set
      user.value = DEMO_USER
      return
    }

    try {
      error.value = null
      loading.value = true
      const firebase = await getFirebase()
      if (!firebase) return

      const { auth, googleProvider } = firebase
      const { signInWithPopup } = await import('firebase/auth')
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Sign-in error:', err)
      if (err.code === 'auth/popup-closed-by-user') {
        error.value = 'Sign-in cancelled. Please try again.'
      } else if (err.code === 'auth/popup-blocked') {
        error.value = 'Pop-up blocked by browser. Please allow pop-ups and try again.'
      } else {
        error.value = `Sign-in failed: ${err.message}`
      }
      loading.value = false
    }
  }

  const signOut = async () => {
    if (DEMO_MODE) {
      // In demo mode, signing out is a no-op (or could clear mock user)
      return
    }

    try {
      error.value = null
      const firebase = await getFirebase()
      if (!firebase) return

      const { auth } = firebase
      const { signOut: firebaseSignOut } = await import('firebase/auth')
      await firebaseSignOut(auth)
    } catch (err) {
      console.error('Sign-out error:', err)
      error.value = `Sign-out failed: ${err.message}`
    }
  }

  const getIdToken = async () => {
    if (DEMO_MODE) {
      return 'demo-token'
    }

    if (!user.value) {
      throw new Error('No user signed in')
    }

    try {
      const token = await user.value.getIdToken()
      return token
    } catch (err) {
      console.error('Failed to get ID token:', err)
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    allowlistDenied,
    signIn,
    signOut,
    getIdToken
  }
}
