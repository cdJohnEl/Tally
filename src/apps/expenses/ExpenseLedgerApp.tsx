import PocketLensApp from '../pocketlens/PocketLensApp'

interface ExpenseLedgerAppProps {
  onBackToHome: () => void
}

/**
 * Pocket Lens replaces the Expense Ledger placeholder.
 * Forwarding directly to PocketLensApp.
 */
export default function ExpenseLedgerApp({ onBackToHome }: ExpenseLedgerAppProps) {
  return <PocketLensApp onBackToCatalyst={onBackToHome} />
}
