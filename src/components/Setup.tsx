import { Sparkles, ArrowRight } from 'lucide-react'

interface SetupProps {
  onEnterDemo?: () => void
}

export default function Setup({ onEnterDemo }: SetupProps) {
  return (
    <main className="page setup">
      <div className="masthead-top">
        <span className="brand">
          Catalyst<span className="brand-dot">.</span>
        </span>
        <span className="sync">
          <span className="sync-dot" />
          Setup Guide
        </span>
      </div>
      <div className="setup-card rise">
        <div className="setup-inner">
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 font-medium">
            <Sparkles size={13} className="text-emerald-600" />
            <span>PWA OS Suite Ready</span>
          </div>

          <h1>Connect your Firebase project</h1>
          <p className="setup-lede">
            Catalyst is ready — you can explore immediately in Demo Mode, or connect your Firebase
            project to sync your account in real-time across devices:
          </p>

          {onEnterDemo && (
            <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-200/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">
                    Instant Demo Mode (Local Storage)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Explore the OS Home Screen, Tally notes, live weather, and wallpapers right now.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onEnterDemo}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition whitespace-nowrap cursor-pointer"
                >
                  <span>Launch Demo Mode</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          <ol className="setup-steps">
            <li>
              <span className="step-num">1</span>
              <div>
                <strong>Create a Firebase project and register a web app</strong>
                <p>
                  Open{' '}
                  <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer">
                    console.firebase.google.com
                  </a>
                  , add a project, then <em>Project settings → Your apps → Web</em>. Copy the config
                  values into <code>.env</code>.
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div>
                <strong>Create the Firestore database and enable Google sign-in</strong>
                <p>
                  <em>Build → Firestore Database → Create database</em>, then{' '}
                  <em>Build → Authentication → Sign-in method → Google → Enable</em>.
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div>
                <strong>Publish the security rules</strong>
                <p>
                  Paste the rules from the README into <em>Firestore → Rules</em>.
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">4</span>
              <div>
                <strong>Restart the dev server</strong>
                <p>
                  Stop and restart <code>npm run dev</code> after editing <code>.env</code>.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </main>
  )
}
