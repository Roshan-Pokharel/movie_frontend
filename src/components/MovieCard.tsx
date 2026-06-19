import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Bookmark, Heart, Star } from 'lucide-react'
import type { Movie } from '../types'

const TIER_COLORS: Record<string, string> = {
  SSS: '#FF6B6B', 'S+': '#FF8E53', S: '#FFA726',
  A: '#84CC16', B: '#60A5FA', C: '#AB47BC',
  D: '#A8A29E', E: '#78716C', F: '#44403C',
}

const getPoster = (m: Movie) =>
  m.poster || m.Poster || ''

const getId = (m: Movie) => m.imdbId || m.imdbID || ''

interface Props {
  movie: Movie
  onQuickAction?: (action: 'watch' | 'bookmark' | 'favorite', imdbId: string) => Promise<void>
}

export default function MovieCard({ movie, onQuickAction }: Props) {
  const navigate  = useNavigate()
  const [saving,  setSaving]  = useState(false)
  const poster    = getPoster(movie)
  const title     = movie.title || movie.Title || 'Unknown'
  const year      = movie.year  || movie.Year  || ''
  const imdbId    = getId(movie)
  const rating    = movie.personalRating
  const imdbScore = movie.imdbRating

  const handleAction = async (e: React.MouseEvent, action: 'watch' | 'bookmark' | 'favorite') => {
    e.stopPropagation()
    if (!onQuickAction || saving) return
    setSaving(true)
    await onQuickAction(action, imdbId)
    setSaving(false)
  }

  return (
    <div
      className="movie-card"
      onClick={() => navigate(`/movie/${imdbId}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/movie/${imdbId}`)}
    >
      {/* Poster */}
      <div className="movie-card-poster-wrap">
        {poster
          ? <img src={poster} alt={title} className="movie-card-poster" loading="lazy" />
          : <div className="movie-card-poster-placeholder">🎬</div>
        }

        {/* Status badges */}
        <div className="card-status-badges">
          {movie.watched    && <span className="status-badge watched"><Eye size={10} /></span>}
          {movie.bookmarked && <span className="status-badge bookmark"><Bookmark size={10} /></span>}
          {movie.favorite   && <span className="status-badge favorite"><Heart size={10} /></span>}
        </div>

        {/* Personal rating */}
        {rating && (
          <span
            className="card-rating-badge"
            data-tier={rating}
            style={{ background: `${TIER_COLORS[rating] ?? '#84CC16'}e6` }}
          >
            {rating}
          </span>
        )}

        {/* Hover overlay with quick actions */}
        {onQuickAction && (
          <div className="movie-card-overlay">
            <div className="movie-card-quick-actions">
              <button
                className={`quick-action-btn${movie.watched    ? ' active-watch' : ''}`}
                onClick={e => handleAction(e, 'watch')}
                title={movie.watched ? 'Remove from watched' : 'Mark as watched'}
                disabled={saving}
              >
                <Eye size={18} />
              </button>
              <button
                className={`quick-action-btn${movie.bookmarked ? ' active-book' : ''}`}
                onClick={e => handleAction(e, 'bookmark')}
                title={movie.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                disabled={saving}
              >
                <Bookmark size={18} />
              </button>
              <button
                className={`quick-action-btn${movie.favorite   ? ' active-fav' : ''}`}
                onClick={e => handleAction(e, 'favorite')}
                title={movie.favorite ? 'Remove from favorites' : 'Add to favorites'}
                disabled={saving}
              >
                <Heart size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="movie-card-body">
        <p className="movie-card-title">{title}</p>
        <div className="movie-card-meta">
          <span className="movie-card-year">{year}</span>
          {imdbScore && (
            <span className="movie-card-imdb">
              <Star size={12} />
              {imdbScore}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
