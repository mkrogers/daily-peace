import { useState, useRef, useEffect, useCallback } from 'react'
import quotesData from './data/quotes.json'
import './App.css'

function getDateSeed() {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

function useQuotes() {
  const [displayQuotes, setDisplayQuotes] = useState([])
  const [nextIndex, setNextIndex] = useState(0)

  useEffect(() => {
    const seed = getDateSeed()
    const startOffset = seed % quotesData.length
    const initial = quotesData.slice(startOffset, startOffset + 5)
    setDisplayQuotes(initial)
    setNextIndex(startOffset + 5)
  }, [])

  const loadMore = useCallback(() => {
    if (nextIndex >= quotesData.length) return
    const batch = quotesData.slice(nextIndex, nextIndex + 5)
    setDisplayQuotes(prev => [...prev, ...batch])
    setNextIndex(prev => prev + 5)
  }, [nextIndex])

  return { displayQuotes, loadMore, hasMore: nextIndex < quotesData.length }
}

function App() {
  const { displayQuotes, loadMore, hasMore } = useQuotes()
  const containerRef = useRef(null)
  const slideRefs = useRef([])
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [bookmarked, setBookmarked] = useState(null)
  const currIndex = useRef(0)
  const prevIndex = useRef(0)
  const isScrollingToTop = useRef(false)

  const holdTimer = useRef(null)

  // IntersectionObserver: track current slide, show Back to Top, auto-load more
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

          if (hasMore && currIndex.current >= displayQuotes.length - 2) loadMore()
        })
      },
      { root: containerRef.current, threshold: 0.6 }
    )

    slideRefs.current.forEach(el => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [displayQuotes, hasMore, loadMore])

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

  const startHold = useCallback(idx => {
    holdTimer.current = setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem('bookmarks') || '[]')
      if (!saved.includes(idx)) {
        localStorage.setItem('bookmarks', JSON.stringify([...saved, idx]))
      }
      setBookmarked(idx)
      if ('vibrate' in navigator) navigator.vibrate(25)
      setTimeout(() => setBookmarked(null), 1200)
    }, 500)
  }, [])

  const cancelHold = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }, [])

  return (
    <div ref={containerRef} className="scroll-container">
      <div className={`back-to-top${showBackToTop ? ' visible' : ''}`}>
        <button type="button" onClick={scrollToTop} className="back-to-top-btn">
          Back to Top
        </button>
      </div>

      {displayQuotes.map((quote, idx) => (
        <section
          key={`${idx}-${quote.id}`}
          ref={el => { slideRefs.current[idx] = el }}
          data-index={idx}
          className="slide"
          onMouseDown={() => startHold(idx)}
          onMouseUp={cancelHold}
          onTouchStart={() => startHold(idx)}
          onTouchEnd={cancelHold}
        >
          <div
            className="bg-layer"
            style={{ backgroundImage: `url(${quote.bg})` }}
          />
          <div className="bg-overlay" />
          {bookmarked === idx && (
            <div className="bookmark-heart" aria-hidden="true">❤️</div>
          )}
          <div className="quote-content">
            <h1 className="quote-text">"{quote.text}"</h1>
            <p className="quote-attribution">— {quote.attribution}</p>
          </div>
        </section>
      ))}

      {!hasMore && (
        <section
          ref={el => { slideRefs.current[displayQuotes.length] = el }}
          data-index={displayQuotes.length}
          className="end-screen"
        >
          <p className="end-label">No more quotes</p>
          <button type="button" onClick={scrollToTop} className="end-btn">
            Return to Start
          </button>
        </section>
      )}
    </div>
  )
}

export default App
