import { useState } from 'react'
import {
  ArrowLeft,
  Home,
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Clock,
  PieChart,
  ShieldCheck,
  CreditCard,
  Layers,
} from 'lucide-react'

interface ExpenseLedgerAppProps {
  onBackToHome: () => void
}

export default function ExpenseLedgerApp({ onBackToHome }: ExpenseLedgerAppProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'analytics'>('overview')

  const sampleTransactions = [
    { id: 1, title: 'Workspace Cloud Servers', category: 'Infrastructure', amount: -64.2, date: 'Today, 2:15 PM', type: 'expense' },
    { id: 2, title: 'Consulting Retainer Payout', category: 'Revenue', amount: +2400.0, date: 'Yesterday', type: 'income' },
    { id: 3, title: 'Espresso & Team Meeting', category: 'Dining', amount: -18.5, date: 'Oct 25', type: 'expense' },
    { id: 4, title: 'Figma Organization License', category: 'Software', amount: -45.0, date: 'Oct 24', type: 'expense' },
  ]

  return (
    <div className="catalyst-app-container expense-theme-wrapper">
      {/* OS Navigation Bar */}
      <nav className="catalyst-app-header-nav" aria-label="Catalyst Navigation">
        <button
          type="button"
          onClick={onBackToHome}
          className="catalyst-nav-back-btn"
          title="Return to Catalyst Home Screen"
        >
          <ArrowLeft size={16} />
          <Home size={15} />
          <span>Catalyst OS</span>
        </button>
        <div className="catalyst-nav-app-pill expense-pill">
          <Wallet size={14} className="text-emerald-400" />
          <span className="catalyst-nav-app-title">Expense Ledger</span>
        </div>
        <div className="catalyst-nav-sync-status">
          <span className="phase-badge">Phase 1 Preview</span>
        </div>
      </nav>

      <main className="catalyst-placeholder-content">
        {/* Hero Card */}
        <div className="placeholder-hero-card expense-gradient">
          <div className="hero-top-row">
            <div>
              <span className="hero-caption">Total Balance</span>
              <h1 className="hero-balance">$4,850.20</h1>
            </div>
            <div className="hero-icon-bubble">
              <Wallet size={28} className="text-emerald-300" />
            </div>
          </div>

          <div className="hero-stats-grid">
            <div className="stat-pill stat-income">
              <TrendingUp size={16} />
              <div>
                <span className="stat-label">Income</span>
                <span className="stat-val">+$6,200.00</span>
              </div>
            </div>
            <div className="stat-pill stat-expense">
              <TrendingDown size={16} />
              <div>
                <span className="stat-label">Expenses</span>
                <span className="stat-val">-$1,349.80</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 1 Verification Notice */}
        <div className="verification-callout">
          <div className="callout-header">
            <ShieldCheck size={20} className="text-emerald-400" />
            <h3>Module Architecture Verified</h3>
          </div>
          <p>
            Routing, loading splash transition, and container isolation for <strong>Expense Ledger</strong> are active.
            Core ledger logic, categories, and sync persistence will be introduced in Phase Two.
          </p>
        </div>

        {/* Tab Strip */}
        <div className="placeholder-tab-strip">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Layers size={15} />
            Overview
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`}
            onClick={() => setActiveTab('ledger')}
          >
            <CreditCard size={15} />
            Transactions
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <PieChart size={15} />
            Breakdown
          </button>
        </div>

        {/* Quick Mock Actions */}
        <div className="action-row">
          <button type="button" className="action-card-btn">
            <Plus size={16} className="text-emerald-400" />
            <span>Record Expense</span>
          </button>
          <button type="button" className="action-card-btn">
            <Clock size={16} className="text-emerald-400" />
            <span>Recurring Bills</span>
          </button>
        </div>

        {/* Recent Transactions List Preview */}
        <div className="transactions-preview-card">
          <div className="card-header">
            <h3>Recent Ledger Entries</h3>
            <span className="badge-preview">Preview Data</span>
          </div>

          <div className="transactions-list">
            {sampleTransactions.map((tx) => (
              <div key={tx.id} className="transaction-item">
                <div className="tx-left">
                  <div className={`tx-icon ${tx.type === 'income' ? 'income' : 'expense'}`}>
                    {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div>
                    <h4 className="tx-title">{tx.title}</h4>
                    <span className="tx-meta">{tx.category} • {tx.date}</span>
                  </div>
                </div>
                <span className={`tx-amount ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
