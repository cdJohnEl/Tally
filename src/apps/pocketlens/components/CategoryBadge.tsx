import {
  Wallet,
  Zap,
  Coffee,
  ShoppingBag,
  Tv,
  Car,
  Heart,
  TrendingUp,
  Receipt,
  ShoppingCart,
  Music,
} from 'lucide-react'
import type { PocketLensCategory } from '../lib/pocketLensTypes'

interface CategoryBadgeProps {
  category: PocketLensCategory
  title?: string
  size?: number
}

export default function CategoryBadge({ category, title = '', size = 20 }: CategoryBadgeProps) {
  const lowerTitle = title.toLowerCase()

  // Match special brand icons from reference image
  if (lowerTitle.includes('spotify')) {
    return (
      <div className="brand-icon-box spotify">
        <Music size={size} strokeWidth={2.5} />
      </div>
    )
  }
  if (lowerTitle.includes('copay')) {
    return (
      <div className="brand-icon-box copay">
        <Wallet size={size} strokeWidth={2.2} />
      </div>
    )
  }
  if (lowerTitle.includes('ui8')) {
    return (
      <div className="brand-icon-box ui8">
        <span className="brand-text-icon">UI⁸</span>
      </div>
    )
  }
  if (lowerTitle.includes('freepik')) {
    return (
      <div className="brand-icon-box freepik">
        <span className="brand-text-icon">FP</span>
      </div>
    )
  }

  // Standard category icons
  switch (category) {
    case 'Bills & Utilities':
      return (
        <div className="cat-icon-box utilities">
          <Zap size={size} />
        </div>
      )
    case 'Subscriptions':
      return (
        <div className="cat-icon-box subscriptions">
          <Tv size={size} />
        </div>
      )
    case 'Food & Dining':
      return (
        <div className="cat-icon-box food">
          <Coffee size={size} />
        </div>
      )
    case 'Groceries':
      return (
        <div className="cat-icon-box groceries">
          <ShoppingCart size={size} />
        </div>
      )
    case 'Shopping':
      return (
        <div className="cat-icon-box shopping">
          <ShoppingBag size={size} />
        </div>
      )
    case 'Transportation':
      return (
        <div className="cat-icon-box transit">
          <Car size={size} />
        </div>
      )
    case 'Health & Wellness':
      return (
        <div className="cat-icon-box health">
          <Heart size={size} />
        </div>
      )
    case 'Income':
      return (
        <div className="cat-icon-box income">
          <TrendingUp size={size} />
        </div>
      )
    default:
      return (
        <div className="cat-icon-box general">
          <Receipt size={size} />
        </div>
      )
  }
}
