export type TransactionType = 'expense' | 'income'

export type PocketLensCategory =
  | 'Subscriptions'
  | 'Bills & Utilities'
  | 'Food & Dining'
  | 'Groceries'
  | 'Shopping'
  | 'Transportation'
  | 'Entertainment'
  | 'Health & Wellness'
  | 'Income'
  | 'Other'

export interface CategoryMeta {
  id: PocketLensCategory
  name: string
  color: string
}

export const POCKET_LENS_CATEGORIES: CategoryMeta[] = [
  { id: 'Subscriptions', name: 'Subscriptions', color: '#7047eb' },
  { id: 'Bills & Utilities', name: 'Bills & Utilities', color: '#3b82f6' },
  { id: 'Food & Dining', name: 'Food & Dining', color: '#f59e0b' },
  { id: 'Groceries', name: 'Groceries', color: '#10b981' },
  { id: 'Shopping', name: 'Shopping', color: '#ec4899' },
  { id: 'Transportation', name: 'Transportation', color: '#6366f1' },
  { id: 'Entertainment', name: 'Entertainment', color: '#8b5cf6' },
  { id: 'Health & Wellness', name: 'Health & Wellness', color: '#14b8a6' },
  { id: 'Income', name: 'Income', color: '#22c55e' },
  { id: 'Other', name: 'Other', color: '#64748b' },
]

export interface Transaction {
  id: string
  title: string
  amount: number
  type: TransactionType
  category: PocketLensCategory
  date: string // YYYY-MM-DD
  merchant?: string
  notes?: string
  receiptImage?: string
  receiptItems?: string[]
  isScanned?: boolean
  createdAt: number
}

// Alias for convenience
export type PocketLensTransaction = Transaction

export interface WalletState {
  balance: number
  monthlyBudget: number
  currencySymbol: string
  walletName: string
}

export interface ScannedReceiptResult {
  success: boolean
  source: 'gemini-vision' | 'ocr-heuristic' | 'sample-preset'
  data: {
    merchant: string
    amount: number
    date: string
    type: TransactionType
    category: PocketLensCategory
    items?: string[]
    confidence?: number
  }
  imagePreview?: string
  rawText?: string
}

export type PocketLensTab = 'home' | 'transactions' | 'analytics' | 'account'
