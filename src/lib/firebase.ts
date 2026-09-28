import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    (projectId ? `${projectId}.firebaseapp.com` : undefined),
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseReady = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

function getFirebase(): { auth: Auth; db: Firestore } {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
  }
  return { auth: auth!, db: db! }
}

export type AuthState =
  | { status: 'connecting' }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: User }

export function watchAuth(onChange: (state: AuthState) => void): () => void {
  const { auth } = getFirebase()
  return onAuthStateChanged(
    auth,
    (user) => {
      onChange(user ? { status: 'signed-in', user } : { status: 'signed-out' })
    },
    () => {
      onChange({ status: 'signed-out' })
    },
  )
}

export async function signInWithGoogle(): Promise<void> {
  const { auth } = getFirebase()
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  await signInWithPopup(auth, provider)
}

export async function signOutUser(): Promise<void> {
  const { auth } = getFirebase()
  await signOut(auth)
}

export function firestore(): Firestore {
  return getFirebase().db
}
