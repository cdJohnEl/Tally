import { useState } from 'react'
import { Download, Smartphone, X } from 'lucide-react'
import { usePWAInstall } from '../lib/usePWAInstall'

export default function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall()
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  // If already running as an installed PWA, hide button
  if (isInstalled) {
    return null
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="catalyst-install-pill"
        title="Install Catalyst as native PWA"
      >
        <Download size={13} />
        <span>Install PWA</span>
      </button>
    )
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="catalyst-install-pill"
          title="Install on iOS Safari"
        >
          <Smartphone size={13} />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="catalyst-modal-backdrop" onClick={() => setShowIOSGuide(false)}>
            <div
              className="catalyst-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-white">Install Catalyst on iOS</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-slate-300 space-y-2">
                1. Tap the <strong>Share</strong> button (square with arrow up) in Safari.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. Open Catalyst from your home screen for full standalone experience!
              </p>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return null
}
