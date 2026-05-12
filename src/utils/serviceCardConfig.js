// src/utils/serviceCardConfig.js
import {
  IdCard,
  BadgeCheck,
  CreditCard,
  Globe,
  Receipt,
  Landmark,
  Building2,
  Shield,
  Bolt,
  Flame,
  Droplet,
  Briefcase,
  FileText,
  Car,
  Truck,
  Users,
} from 'lucide-react'

/**
 * NEW CATEGORY SYSTEM (matches DB category_key)
 */
export const SERVICE_CATEGORIES = [
  { key: 'government_id', label: 'Government & ID Services' },
  { key: 'health_social', label: 'Health & Social Services' },
  { key: 'vehicle', label: 'Vehicle Services' },
  { key: 'business', label: 'Business Services' },
  { key: 'agriculture', label: 'Agriculture Services' },
  { key: 'utility', label: 'Utility Services' },
]

export const CATEGORY_LABEL = SERVICE_CATEGORIES.reduce((acc, c) => {
  acc[c.key] = c.label
  return acc
}, {})

export const ICON_OPTIONS = [
  { key: 'idcard', label: 'ID Card', Icon: IdCard },
  { key: 'badgecheck', label: 'Verified', Icon: BadgeCheck },
  { key: 'creditcard', label: 'Card', Icon: CreditCard },
  { key: 'globe', label: 'Website', Icon: Globe },
  { key: 'receipt', label: 'Receipt', Icon: Receipt },
  { key: 'landmark', label: 'Government', Icon: Landmark },
  { key: 'building2', label: 'Office', Icon: Building2 },
  { key: 'shield', label: 'Security', Icon: Shield },
  { key: 'bolt', label: 'Electricity', Icon: Bolt },
  { key: 'flame', label: 'Gas', Icon: Flame },
  { key: 'droplet', label: 'Water', Icon: Droplet },
  { key: 'briefcase', label: 'Business', Icon: Briefcase },
  { key: 'filetext', label: 'Document', Icon: FileText },
  { key: 'car', label: 'Car', Icon: Car },
  { key: 'truck', label: 'Transport', Icon: Truck },
  { key: 'users', label: 'Users', Icon: Users },
]

export const iconKeyToIcon = (key) => {
  const k = String(key || '').toLowerCase().trim()
  const found = ICON_OPTIONS.find((i) => i.key === k)
  return found?.Icon || IdCard
}

/**
 * DB value -> safe array of strings, max 2
 * Supports: array OR JSON-string OR comma-separated string
 */
export const normalizeBadges = (value, max = 2) => {
  if (!value) return []

  let arr = []

  if (Array.isArray(value)) {
    arr = value
  } else if (typeof value === 'string') {
    const s = value.trim()
    if (!s) arr = []
    else {
      // try JSON parse first
      try {
        const parsed = JSON.parse(s)
        arr = Array.isArray(parsed) ? parsed : []
      } catch {
        // fallback: comma-separated
        arr = s.split(',').map((x) => x.trim())
      }
    }
  }

  return arr
    .map((x) => String(x || '').trim())
    .filter(Boolean)
    .slice(0, max)
}

/**
 * Used by homepage (kept for compatibility with your imports)
 */
export function getServiceIcon(iconKey) {
  return iconKeyToIcon(iconKey)
}

export function getServiceBadges(badgesValue) {
  return normalizeBadges(badgesValue, 2)
}

/**
 * Get human-readable category label
 */
export function getCategoryLabel(categoryKey) {
  return CATEGORY_LABEL[String(categoryKey || '').trim()] || 'Other Services'
}