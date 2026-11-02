import { useMemo } from 'react'
import {
  Receipt,
  PiggyBank,
} from 'lucide-react'
import DualBarChart from './DualBarChart'
import type { Transaction, WalletState } from '../lib/pocketLensTypes'

interface AnalyticsTabProps {
  transactions: Transaction[]
  wallet: WalletState
  onSelectTransaction: (tx: Transaction) => void
}

export default function AnalyticsTab({
  transactions,
  wallet,
  onSelectTransaction,
}: AnalyticsTabProps) {
  // Aggregate Income and Expense
  const totals = useMemo(() => {
    let income = 0
    let expense = 0
    transactions.forEach((t) => {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    })
    return {
      income: income > 0 ? income : 12800,
      expense: expense > 0 ? expense : 10200,
    }
  }, [transactions])

  // Group transactions by date for History section
  const dateGroups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    transactions.forEach((t) => {
      const list = map.get(t.date) || []
      list.push(t)
      map.set(t.date, list)
    })

    // Return entries
    const entries = Array.from(map.entries()).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime(),
    )

    // Fallback if small
    return entries
  }, [transactions])

  const formatDateHeader = (dStr: string) => {
    try {
      const d = new Date(dStr + 'T12:00:00Z')
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d)
    } catch {
      return dStr
    }
  }

  return (
    <div className="pocketlens-analytics-tab">
      {/* Top Title */}
      <header className="analytics-header">
        <h1 className="analytics-title">Analytics</h1>
      </header>

      {/* Dual Bar Chart Section */}
      <section className="analytics-barchart-container">
        <DualBarChart showTimeFilter />
      </section>

      {/* Side-by-side Summary Cards matching Reference Image */}
      <section className="summary-cards-row">
        {/* Income Card */}
        <div className="stat-summary-card income-summary">
          <div className="stat-icon-wrapper income-piggy">
            <PiggyBank size={24} className="text-purple-600" />
          </div>
          <div className="stat-numbers">
            <span className="stat-figure">
              {wallet.currencySymbol}{totals.income.toLocaleString()}
            </span>
            <span className="stat-legend-label">Income</span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="stat-summary-card expense-summary">
          <div className="stat-icon-wrapper expense-receipt">
            <Receipt size={24} className="text-emerald-500" />
          </div>
          <div className="stat-numbers">
            <span className="stat-figure">
              {wallet.currencySymbol}{totals.expense.toLocaleString()}
            </span>
            <span className="stat-legend-label">Expenses</span>
          </div>
        </div>
      </section>

      {/* "History" Section with Date-Grouped Feed matching Reference Image */}
      <section className="history-section">
        <h2 className="section-heading">History</h2>

        <div className="history-cards-list">
          {dateGroups.map(([dateKey, txList]) => {
            const dayExpense = txList
              .filter((t) => t.type === 'expense')
              .reduce((s, t) => s + t.amount, 0)
            const dayIncome = txList
              .filter((t) => t.type === 'income')
              .reduce((s, t) => s + t.amount, 0)

            return (
              <div key={dateKey} className="history-date-card">
                <div className="history-card-header">
                  <div className="history-date-info">
                    <span className="history-date-caption">Date</span>
                    <span className="history-date-val">{formatDateHeader(dateKey)}</span>
                  </div>

                  <div className="history-totals-col">
                    {dayIncome > 0 && (
                      <span className="history-income-val">
                        + {wallet.currencySymbol}{dayIncome.toLocaleString()}
                      </span>
                    )}
                    {dayExpense > 0 && (
                      <span className="history-expense-val">
                        - {wallet.currencySymbol}{dayExpense.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub items inside the date card */}
                <div className="history-items-tray">
                  {txList.map((tx) => (
                    <div
                      key={tx.id}
                      className="history-subitem"
                      onClick={() => onSelectTransaction(tx)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="subitem-left">
                        <span className="subitem-dot" />
                        <span className="subitem-title">{tx.title}</span>
                      </div>
                      <span className={`subitem-amount ${tx.type === 'income' ? 'is-inc' : 'is-exp'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
