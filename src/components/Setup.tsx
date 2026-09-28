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
            The app is ready — it just needs to know which Firestore database to write to.
            Three steps, about two minutes:
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
                <strong>Create the Firestore database</strong>
                <p>
                  In the console: <em>Build → Firestore Database → Create database</em> (any
                  region, production mode).
                </p>
              </div>
            </li>
            <li>
              <span className="step-num">3</span>
              <div>
                <strong>Publish the security rules, then restart</strong>
                <p>
                  Paste the rules from the README into <em>Firestore → Rules</em> and publish,
                  then restart the dev server.
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
