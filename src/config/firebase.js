/**
 * Firebase configuration - lazy loaded to support demo mode.
 * In demo mode, Firebase is never imported.
 */

let firebaseApp = null
let firebaseAuth = null
let firebaseGoogleProvider = null

/**
 * Lazily initialize Firebase and return auth + provider.
 * Returns null in demo mode.
 */
export async function getFirebase() {
  // In demo mode, don't load Firebase at all
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    return null
  }

  if (!firebaseApp) {
    const { initializeApp } = await import('firebase/app')
    const { getAuth, GoogleAuthProvider } = await import('firebase/auth')

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
    }

    firebaseApp = initializeApp(firebaseConfig, 'team-tracker')
    firebaseAuth = getAuth(firebaseApp)
    firebaseGoogleProvider = new GoogleAuthProvider()

    // Force account selection on sign-in
    firebaseGoogleProvider.setCustomParameters({
      prompt: 'select_account'
    })
  }

  return {
    auth: firebaseAuth,
    googleProvider: firebaseGoogleProvider
  }
}
