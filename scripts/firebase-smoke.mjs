import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
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

try {
  const ref = await addDoc(collection(db, 'todos'), {
    title: '__smoke_test__',
    done: false,
    priority: null,
    due: null,
    createdAt: new Date(),
  })
  console.log('1/3 write OK   doc :', ref.id)

  const snap = await getDocs(
    query(collection(db, 'todos'), where('title', '==', '__smoke_test__')),
  )
  console.log('2/3 read OK    docs:', snap.size)

  await deleteDoc(doc(db, 'todos', ref.id))
  console.log('3/3 delete OK')
  console.log('ALL GREEN — Firestore is reachable and the rules allow read/write.')
} catch (err) {
  console.error('FAIL firestore:', err.code ?? err.message)
  console.error('→ If this is permission-denied, publish the rules from the README (Firestore → Rules), then re-run.')
  process.exitCode = 1
}
