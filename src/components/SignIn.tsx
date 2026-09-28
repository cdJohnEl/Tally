import { useState } from 'react'
import { signInWithGoogle } from '../lib/firebase'

function friendlyAuthError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : ''
  if (code.includes('popup-closed') || code.includes('cancelled-popup-request'))
    return 'Sign-in window closed before finishing. Try again.'
  if (code.includes('popup-blocked'))
    return 'Your browser blocked the sign-in window. Allow popups for this site, then try again.'
  if (code.includes('operation-not-allowed') || code.includes('configuration-not-found'))
    return 'Google sign-in is not enabled for this project yet. Turn it on under Authentication → Sign-in method.'
  if (code.includes('unauthorized-domain'))
    return 'This domain is not authorized in the Firebase project. Add it under Authentication → Settings → Authorized domains.'
  if (code.includes('network'))
    return 'Network trouble reaching Google. Check your connection and try again.'
  return 'Sign-in failed. Try again in a moment.'
}

function GoogleLogo() {
  return (
    <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

export default function SignIn() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignIn() {
    setBusy(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page setup">
      <div className="masthead-top">
        <span className="brand">
          Tally<span className="brand-dot">.</span>
        </span>
      </div>
      <div className="setup-card rise">
        <div className="setup-inner">
          <h1>Your page, your tasks.</h1>
          <p className="setup-lede">
            Sign in with Google and your task list stays private to your account — the same
            page follows you to every device you sign in from.
          </p>
          <button type="button" className="google-btn" onClick={handleSignIn} disabled={busy}>
            <GoogleLogo />
            {busy ? 'Connecting…' : 'Continue with Google'}
          </button>
          {error && (
            <p className="setup-error" role="alert">
              {error}
            </p>
          )}
          <p className="signin-note">First time here? Signing in creates your private page.</p>
        </div>
      </div>
    </main>
  )
}
