import React, { useState } from 'react'
import type { PocketLensCategory, Transaction, TransactionType } from '../lib/pocketLensTypes'
import { POCKET_LENS_CATEGORIES } from '../lib/pocketLensTypes'

interface TransactionModalProps {
  transaction?: Transaction | null
  onClose: () => void
  onSave: (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => void
  onDelete?: (id: string) => void
}

export default function TransactionModal({
  transaction,
  onClose,
  onSave,
  onDelete,
}: TransactionModalProps) {
  const isEditing = !!transaction
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense')
  const [title, setTitle] = useState(transaction?.title || '')
  const [amount, setAmount] = useState(transaction ? transaction.amount.toString() : '')
  const [category, setCategory] = useState<PocketLensCategory>(
    transaction?.category || 'Bills & Utilities',
  )
  const [date, setDate] = useState(
    transaction?.date || new Date().toISOString().split('T')[0],
  )
  const [notes, setNotes] = useState(transaction?.notes || '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!title.trim()) {
      setError('Please enter a description or merchant name')
      return
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount')
      return
    }

    onSave({
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  return (
    <div className="pl-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="pl-modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pl-modal-handle" />

        <div className="pl-modal-header">
          <div className="pl-modal-title">
            {isEditing ? 'Edit Transaction' : 'New Transaction'}
          </div>
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
          {/* Type Toggle */}
          <div className="pl-type-toggle">
            <button
              type="button"
              className={`pl-type-btn ${type === 'expense' ? 'pl-type-btn-active-expense' : ''}`}
              onClick={() => setType('expense')}
            >
              Expense
            </button>
            <button
              type="button"
              className={`pl-type-btn ${type === 'income' ? 'pl-type-btn-active-income' : ''}`}
              onClick={() => setType('income')}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="pl-amount-input-box">
            <span className="pl-amount-prefix">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-amount-input"
              autoFocus={!isEditing}
            />
          </div>

          {error && <div className="pl-form-error">{error}</div>}

          {/* Title / Merchant */}
          <div className="pl-form-group">
            <label className="pl-form-label">Merchant / Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Spotify, Whole Foods, Freelance payout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="pl-text-input"
            />
          </div>

          {/* Category */}
          <div className="pl-form-group">
            <label className="pl-form-label">Category</label>
            <div className="pl-category-grid">
              {POCKET_LENS_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`pl-category-pill ${category === cat.id ? 'pl-category-pill-active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    borderColor: category === cat.id ? cat.color : undefined,
                    backgroundColor: category === cat.id ? `${cat.color}18` : undefined,
                  }}
                >
                  <span
                    className="pl-cat-pill-dot"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="pl-form-group">
            <label className="pl-form-label">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-text-input"
            />
          </div>

          {/* Notes */}
          <div className="pl-form-group">
            <label className="pl-form-label">Notes (Optional)</label>
            <input
              type="text"
              placeholder="Add personal note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="pl-text-input"
            />
          </div>

          {/* Actions */}
          <div className="pl-modal-actions">
            {isEditing && onDelete && transaction && (
              <button
                type="button"
                className="pl-btn-danger"
                onClick={() => {
                  if (confirm('Delete this transaction?')) {
                    onDelete(transaction.id)
                    onClose()
                  }
                }}
              >
                Delete
              </button>
            )}
            <button type="button" className="pl-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="pl-btn-primary">
              {isEditing ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
