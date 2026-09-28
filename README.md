# Tally.

> Task 1 — HNG Internship 15

A daily task sheet with realtime cloud sync. Tasks are stored in **Firebase Firestore** — sign in with Google, and every task belongs to your account: add, edit, complete, filter, and clear them, with every change appearing instantly on any device you're signed in on.

## Stack

- Vite + React 19 + TypeScript
- Firebase Firestore (realtime) + Google Authentication
- Hand-written CSS design system — no UI framework

## Run it

```bash
npm install
npm run dev
```

The app needs a Firebase project to talk to. On first launch it shows a setup guide; to connect one:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) and register a web app (**Project settings → Your apps → Web**).
2. **Build → Firestore Database → Create database** (any region, production mode), then **Build → Authentication → Sign-in method → Google → Enable**.
3. Copy the web config values into `.env`:

   ```bash
   cp .env.example .env
   ```

4. Publish the security rules below (**Firestore → Rules**), then restart `npm run dev`.

## Security rules

Every account gets its own private task list under `users/{uid}/todos`. Paste this into Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

These rules lock the database down completely for anyone who isn't signed in, and give each signed-in user access to their own documents only — no user can read or write another user's tasks.

## Features

- Add tasks with optional priority (high / med / low) and due date
- One-tap complete with an animated marker strike-through
- Inline editing (pencil icon or double-click the title; Enter saves, Esc cancels)
- Filters: All / Active / Done, plus "Clear done"
- Realtime sync via `onSnapshot` with latency-compensated writes — works offline and catches up when the connection returns
- Google sign-in: every account gets a private task page, synced across devices, with a time-of-day greeting
- Overdue detection ("Yesterday" and past dates turn red)
- Today's progress rendered as hand-drawn tally marks in the header, plus a daily rotating quote
- Keyboard friendly: visible focus rings, radio-group priority pills, `aria-live` status
- Respects `prefers-reduced-motion`

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build |

## Project layout

```
src/
  lib/firebase.ts   Firebase init from .env + Google sign-in
  lib/todos.ts      useTodos hook — realtime subscription + CRUD under users/{uid}/todos
  lib/dates.ts      due-date helpers
  components/       Masthead (greeting, tally marks), Composer, TodoList/Item, Footer, SignIn, Setup
  index.css         design tokens + all styles
scripts/
  firebase-smoke.mjs  rules check: verifies unauthenticated writes are rejected
```

## Verify your setup

```bash
node scripts/firebase-smoke.mjs
```

Probes Firestore the way a stranger would — if the write is rejected with `permission-denied`, your rules are locked down correctly and the app is safe to demo.
