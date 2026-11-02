import React, { useState } from 'react'
import type { WalletState } from '../lib/pocketLensTypes'

interface WalletModalProps {
  wallet: WalletState
  onClose: () => void
  onSave: (wallet: WalletState) => void
}

export default function WalletModal({ wallet, onClose, onSave }: WalletModalProps) {
  const [balance, setBalance] = useState(wallet.balance.toString())
  const [walletName, setWalletName] = useState(wallet.walletName || 'Spending Wallet')
  const [monthlyBudget, setMonthlyBudget] = useState(
    wallet.monthlyBudget ? wallet.monthlyBudget.toString() : '500',
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numBalance = parseFloat(balance)
    const numBudget = parseFloat(monthlyBudget)
    if (isNaN(numBalance)) return

    onSave({
      walletName: walletName.trim() || 'Spending Wallet',
      balance: numBalance,
      currencySymbol: wallet.currencySymbol || '$',
      monthlyBudget: !isNaN(numBudget) && numBudget > 0 ? numBudget : 500,
    })
    onClose()
  }

  return (
    <div className="pl-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pl-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="pl-modal-handle" />
        <div className="pl-modal-header">
          <div className="pl-modal-title">Edit Spending Wallet</div>
          <button
            type="button"
            className="pl-icon-btn-subtle"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pl-modal-form">
          <div className="pl-form-group">
            <label className="pl-form-label">Wallet Name</label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="pl-text-input"
              required
            />
          </div>

          <div className="pl-form-group">
            <label className="pl-form-label">Current Balance ($)</label>
            <div className="pl-amount-input-box">
              <span className="pl-amount-prefix">$</span>
              <input
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="pl-amount-input"
                required
              />
            </div>
          </div>

          <div className="pl-form-group">
            <label className="pl-form-label">Monthly Target Budget ($)</label>
            <input
              type="number"
              step="10"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="pl-text-input"
            />
            <div className="pl-form-help">
              Used to calculate percentage spend indicators.
            </div>
          </div>

          <div className="pl-modal-actions">
            <button type="button" className="pl-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pl-btn-primary">
              Update Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
