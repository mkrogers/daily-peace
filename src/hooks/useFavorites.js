import { useState, useCallback } from 'react'

const STORAGE_KEY = 'dp-favorites'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : []
  } catch {
    return []
  }
}

function persist(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // quota exceeded or private browsing restriction
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(load)

  const toggleFavorite = useCallback(id => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      persist(next)
      return next
    })
  }, [])

  const isFavorite = useCallback(id => favorites.includes(id), [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
