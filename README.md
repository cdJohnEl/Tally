# Tally.

> Task 1 — HNG Internship 15

A daily task sheet with realtime cloud sync. Tasks are stored in **Firebase Firestore** — add, edit, complete, filter, and clear them, and every change appears instantly on any device signed in.

## Stack

- Vite + React 19 + TypeScript
- Firebase Firestore (realtime) + Anonymous Authentication
- Hand-written CSS design system — no UI framework

## Run it

```bash
npm install
npm run dev
```

The app needs a Firebase project to talk to. On first launch it shows a setup guide; to connect one:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) and register a web app (**Project settings → Your apps → Web**).
2. **Build → Firestore Database → Create database** (any region, production mode).
3. Copy the web config values into `.env`:

   ```bash
   cp .env.example .env
   ```

4. Publish the security rules below (**Firestore → Rules**), then restart `npm run dev`.

## Security rules

The app runs without authentication by design — every device shares one task list. Paste this into Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{todoId} {
      allow read, write: if true;
    }
  }
}
```

> **Heads-up:** these rules make the database publicly readable and writable — fine for a demo or coursework, not for real user data. To lock it down later, enable Anonymous sign-in under **Authentication → Sign-in method**, move documents under `users/{uid}/todos`, and swap the rule for `allow read, write: if request.auth != null && request.auth.uid == uid;`.

## Features

- Add tasks with optional priority (high / med / low) and due date
- One-tap complete with an animated marker strike-through
- Inline editing (pencil icon or double-click the title; Enter saves, Esc cancels)
- Filters: All / Active / Done, plus "Clear done"
- Realtime sync via `onSnapshot` with latency-compensated writes — works offline and catches up when the connection returns
- Overdue detection ("Yesterday" and past dates turn red)
- Today's progress rendered as hand-drawn tally marks in the header
- Keyboard friendly: visible focus rings, radio-group priority pills, `aria-live` status
- Respects `prefers-reduced-motion`
- No auth required — one shared list, ready to demo

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build |

## Project layout

```
src/
  lib/firebase.ts   Firebase init from .env
  lib/todos.ts      useTodos hook — realtime subscription + CRUD
  lib/dates.ts      due-date helpers
  components/       Masthead (tally marks), Composer, TodoList/Item, Footer, Setup
  index.css         design tokens + all styles
scripts/
  firebase-smoke.mjs  end-to-end check: write → read → delete against Firestore
```

## Verify your setup

```bash
node scripts/firebase-smoke.mjs
```

Writes a throwaway task, reads it back, deletes it — if this passes, the app will work.
