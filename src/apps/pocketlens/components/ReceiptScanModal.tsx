import { useState, useRef } from 'react'
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  FileText,
  DollarSign,
  Tag,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { parseReceiptImage, SAMPLE_RECEIPTS, type SampleReceiptPreset } from '../lib/receiptParser'
import type {
  Transaction,
  PocketLensCategory,
  TransactionType,
  ScannedReceiptResult,
} from '../lib/pocketLensTypes'

interface ReceiptScanModalProps {
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void
  onClose: () => void
}

const CATEGORIES: PocketLensCategory[] = [
  'Subscriptions',
  'Bills & Utilities',
  'Food & Dining',
  'Groceries',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Health & Wellness',
  'Income',
  'Other',
]

export default function ReceiptScanModal({ onSave, onClose }: ReceiptScanModalProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScannedReceiptResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form Fields for user to review & edit
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState<PocketLensCategory>('Food & Dining')
  const [notes, setNotes] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const processImageFile = (file: File) => {
    setErrorMsg(null)
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setImagePreview(base64)
      setIsScanning(true)

      try {
        const result = await parseReceiptImage(base64, file.type || 'image/jpeg')
        setScanResult(result)

        // Pre-fill fields for user review
        setTitle(result.data.merchant)
        setAmount(String(result.data.amount))
        setDate(result.data.date)
        setType(result.data.type)
        setCategory(result.data.category)
        if (result.data.items && result.data.items.length > 0) {
          setNotes(result.data.items.join('\n'))
        }
      } catch (err: any) {
        setErrorMsg('Could not process receipt. Please verify details manually.')
      } finally {
        setIsScanning(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSelectSample = (sample: SampleReceiptPreset) => {
    setIsScanning(true)
    setErrorMsg(null)
    setImagePreview(null)

    setTimeout(() => {
      setScanResult({
        success: true,
        source: 'sample-preset',
        data: {
          merchant: sample.merchant,
          amount: sample.amount,
          date: new Date().toISOString().split('T')[0],
          type: sample.type,
          category: sample.category,
          items: sample.items,
          confidence: 0.99,
        },
      })
      setTitle(sample.merchant)
      setAmount(String(sample.amount))
      setDate(new Date().toISOString().split('T')[0])
      setType(sample.type)
      setCategory(sample.category)
      setNotes(sample.items.join('\n'))
      setIsScanning(false)
    }, 600)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) {
      setErrorMsg('Please enter a valid positive amount.')
      return
    }

    onSave({
      title: title.trim() || 'Scanned Receipt',
      amount: num,
      type,
      category,
      date,
      merchant: title.trim(),
      notes: notes.trim(),
      receiptImage: imagePreview || undefined,
      isScanned: true,
    })
    onClose()
  }

  return (
    <div className="pocketlens-modal-overlay" onClick={onClose}>
      <div
        className="pocketlens-scan-dialog animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-modal-title"
      >
        {/* Header */}
        <div className="dialog-header-bar">
          <div className="flex items-center gap-2">
            <div className="lens-sparkle-box">
              <Camera size={18} className="text-purple-600" />
            </div>
            <div>
              <h2 id="scan-modal-title" className="dialog-title-text">
                Pocket Lens Scan
              </h2>
              <span className="dialog-subtitle-text">AI Receipt & Invoice Extraction</span>
            </div>
          </div>

          <button
            type="button"
            className="dialog-close-icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Upload / Capture Trigger Area */}
        {!scanResult && !isScanning && (
          <div className="scan-intake-area">
            {/* Hidden Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && processImageFile(e.target.files[0])}
            />

            {/* Drop / Click Targets */}
            <div
              className="scan-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-icon-box">
                <Upload size={28} className="text-purple-600" />
              </div>
              <h3 className="dropzone-heading">Upload or Drop Receipt Photo</h3>
              <p className="dropzone-sub">PNG, JPG, or WEBP up to 10MB</p>

              <div className="dropzone-buttons-row" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="btn-lens-camera"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera size={16} />
                  <span>Snap with Camera</span>
                </button>
                <button
                  type="button"
                  className="btn-lens-browse"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  <span>Choose File</span>
                </button>
              </div>
            </div>

            {/* 1-Tap Sample Receipts Section */}
            <div className="sample-receipts-shelf">
              <div className="shelf-label-row">
                <Sparkles size={14} className="text-purple-600" />
                <span>Test Instantly with Sample Receipts:</span>
              </div>

              <div className="sample-chips-grid">
                {SAMPLE_RECEIPTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="sample-receipt-chip"
                    onClick={() => handleSelectSample(s)}
                  >
                    <span className="sample-merchant">{s.merchant}</span>
                    <span className="sample-amount">${s.amount.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scanning Animation State */}
        {isScanning && (
          <div className="scanning-animation-card">
            <div className="scanline-viewport">
              {imagePreview ? (
                <img src={imagePreview} alt="Receipt preview" className="receipt-image-preview" />
              ) : (
                <div className="receipt-placeholder-doc">
                  <FileText size={48} className="text-purple-300" />
                  <span>Scanning receipt structure...</span>
                </div>
              )}
              <div className="animated-laser-bar" />
            </div>

            <div className="scanning-status-box">
              <div className="flex items-center justify-center gap-2 text-purple-700 font-semibold text-sm">
                <Sparkles size={16} className="animate-spin-slow" />
                <span>Gemini Vision AI Analyzing Receipt…</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Extracting merchant, totals, tax, line items, and predicting category
              </p>
            </div>
          </div>
        )}

        {/* Review & Edit Extracted Data Form */}
        {scanResult && !isScanning && (
          <form onSubmit={handleSubmit} className="extracted-review-form">
            <div className="ai-success-banner">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <Check size={14} className="text-emerald-600" />
                <span>Extracted via {scanResult.source === 'gemini-vision' ? 'Gemini 3.8 Flash Vision' : 'Lens OCR Engine'}</span>
              </div>
              <button
                type="button"
                className="rescan-link"
                onClick={() => {
                  setScanResult(null)
                  setImagePreview(null)
                }}
              >
                Scan another
              </button>
            </div>

            {errorMsg && (
              <div className="form-error-banner">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Merchant / Title */}
            <div className="form-group">
              <label className="input-label">
                <FileText size={13} className="text-purple-600" />
                Merchant / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="lens-input"
                placeholder="e.g. Starbucks, Target"
              />
            </div>

            {/* Amount & Type Row */}
            <div className="form-row-two">
              <div className="form-group flex-1">
                <label className="input-label">
                  <DollarSign size={13} className="text-purple-600" />
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="lens-input font-bold text-lg"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Type</label>
                <div className="type-toggle-pill">
                  <button
                    type="button"
                    className={`type-btn ${type === 'expense' ? 'is-exp' : ''}`}
                    onClick={() => setType('expense')}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${type === 'income' ? 'is-inc' : ''}`}
                    onClick={() => setType('income')}
                  >
                    Income
                  </button>
                </div>
              </div>
            </div>

            {/* Category & Date Row */}
            <div className="form-row-two">
              <div className="form-group flex-1">
                <label className="input-label">
                  <Tag size={13} className="text-purple-600" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PocketLensCategory)}
                  className="lens-select"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group flex-1">
                <label className="input-label">
                  <Calendar size={13} className="text-purple-600" />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="lens-input"
                />
              </div>
            </div>

            {/* Line items notes */}
            {notes && (
              <div className="form-group">
                <label className="input-label">
                  <Layers size={13} className="text-purple-600" />
                  Detected Line Items / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="lens-textarea"
                />
              </div>
            )}

            {/* Submit Action */}
            <div className="dialog-footer-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-confirm-save">
                <span>Confirm & Log Transaction</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
