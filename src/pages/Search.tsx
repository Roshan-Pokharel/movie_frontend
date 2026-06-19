import { useState, useCallback } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { api } from '../services/api'
import type { Movie } from '../types'
import MovieCard from '../components/MovieCard'

export default function Search() {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<Movie[]>([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(false)

  const doSearch = useCallback(async (q: string, p = 1) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const data = await api.search(q, '', p)
      const next = data.results || []
      setResults(prev => p === 1 ? next : [...prev, ...next])
      setTotal(data.total || 0)
      setPage(p)
    } catch (_) {}
    setLoading(false)
  }, [])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setResults([])
    doSearch(query, 1)
  }

  return (
    <div>
      {/* Search bar — same markup as the original */}
      <div className="search-section">
        <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="section-title">
            <span className="section-title-accent" aria-hidden="true" />
            <SearchIcon className="section-icon" />
            Search Movies &amp; Series
          </div>
        </div>

        <div className="search-bar-wrapper">
          <form className="search-input-group" role="search" onSubmit={onSubmit}>
            <span className="search-icon" aria-hidden="true">
              <SearchIcon size={18} />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search movies or TV series..."
              autoComplete="off"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button type="submit" className="search-btn" disabled={loading}>
              <SearchIcon size={16} />
              <span>Search</span>
            </button>
          </form>
        </div>

        <div className="search-meta-row">
          {total > 0 && (
            <span className="results-count">
              <strong>{total}</strong> result{total !== 1 ? 's' : ''} for &quot;{query}&quot;
            </span>
          )}
          {results.length > 0 && results.length < total && (
            <button
              className="load-more-btn"
              onClick={() => doSearch(query, page + 1)}
              disabled={loading}
            >
              {loading ? '...' : '+ Load More'}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div id="results-section" className="results-section">
        {loading && results.length === 0 ? (
          <div className="loading-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton skeleton-poster" />
                <div className="skeleton-body">
                  <div className="skeleton skeleton-line wide" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="movies-grid fade-in">
            {results.map((m, i) => <MovieCard key={i} movie={m} />)}
          </div>
        ) : query && !loading ? (
          <div className="empty-state">
            <div className="empty-icon"><SearchIcon size={56} /></div>
            <p className="empty-title">No results found</p>
            <p className="empty-desc">Try a different search term</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
