export default function Setup() {
  return (
    <main className="page setup">
      <div className="masthead-top">
        <span className="brand">
          Tally<span className="brand-dot">.</span>
        </span>
      </div>
      <div className="setup-card rise">
        <div className="setup-inner">
          <h1>Connect your Firebase project</h1>
          <p className="setup-lede">
            The app is ready — it just needs to know which Firebase project to use.
            Four steps, about three minutes:
          </p>
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
                  , add a project (Analytics is optional), then{' '}
                  <em>Project settings → Your apps → Web</em>. Copy the config values into{' '}
                  <code>.env</code> — start from <code>.env.example</code> in the project root.
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">2</span>
              <div>
                <strong>Create the Firestore database and enable Google sign-in</strong>
                <p>
                  <em>Build → Firestore Database → Create database</em> (any region), then{' '}
                  <em>Build → Authentication → Sign-in method → Google → Enable</em>.
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div>
                <strong>Publish the security rules</strong>
                <p>
                  Paste the rules from the README into <em>Firestore → Rules</em>. They keep
                  every signed-in account's tasks private to that account.
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">4</span>
              <div>
                <strong>Restart the dev server</strong>
                <p>
                  Env vars are read at startup — stop <code>npm run dev</code> and start it
                  again after editing <code>.env</code>.
                </p>
              </div>
            </li>
          </ol>
          <p className="setup-note">
            Env vars are read at startup — after editing .env, stop and re-run
            <br />
            npm run dev
          </p>
        </div>
      </div>
    </main>
  )
}
