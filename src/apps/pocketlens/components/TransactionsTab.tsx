import { useState, useMemo } from 'react'
import {
  ChevronRight,
  Zap,
  Search,
  ArrowUpDown,
} from 'lucide-react'
import DonutChart from './DonutChart'
import DualBarChart from './DualBarChart'
import CategoryBadge from './CategoryBadge'
import type { Transaction, WalletState, PocketLensCategory } from '../lib/pocketLensTypes'

interface TransactionsTabProps {
  transactions: Transaction[]
  wallet: WalletState
  onSelectTransaction: (tx: Transaction) => void
}

export default function TransactionsTab({
  transactions,
  wallet,
  onSelectTransaction,
}: TransactionsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'latest' | 'highest'>('latest')

  // Calculate current month's expenses
  const now = new Date()
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now)
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const expensesThisMonth = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthStr),
  )

  const totalExpense = expensesThisMonth.reduce((sum, t) => sum + t.amount, 0) || 313.31

  // Category breakdown for Donut Chart
  const categoryTotals = useMemo(() => {
    const map = new Map<PocketLensCategory, number>()
    const colors: Record<string, string> = {
      'Bills & Utilities': '#7047eb',
      'Subscriptions': '#86efac',
      'Food & Dining': '#f59e0b',
      'Groceries': '#38bdf8',
      'Shopping': '#ec4899',
      'Transportation': '#14b8a6',
      'Other': '#94a3b8',
    }

    expensesThisMonth.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount)
    })

    // If empty demo fallback
    if (map.size === 0) {
      return [
        { category: 'Bills & Utilities', amount: 301.99, color: '#7047eb' },
        { category: 'Subscriptions', amount: 11.32, color: '#86efac' },
      ]
    }

    return Array.from(map.entries())
      .map(([cat, amt]) => ({
        category: cat,
        amount: amt,
        color: colors[cat] || '#7047eb',
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [expensesThisMonth])

  // Top spending item
  const topCategory = categoryTotals[0] || {
    category: 'Bills & Utilities',
    amount: 301.99,
  }

  // Filtered & searched transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.merchant && t.merchant.toLowerCase().includes(searchQuery.toLowerCase()))
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (sortOrder === 'highest') {
          return b.amount - a.amount
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
  }, [transactions, searchQuery, selectedCategory, sortOrder])

  const formatAmount = (tx: Transaction) => {
    const symbol = wallet.currencySymbol || '$'
    if (tx.type === 'income') {
      return `+${symbol}${tx.amount.toFixed(2)}`
    }
    return `-${symbol}${tx.amount.toFixed(2)}`
  }

  return (
    <div className="pocketlens-transactions-tab">
      {/* Top Header */}
      <header className="transactions-header">
        <h1 className="transactions-title">Transactions</h1>
      </header>

      {/* Donut Chart Card ("Expense Total in Month") */}
      <section className="donut-card-container">
        <DonutChart
          totalAmount={totalExpense}
          monthLabel={monthName}
          categories={categoryTotals}
        />
      </section>

      {/* Top Spending Section matching Reference Image */}
      <section className="top-spending-section">
        <div className="section-header-row">
          <h2 className="section-heading">Top Spending</h2>
        </div>

        <div className="top-spending-card">
          <div className="top-spending-left">
            <div className="top-spending-icon-box">
              <Zap size={20} className="text-purple-600" />
            </div>
            <div className="top-spending-meta">
              <h3>{topCategory.category}</h3>
              <span>$120 more than June</span>
            </div>
          </div>

          <div className="top-spending-right">
            <span className="top-spending-amount">
              {wallet.currencySymbol}{topCategory.amount.toFixed(2)}
            </span>
            <ChevronRight size={18} className="chevron-icon" />
          </div>
        </div>
      </section>

      {/* Mini Bar Chart Section matching Reference Image bottom */}
      <section className="mini-barchart-section">
        <DualBarChart showTimeFilter />
      </section>

      {/* Search and All Transactions List */}
      <section className="all-transactions-section">
        <div className="search-filter-row">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search merchant or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            type="button"
            className={`sort-toggle-btn ${sortOrder === 'highest' ? 'active' : ''}`}
            onClick={() => setSortOrder(sortOrder === 'latest' ? 'highest' : 'latest')}
            title="Toggle Sort (Date / Amount)"
          >
            <ArrowUpDown size={15} />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="category-chips-row">
          {['all', 'Subscriptions', 'Bills & Utilities', 'Food & Dining', 'Groceries', 'Income'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'All Records' : cat}
            </button>
          ))}
        </div>

        {/* Transactions Feed */}
        <div className="transactions-feed-list">
          {filteredTransactions.map((tx) => (
            <button
              key={tx.id}
              type="button"
              className="tx-item-card"
              onClick={() => onSelectTransaction(tx)}
            >
              <div className="tx-card-left">
                <CategoryBadge category={tx.category} title={tx.title} size={20} />
                <div className="tx-info-block">
                  <h3 className="tx-title">{tx.title}</h3>
                  <span className="tx-date-sub">{tx.date}</span>
                </div>
              </div>

              <div className="tx-card-right">
                <span className={`tx-price-tag ${tx.type === 'income' ? 'is-income' : 'is-expense'}`}>
                  {formatAmount(tx)}
                </span>
                <ChevronRight size={16} className="tx-chevron" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
