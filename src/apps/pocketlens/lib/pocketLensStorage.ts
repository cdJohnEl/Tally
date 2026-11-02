import type { Transaction, WalletState } from './pocketLensTypes'

const TX_KEY_PREFIX = 'pocketlens_txs_'
const WALLET_KEY_PREFIX = 'pocketlens_wallet_'

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Spotify Subscriptions',
    amount: 4.99,
    type: 'expense',
    category: 'Subscriptions',
    date: '2023-07-15',
    merchant: 'Spotify AB',
    notes: 'Premium Family Plan monthly bill',
    createdAt: new Date('2023-07-15T10:30:00Z').getTime(),
  },
  {
    id: 'tx-2',
    title: 'Copay Balance Top up',
    amount: 11.32,
    type: 'expense',
    category: 'Bills & Utilities',
    date: '2023-07-14',
    merchant: 'Copay Services',
    notes: 'Digital wallet top-up for micro-transit',
    createdAt: new Date('2023-07-14T14:15:00Z').getTime(),
  },
  {
    id: 'tx-3',
    title: 'UI8 Subscriptions',
    amount: 188.0,
    type: 'expense',
    category: 'Subscriptions',
    date: '2023-07-12',
    merchant: 'UI8 Design Kit Inc',
    notes: 'Annual Pro All-Access Pass',
    createdAt: new Date('2023-07-12T09:00:00Z').getTime(),
  },
  {
    id: 'tx-4',
    title: 'Freepik Subscriptions',
    amount: 109.0,
    type: 'expense',
    category: 'Subscriptions',
    date: '2023-07-13',
    merchant: 'Freepik Company',
    notes: 'Asset library commercial license',
    createdAt: new Date('2023-07-13T16:45:00Z').getTime(),
  },
  {
    id: 'tx-5',
    title: 'City Power & Utilities',
    amount: 101.99,
    type: 'expense',
    category: 'Bills & Utilities',
    date: '2023-07-08',
    merchant: 'Metropolitan Energy',
    notes: 'Residential electric & cooling',
    createdAt: new Date('2023-07-08T11:20:00Z').getTime(),
  },
  {
    id: 'tx-6',
    title: 'Product Design Retainer',
    amount: 3200.0,
    type: 'income',
    category: 'Income',
    date: '2023-07-05',
    merchant: 'Acme Digital Studio',
    notes: 'Q3 Design Systems Consulting',
    createdAt: new Date('2023-07-05T08:00:00Z').getTime(),
  },
  {
    id: 'tx-7',
    title: 'Organic Market & Groceries',
    amount: 86.5,
    type: 'expense',
    category: 'Groceries',
    date: '2023-07-03',
    merchant: 'Whole Foods Market',
    notes: 'Produce and pantry essentials',
    createdAt: new Date('2023-07-03T18:10:00Z').getTime(),
  },
  {
    id: 'tx-8',
    title: 'Specialty Coffee Roasters',
    amount: 16.4,
    type: 'expense',
    category: 'Food & Dining',
    date: '2023-07-02',
    merchant: 'Blue Bottle Coffee',
    notes: 'Espresso blend & beans',
    createdAt: new Date('2023-07-02T08:45:00Z').getTime(),
  },
]

export const INITIAL_WALLET: WalletState = {
  balance: 5631.22,
  monthlyBudget: 1500.0,
  currencySymbol: '$',
  walletName: 'Spending Wallet',
}

export function loadTransactions(uid: string = 'guest-user'): Transaction[] {
  try {
    const raw = localStorage.getItem(`${TX_KEY_PREFIX}${uid || 'default'}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.error('Failed to load Pocket Lens transactions:', err)
  }
  // Save initial if empty
  saveTransactions(uid, INITIAL_TRANSACTIONS)
  return INITIAL_TRANSACTIONS
}

export function saveTransactions(uid: string = 'guest-user', txs: Transaction[]) {
  try {
    localStorage.setItem(`${TX_KEY_PREFIX}${uid || 'default'}`, JSON.stringify(txs))
  } catch (err) {
    console.error('Failed to save Pocket Lens transactions:', err)
  }
}

export function saveTransaction(
  uid: string = 'guest-user',
  tx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string },
): Transaction[] {
  const all = loadTransactions(uid)
  let updated: Transaction[]
  if (tx.id) {
    updated = all.map((t) => (t.id === tx.id ? { ...t, ...tx, id: tx.id } : t))
  } else {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    }
    updated = [newTx, ...all]
  }
  saveTransactions(uid, updated)
  return updated
}

export function deleteTransaction(uid: string = 'guest-user', id: string): Transaction[] {
  const all = loadTransactions(uid)
  const updated = all.filter((t) => t.id !== id)
  saveTransactions(uid, updated)
  return updated
}

export function loadWallet(uid: string = 'guest-user'): WalletState {
  try {
    const raw = localStorage.getItem(`${WALLET_KEY_PREFIX}${uid || 'default'}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.balance === 'number') return parsed
    }
  } catch (err) {
    console.error('Failed to load Pocket Lens wallet:', err)
  }
  saveWallet(uid, INITIAL_WALLET)
  return INITIAL_WALLET
}

export function saveWallet(uid: string = 'guest-user', wallet: WalletState) {
  try {
    localStorage.setItem(`${WALLET_KEY_PREFIX}${uid || 'default'}`, JSON.stringify(wallet))
  } catch (err) {
    console.error('Failed to save Pocket Lens wallet:', err)
  }
}
