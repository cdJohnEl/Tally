import { useState } from 'react'
import {
  User,
  DollarSign,
  Download,
  RotateCcw,
  Sparkles,
  Shield,
  Check,
} from 'lucide-react'
import type { WalletState, Transaction } from '../lib/pocketLensTypes'

interface AccountTabProps {
  wallet: WalletState
  transactions: Transaction[]
  onUpdateWallet: (updates: Partial<WalletState>) => void
  onResetDemoData: () => void
}

export default function AccountTab({
  wallet,
  transactions,
  onUpdateWallet,
  onResetDemoData,
}: AccountTabProps) {
  const [budgetVal, setBudgetVal] = useState(String(wallet.monthlyBudget))
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseFloat(budgetVal)
    if (!isNaN(n) && n > 0) {
      onUpdateWallet({ monthlyBudget: n })
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 2500)
    }
  }

  const exportCSV = () => {
    const headers = 'ID,Title,Amount,Type,Category,Date,Merchant\n'
    const rows = transactions
      .map((t) => `"${t.id}","${t.title}",${t.amount},"${t.type}","${t.category}","${t.date}","${t.merchant || ''}"`)
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pocketlens_transactions_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="pocketlens-account-tab">
      <header className="account-header">
        <h1 className="account-title">Account & Settings</h1>
      </header>

      {/* User Card */}
      <section className="account-profile-card">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            <User size={32} className="text-purple-600" />
          </div>
        </div>
        <div className="profile-info">
          <h2 className="profile-name">Pocket Lens User</h2>
          <span className="profile-badge">Local Workspace Active</span>
        </div>
      </section>

      {/* Monthly Budget Setting */}
      <section className="settings-card">
        <div className="card-top">
          <DollarSign size={20} className="text-purple-600" />
          <h3>Monthly Spending Budget</h3>
        </div>
        <p className="card-desc">Set your target expenditure ceiling for monthly tracking.</p>

        <form onSubmit={handleSaveBudget} className="budget-form">
          <div className="budget-input-group">
            <span className="currency-prefix">{wallet.currencySymbol}</span>
            <input
              type="number"
              step="10"
              value={budgetVal}
              onChange={(e) => setBudgetVal(e.target.value)}
              className="budget-input"
            />
          </div>
          <button type="submit" className="budget-save-btn">
            {savedSuccess ? (
              <span className="flex items-center gap-1">
                <Check size={14} /> Saved
              </span>
            ) : (
              'Update Budget'
            )}
          </button>
        </form>
      </section>

      {/* Currency Switcher */}
      <section className="settings-card">
        <div className="card-top">
          <Sparkles size={20} className="text-purple-600" />
          <h3>Preferred Currency</h3>
        </div>
        <div className="currency-grid">
          {[
            { symbol: '$', label: 'USD ($)' },
            { symbol: '€', label: 'EUR (€)' },
            { symbol: '£', label: 'GBP (£)' },
            { symbol: '¥', label: 'JPY (¥)' },
          ].map((c) => (
            <button
              key={c.symbol}
              type="button"
              className={`currency-btn ${wallet.currencySymbol === c.symbol ? 'active' : ''}`}
              onClick={() => onUpdateWallet({ currencySymbol: c.symbol })}
            >
              <span className="font-bold">{c.symbol}</span>
              <span className="text-xs">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Data Management */}
      <section className="settings-card">
        <div className="card-top">
          <Shield size={20} className="text-purple-600" />
          <h3>Data & Offline Storage</h3>
        </div>
        <p className="card-desc">
          Pocket Lens runs completely offline using browser IndexedDB and LocalStorage.
        </p>

        <div className="action-buttons-stack">
          <button type="button" className="action-row-btn" onClick={exportCSV}>
            <Download size={16} />
            <span>Export Transactions (CSV)</span>
          </button>

          <button
            type="button"
            className="action-row-btn reset"
            onClick={() => {
              if (confirm('Reset Pocket Lens transactions to initial sample state?')) {
                onResetDemoData()
              }
            }}
          >
            <RotateCcw size={16} />
            <span>Reset to Reference Sample Data</span>
          </button>
        </div>
      </section>
    </div>
  )
}
