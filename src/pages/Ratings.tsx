import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { api } from '../services/api'
import type { Movie } from '../types'
import MovieCard from '../components/MovieCard'

const TIERS = ['SSS', 'S+', 'S', 'A', 'B', 'C', 'D', 'E', 'F']

const TIER_LABELS: Record<string, string> = {
  SSS: 'Masterpiece', 'S+': 'Exceptional', S: 'Excellent',
  A: 'Great', B: 'Good', C: 'Average', D: 'Below Average', E: 'Poor', F: 'Awful',
}

export default function Ratings() {
  const [ratings, setRatings] = useState<Record<string, Movie[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.ratings()
      .then(d => setRatings(d.ratings || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const populated = TIERS.filter(t => (ratings[t] || []).length > 0)

  return (
    <div>
      <div className="view-header">
        <h2 className="view-title">
          <Trophy className="view-title-icon" /> Ratings
        </h2>
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-poster" />
              <div className="skeleton-body"><div className="skeleton skeleton-line wide" /></div>
            </div>
          ))}
        </div>
      ) : populated.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Trophy size={56} /></div>
          <p className="empty-title">No ratings yet</p>
          <p className="empty-desc">Open a movie and assign a personal rating</p>
        </div>
      ) : (
        populated.map(tier => (
          <div key={tier} className="tier-section">
            <div className="tier-header">
              <span className="tier-badge" data-tier={tier}>{tier}</span>
              <span className="tier-label">{TIER_LABELS[tier]}</span>
              <span className="tier-count">
                {ratings[tier].length} title{ratings[tier].length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="tier-movies">
              {ratings[tier].map(m => (
                <div key={m._id || m.imdbId} className="carousel-card">
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
