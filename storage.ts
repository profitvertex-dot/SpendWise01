// Thin, safe wrapper around localStorage so the rest of the app never
// touches window.localStorage directly. Every key is namespaced under
// "spendwise:" so we never collide with anything else on the page.

const PREFIX = 'spendwise:'

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Corrupt or unavailable storage should never crash the app.
    return fallback
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage disabled (e.g. private browsing) — fail silently.
  }
}

export function clearAllStorage(): void {
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(PREFIX))
  keys.forEach((k) => window.localStorage.removeItem(k))
}

export const STORAGE_KEYS = {
  expenses: 'expenses',
  budget: 'budget',
  profile: 'profile',
  onboarded: 'onboarded'
} as const
