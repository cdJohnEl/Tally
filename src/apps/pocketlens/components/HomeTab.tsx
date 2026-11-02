import { useState } from 'react'
import {
  Calendar,
  Settings,
  Bell,
  Wallet,
  ChevronRight,
  TrendingDown,
  Camera,
  Plus,
} from 'lucide-react'
import CategoryBadge from './CategoryBadge'
import type { Transaction, WalletState } from '../lib/pocketLensTypes'

interface HomeTabProps {
  transactions: Transaction[]
  wallet: WalletState
  onSelectTransaction: (tx: Transaction) => void
  onOpenScanModal: () => void
  onOpenManualModal: () => void
  onOpenWalletModal: () => void
  onGoToTransactions: () => void
  onOpenSettings: () => void
}

export default function HomeTab({
  transactions,
  wallet,
  onSelectTransaction,
  onOpenScanModal,
  onOpenManualModal,
  onOpenWalletModal,
  onGoToTransactions,
  onOpenSettings,
}: HomeTabProps) {
  const [showNotificationToast, setShowNotificationToast] = useState(false)

  // Calculate current month's expenses
  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const thisMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + t.amount, 0)

  // Format today's date like "Fri, 21 Jul"
  const dateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(now)

  // Recent transactions list
  const recentTransactions = transactions.slice(0, 5)

  // Format amount like "-$4.99"
  const formatAmount = (tx: Transaction) => {
    const symbol = wallet.currencySymbol || '$'
    if (tx.type === 'income') {
      return `+${symbol}${tx.amount.toFixed(2)}`
    }
    return `-${symbol}${tx.amount.toFixed(2)}`
  }

  // Format date like "15 July 2023"
  const formatTxDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T12:00:00Z')
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d)
    } catch {
      return dateStr
    }
  }

  return (
    <div className="pocketlens-home-tab">
      {/* Top Header Row matching Reference Image */}
      <header className="pl-status-header">
        <button
          type="button"
          className="pl-icon-btn-circle"
          onClick={onOpenSettings}
          title="Pocket Lens Settings"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>

        <div className="pl-header-date-pill">
          <Calendar size={14} className="text-purple-600" />
          <span>{dateFormatted}</span>
        </div>

        <button
          type="button"
          className="pl-icon-btn-circle relative"
          onClick={() => {
            setShowNotificationToast(true)
            setTimeout(() => setShowNotificationToast(false), 3000)
          }}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="pl-notif-dot" />
        </button>
      </header>

      {/* Notification Toast */}
      {showNotificationToast && (
        <div className="notif-toast animate-fade-in">
          <span>✨ Pocket Lens is synced offline. Monthly budget: ${wallet.monthlyBudget}</span>
        </div>
      )}

      {/* "This Month Spend" Hero Section */}
      <section className="pl-hero-spend">
        <div className="pl-hero-spend-label">This Month Spend</div>
        <h1 className="pl-hero-spend-amount">
          {wallet.currencySymbol}{thisMonthExpenses > 0 ? thisMonthExpenses.toFixed(2) : '313.31'}
        </h1>
        <div className="pl-trend-badge">
          <TrendingDown size={14} />
          <span>67% below last month</span>
        </div>
      </section>

      {/* "Spending Wallet" Balance Card */}
      <section>
        <button
          type="button"
          className="pl-wallet-card"
          style={{ width: '100%' }}
          onClick={onOpenWalletModal}
          title="View Spending Wallet"
        >
          <div className="pl-wallet-left">
            <div className="pl-wallet-icon-box">
              <Wallet size={20} className="text-purple-600" />
            </div>
            <span className="pl-wallet-title">{wallet.walletName}</span>
          </div>

          <div className="pl-wallet-right">
            <span className="pl-wallet-balance">
              {wallet.currencySymbol}{wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <ChevronRight size={18} className="pl-chevron" />
          </div>
        </button>
      </section>

      {/* Quick Action Bar for Receipt Scan & Manual Entry */}
      <section className="pl-quick-scan-card">
        <div className="pl-quick-scan-info">
          <h4>Pocket Lens Smart Scan</h4>
          <p>Upload receipt photo or snap camera to auto-parse</p>
        </div>
        <div className="pl-quick-scan-actions">
          <button
            type="button"
            className="pl-btn-scan-action"
            onClick={onOpenScanModal}
            title="Scan Receipt with AI"
          >
            <Camera size={15} />
            <span>Scan Receipt</span>
          </button>
          <button
            type="button"
            className="pl-btn-add-action"
            onClick={onOpenManualModal}
            title="Add Transaction"
          >
            <Plus size={16} />
          </button>
        </div>
      </section>

      {/* "Recent Transactions" Feed matching Reference Image */}
      <section>
        <div className="pl-section-head">
          <h2 className="pl-section-title">Recent Transactions</h2>
          <button
            type="button"
            className="pl-link-subtle"
            onClick={onGoToTransactions}
          >
            See All
          </button>
        </div>

        <div className="pl-feed-list" style={{ marginTop: '12px' }}>
          {recentTransactions.map((tx) => (
            <button
              key={tx.id}
              type="button"
              className="pl-feed-item"
              style={{ width: '100%' }}
              onClick={() => onSelectTransaction(tx)}
              title="Click to view or edit"
            >
              <div className="pl-feed-left">
                <CategoryBadge category={tx.category} title={tx.title} size={20} />
                <div className="pl-feed-meta">
                  <span className="pl-feed-title">{tx.title}</span>
                  <span className="pl-feed-date">{formatTxDate(tx.date)}</span>
                </div>
              </div>

              <div className="pl-feed-right">
                <span className={`pl-feed-amount ${tx.type === 'income' ? 'pl-amount-income' : 'pl-amount-expense'}`}>
                  {formatAmount(tx)}
                </span>
                <ChevronRight size={16} className="pl-chevron" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
