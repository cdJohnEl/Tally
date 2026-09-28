import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  collection,
  addDoc,
} from 'firebase/firestore'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    }),
)

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

if (!config.apiKey || !config.projectId || !config.appId) {
  console.error('FAIL: config incomplete — fill in .env first')
  process.exit(1)
}

const app = initializeApp(config)
const db = initializeFirestore(app, { experimentalForceLongPolling: true })

console.log('Probing rules: attempting an unauthenticated write to users/x/todos…')
try {
  await addDoc(collection(db, 'users', 'smoke-probe', 'todos'), {
    title: '__smoke_test__',
    done: false,
  })
  console.log('⚠️  WRITE SUCCEEDED without auth — rules are still open.')
  console.log('   Publish the per-user rules from the README so accounts stay private.')
  process.exitCode = 1
} catch (err) {
  const code = err?.code ?? String(err)
  if (String(code).includes('permission-denied')) {
    console.log('OK — unauthenticated writes are rejected. Rules are locked down correctly.')
  } else {
    console.error('Unexpected error:', code)
    console.error('→ Check that Firestore is enabled and the rules from the README are published.')
    process.exitCode = 1
  }
}
