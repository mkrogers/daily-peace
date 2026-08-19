import { useState, useRef, useEffect, useCallback } from 'react'
import quotesData from './data/quotes.json'
import { useFavorites } from './hooks/useFavorites'
import './App.css'

const REFERENCE_DATE = new Date(2026, 0, 1) // local midnight 2026-01-01 = day 0, index 0

function getTodayIndex() {
  const now = new Date()
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysDiff = Math.round((todayMidnight - REFERENCE_DATE) / 86400000)
  return ((daysDiff % quotesData.length) + quotesData.length) % quotesData.length
}

function BookmarkIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill={filled ? 'white' : 'none'}
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CloseIcon({ size = 20 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function App() {
  const containerRef = useRef(null)
  const slideRefs = useRef([])
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const currIndex = useRef(0)
  const prevIndex = useRef(0)
  const isScrollingToTop = useRef(false)

  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  const favoriteQuotes = quotesData.filter(q => favorites.includes(q.id))

  useEffect(() => {
    const idx = getTodayIndex()
    if (containerRef.current && slideRefs.current[idx]) {
      containerRef.current.scrollTop = slideRefs.current[idx].offsetTop
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      entries => {
        if (isScrollingToTop.current) return
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          const idx = Number(entry.target.dataset.index)
          prevIndex.current = currIndex.current
          currIndex.current = idx

          const scrollingBack = currIndex.current < prevIndex.current
          setShowBackToTop(scrollingBack && currIndex.current > 1)

          if ('vibrate' in navigator) navigator.vibrate(10)
        })
      },
      { root: containerRef.current, threshold: 0.6 }
    )

    slideRefs.current.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!showFavorites) return
    const onKey = e => { if (e.key === 'Escape') setShowFavorites(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showFavorites])

  const scrollToTop = useCallback(() => {
    if (!containerRef.current) return
    isScrollingToTop.current = true
    setShowBackToTop(false)
    containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    const check = () => {
      if (!containerRef.current) return
      if (containerRef.current.scrollTop !== 0) {
        requestAnimationFrame(check)
      } else {
        isScrollingToTop.current = false
      }
    }
    requestAnimationFrame(check)
  }, [])

  const navigateToQuote = useCallback(id => {
    const idx = quotesData.findIndex(q => q.id === id)
    if (idx === -1) return
    setShowFavorites(false)
    if (containerRef.current && slideRefs.current[idx]) {
      containerRef.current.scrollTo({ top: slideRefs.current[idx].offsetTop, behavior: 'smooth' })
    }
  }, [])

  return (
    <div ref={containerRef} className="scroll-container">
      <div className={`back-to-top${showBackToTop ? ' visible' : ''}`}>
        <button type="button" onClick={scrollToTop} className="back-to-top-btn">
          Back to Top
        </button>
      </div>

      <button
        type="button"
        className="favorites-trigger"
        onClick={() => setShowFavorites(true)}
        aria-label="Open saved quotes"
      >
        <BookmarkIcon filled={favorites.length > 0} />
      </button>

      <div
        className={`favorites-panel${showFavorites ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Saved quotes"
        aria-hidden={!showFavorites}
      >
        <div className="favorites-header">
          <span className="favorites-title">Saved Quotes</span>
          <button
            type="button"
            className="favorites-close"
            onClick={() => setShowFavorites(false)}
            aria-label="Close saved quotes"
          >
            <CloseIcon />
          </button>
        </div>

        {favoriteQuotes.length === 0 ? (
          <div className="favorites-empty">
            <svg
              className="favorites-empty-icon"
              viewBox="0 0 24 24"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <p className="favorites-empty-text">No saved quotes yet</p>
          </div>
        ) : (
          <div className="favorites-list">
            {favoriteQuotes.map(quote => (
              <div
                key={quote.id}
                className="favorite-item"
                onClick={() => navigateToQuote(quote.id)}
                role="button"
                tabIndex={showFavorites ? 0 : -1}
                onKeyDown={e => e.key === 'Enter' && navigateToQuote(quote.id)}
              >
                <div className="favorite-item-text-block">
                  <p className="favorite-item-quote">&#8220;{quote.text}&#8221;</p>
                  <p className="favorite-item-attribution">&#8212; {quote.attribution}</p>
                </div>
                <button
                  type="button"
                  className="favorite-remove"
                  aria-label="Remove from favorites"
                  tabIndex={showFavorites ? 0 : -1}
                  onClick={e => { e.stopPropagation(); toggleFavorite(quote.id) }}
                >
                  <CloseIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {quotesData.map((quote, idx) => (
        <section
          key={quote.id}
          ref={el => { slideRefs.current[idx] = el }}
          data-index={idx}
          className="slide"
        >
          <div
            className="bg-layer"
            style={{ backgroundImage: `url(${import.meta.env.BASE_URL}${quote.bg.replace(/^\//, '')})` }}
          />
          <div className="bg-overlay" />
          <div className="quote-content">
            <h1 className="quote-text">&#8220;{quote.text}&#8221;</h1>
            <p className="quote-attribution">&#8212; {quote.attribution}</p>
          </div>
          <button
            type="button"
            className={`bookmark-btn${isFavorite(quote.id) ? ' is-favorited' : ''}`}
            onClick={() => toggleFavorite(quote.id)}
            aria-label={isFavorite(quote.id) ? 'Remove from favorites' : 'Add to favorites'}
          >
            <BookmarkIcon filled={isFavorite(quote.id)} />
          </button>
        </section>
      ))}

      <section
        ref={el => { slideRefs.current[quotesData.length] = el }}
        data-index={quotesData.length}
        className="end-screen"
      >
        <p className="end-label">No more quotes</p>
        <button type="button" onClick={scrollToTop} className="end-btn">
          Return to Start
        </button>
      </section>
    </div>
  )
}

export default App
