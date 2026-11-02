import { useState, useEffect } from 'react'
import type {
  PocketLensTab,
  Transaction,
  WalletState,
} from './lib/pocketLensTypes'
import {
  loadTransactions,
  saveTransactions,
  loadWallet,
  saveWallet,
  deleteTransaction,
  saveTransaction,
  INITIAL_TRANSACTIONS,
  INITIAL_WALLET,
} from './lib/pocketLensStorage'
import HomeTab from './components/HomeTab'
import TransactionsTab from './components/TransactionsTab'
import AnalyticsTab from './components/AnalyticsTab'
import AccountTab from './components/AccountTab'
import ReceiptScanModal from './components/ReceiptScanModal'
import TransactionModal from './components/TransactionModal'
import WalletModal from './components/WalletModal'
import './pocketlens.css'

interface PocketLensAppProps {
  onBackToCatalyst?: () => void
  uid?: string
}

export default function PocketLensApp({ onBackToCatalyst, uid = 'guest-user' }: PocketLensAppProps) {
  const [activeTab, setActiveTab] = useState<PocketLensTab>('home')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallet, setWallet] = useState<WalletState>({
    walletName: 'Spending Wallet',
    balance: 5631.22,
    currencySymbol: '$',
    monthlyBudget: 500,
  })

  // Modals & Popups
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false)
  const [isScanModalOpen, setIsScanModalOpen] = useState(false)
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Load persisted data on mount
  useEffect(() => {
    const storedTx = loadTransactions(uid)
    const storedWallet = loadWallet(uid)
    setTransactions(storedTx)
    setWallet(storedWallet)
  }, [uid])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(null), 3000)
  }

  // Handle Save Transaction (create or update)
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string,
  ) => {
    const updated = saveTransaction(uid, {
      ...data,
      id: existingId || (editingTransaction ? editingTransaction.id : undefined),
    })
    setTransactions(updated)

    // Automatically update wallet balance: expense decreases, income increases
    const delta = data.type === 'expense' ? -data.amount : data.amount
    const newWallet: WalletState = {
      ...wallet,
      balance: Math.max(0, Math.round((wallet.balance + delta) * 100) / 100),
    }
    setWallet(newWallet)
    saveWallet(uid, newWallet)

    showToast(existingId ? 'Transaction updated' : 'Transaction saved')
  }

  // Handle Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id)
    const updated = deleteTransaction(uid, id)
    setTransactions(updated)

    if (target) {
      // Revert wallet balance effect
      const revertDelta = target.type === 'expense' ? target.amount : -target.amount
      const newWallet: WalletState = {
        ...wallet,
        balance: Math.max(0, Math.round((wallet.balance + revertDelta) * 100) / 100),
      }
      setWallet(newWallet)
      saveWallet(uid, newWallet)
    }

    showToast('Transaction removed')
  }

  // Handle Wallet Update
  const handleUpdateWallet = (newWallet: WalletState) => {
    setWallet(newWallet)
    saveWallet(uid, newWallet)
    showToast('Wallet updated')
  }

  // Partial update wallet from settings
  const handlePartialUpdateWallet = (updates: Partial<WalletState>) => {
    const updated = { ...wallet, ...updates }
    setWallet(updated)
    saveWallet(uid, updated)
    showToast('Settings saved')
  }

  // Reset to initial sample data
  const handleResetData = () => {
    saveTransactions(uid, INITIAL_TRANSACTIONS)
    saveWallet(uid, INITIAL_WALLET)
    setTransactions(INITIAL_TRANSACTIONS)
    setWallet(INITIAL_WALLET)
    showToast('Reset to sample data')
  }

  return (
    <div className="pocketlens-root">
      {/* Breadcrumb back to Catalyst suite */}
      <header className="pl-catalyst-topbar">
        <button
          type="button"
          onClick={onBackToCatalyst}
          className="pl-back-catalyst-btn"
          aria-label="Back to Catalyst Home"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Catalyst</span>
        </button>
        <span className="pl-topbar-appname">Pocket Lens</span>
        <button
          type="button"
          onClick={() => setIsScanModalOpen(true)}
          className="pl-back-catalyst-btn"
          title="Scan Receipt with AI"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span>Scan</span>
        </button>
      </header>

      {/* Mobile-first Phone Canvas */}
      <div className="pl-device-canvas">
        {/* Soft Lavender Background Gradient */}
        <div className="pl-screen-background" />

        {/* Content based on active tab */}
        <div className="pl-content-scroll">
          {activeTab === 'home' && (
            <HomeTab
              transactions={transactions}
              wallet={wallet}
              onSelectTransaction={(tx) => {
                setEditingTransaction(tx)
                setIsManualModalOpen(true)
              }}
              onOpenScanModal={() => setIsScanModalOpen(true)}
              onOpenManualModal={() => {
                setEditingTransaction(null)
                setIsManualModalOpen(true)
              }}
              onOpenWalletModal={() => setIsWalletModalOpen(true)}
              onGoToTransactions={() => setActiveTab('transactions')}
              onOpenSettings={() => setActiveTab('account')}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab
              transactions={transactions}
              wallet={wallet}
              onSelectTransaction={(tx) => {
                setEditingTransaction(tx)
                setIsManualModalOpen(true)
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              transactions={transactions}
              wallet={wallet}
              onSelectTransaction={(tx) => {
                setEditingTransaction(tx)
                setIsManualModalOpen(true)
              }}
            />
          )}

          {activeTab === 'account' && (
            <AccountTab
              wallet={wallet}
              transactions={transactions}
              onUpdateWallet={handlePartialUpdateWallet}
              onResetDemoData={handleResetData}
            />
          )}
        </div>

        {/* Floating Action Button (FAB) Popup Menu */}
        {isFabMenuOpen && (
          <div className="pl-fab-popup-menu">
            <button
              type="button"
              className="pl-fab-menu-option"
              onClick={() => {
                setIsFabMenuOpen(false)
                setIsScanModalOpen(true)
              }}
            >
              <div className="pl-fab-menu-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <span>Scan Receipt</span>
              <span className="pl-fab-badge">AI</span>
            </button>

            <button
              type="button"
              className="pl-fab-menu-option"
              onClick={() => {
                setIsFabMenuOpen(false)
                setEditingTransaction(null)
                setIsManualModalOpen(true)
              }}
            >
              <div className="pl-fab-menu-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span>Manual Entry</span>
            </button>
          </div>
        )}

        {/* Fixed Bottom Dock Navigation */}
        <nav className="pl-bottom-dock" aria-label="Bottom Navigation">
          {/* Home */}
          <button
            type="button"
            className={`pl-nav-item ${activeTab === 'home' ? 'pl-nav-item-active' : ''}`}
            onClick={() => {
              setActiveTab('home')
              setIsFabMenuOpen(false)
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </button>

          {/* Transactions */}
          <button
            type="button"
            className={`pl-nav-item ${activeTab === 'transactions' ? 'pl-nav-item-active' : ''}`}
            onClick={() => {
              setActiveTab('transactions')
              setIsFabMenuOpen(false)
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            <span>Transaction</span>
          </button>

          {/* Central Elevated Circular FAB */}
          <div className="pl-fab-container">
            <button
              type="button"
              className={`pl-fab-button ${isFabMenuOpen ? 'pl-fab-button-active' : ''}`}
              onClick={() => setIsFabMenuOpen((prev) => !prev)}
              aria-label="Add transaction or scan receipt"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Analytics */}
          <button
            type="button"
            className={`pl-nav-item ${activeTab === 'analytics' ? 'pl-nav-item-active' : ''}`}
            onClick={() => {
              setActiveTab('analytics')
              setIsFabMenuOpen(false)
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Analytics</span>
          </button>

          {/* Account */}
          <button
            type="button"
            className={`pl-nav-item ${activeTab === 'account' ? 'pl-nav-item-active' : ''}`}
            onClick={() => {
              setActiveTab('account')
              setIsFabMenuOpen(false)
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Account</span>
          </button>
        </nav>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#130f26',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* AI Receipt Scanning Modal */}
      {isScanModalOpen && (
        <ReceiptScanModal
          onClose={() => setIsScanModalOpen(false)}
          onSave={(data) => {
            handleSaveTransaction(data)
          }}
        />
      )}

      {/* Manual Transaction Create / Edit Modal */}
      {isManualModalOpen && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setIsManualModalOpen(false)
            setEditingTransaction(null)
          }}
          onSave={(data) => {
            handleSaveTransaction(data, editingTransaction?.id)
          }}
          onDelete={handleDeleteTransaction}
        />
      )}

      {/* Spending Wallet Edit Modal */}
      {isWalletModalOpen && (
        <WalletModal
          wallet={wallet}
          onClose={() => setIsWalletModalOpen(false)}
          onSave={handleUpdateWallet}
        />
      )}
    </div>
  )
}
