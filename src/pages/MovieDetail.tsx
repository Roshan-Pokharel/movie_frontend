import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Eye, Bookmark, Heart, Star, ArrowLeft } from 'lucide-react'
import { api } from '../services/api'
import type { Movie } from '../types'

const TIERS = ['SSS', 'S+', 'S', 'A', 'B', 'C', 'D', 'E', 'F']

const TIER_COLORS: Record<string, string> = {
  SSS: '#FF6B6B', 'S+': '#FF8E53', S: '#FFA726',
  A: '#84CC16', B: '#60A5FA', C: '#AB47BC',
  D: '#A8A29E', E: '#78716C', F: '#44403C',
}

export default function MovieDetail() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const [movie,   setMovie]    = useState<Movie | null>(null)
  const [loading, setLoading]  = useState(true)
  const [saving,  setSaving]   = useState(false)
  const [note,    setNote]     = useState('')
  const [noteEdit,setNoteEdit] = useState(false)

  useEffect(() => {
    if (!id) return
    api.details(id)
      .then(d => { setMovie(d.movie); setNote(d.movie?.notes || '') })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const toggle = async (field: 'watched' | 'bookmarked' | 'favorite') => {
    if (!movie || saving) return
    setSaving(true)
    const newVal = !movie[field]
    const result = movie._id
      ? await api.update(movie._id, { [field]: newVal })
      : await api.save({ imdbId: movie.imdbId || movie.imdbID, [field]: newVal })
    setMovie(result.movie)
    setSaving(false)
  }

  const setRating = async (tier: string) => {
    if (!movie || saving) return
    setSaving(true)
    const newRating = movie.personalRating === tier ? '' : tier
    const result = movie._id
      ? await api.update(movie._id, { personalRating: newRating })
      : await api.save({ imdbId: movie.imdbId || movie.imdbID, personalRating: newRating })
    setMovie(result.movie)
    setSaving(false)
  }

  const saveNote = async () => {
    if (!movie) return
    setSaving(true)
    const result = movie._id
      ? await api.update(movie._id, { notes: note })
      : await api.save({ imdbId: movie.imdbId || movie.imdbID, notes: note })
    setMovie(result.movie)
    setNoteEdit(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="loading-grid" style={{ maxWidth: 700, marginTop: 'var(--space-8)' }}>
        <div className="skeleton-card">
          <div className="skeleton skeleton-poster" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-line wide" />
            <div className="skeleton skeleton-line short" />
          </div>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎬</div>
        <p className="empty-title">Movie not found</p>
        <button className="search-btn" style={{ marginTop: 'var(--space-4)' }} onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    )
  }

  const poster   = movie.poster   || movie.Poster   || ''
  const title    = movie.title    || movie.Title    || 'Unknown'
  const year     = movie.year     || movie.Year     || ''
  const type     = movie.type     || movie.Type     || ''
  const plot     = movie.plot     || movie.Plot     || ''
  const director = movie.director || movie.Director || ''
  const actors   = movie.actors   || movie.Actors   || ''
  const awards   = movie.awards   || movie.Awards   || ''
  const genres   = Array.isArray(movie.genre)
    ? (movie.genre as string[])
    : (movie.genre || movie.Genre || '').toString().split(', ').filter(Boolean)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginBottom: 'var(--space-5)', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--color-fg-muted)', fontSize: 'var(--text-sm)',
          fontWeight: 500, padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden' }}>
        {/* Hero: poster + info */}
        <div className="movie-detail-header">
          <div className="movie-detail-poster">
            {poster
              ? <img src={poster} alt={title} />
              : <div className="movie-detail-poster-placeholder"><span style={{ fontSize: 48 }}>🎬</span></div>
            }
          </div>

          <div className="movie-detail-info">
            {type && (
              <span className={`movie-card-type-badge ${type === 'series' ? 'series' : 'movie'}`} style={{ marginBottom: 'var(--space-2)', display: 'inline-block' }}>
                {type === 'series' ? 'TV Series' : 'Movie'}
              </span>
            )}
            <h1 className="movie-detail-title">{title}</h1>

            <div className="movie-detail-meta">
              {year && <span className="meta-chip">{year}</span>}
              {movie.runtime  && <span className="meta-chip">{movie.runtime || movie.Runtime}</span>}
              {movie.imdbRating && (
                <span className="meta-chip imdb">
                  <Star size={12} /> {movie.imdbRating}
                </span>
              )}
            </div>

            {genres.length > 0 && (
              <div className="detail-genres">
                {genres.map(g => <span key={g} className="detail-genre-tag">{g}</span>)}
              </div>
            )}

            {plot && <p className="movie-detail-plot">{plot}</p>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="movie-actions-grid">
          <button
            className={`action-btn${movie.watched    ? ' active'     : ''}`}
            onClick={() => toggle('watched')}
            disabled={saving}
          >
            <Eye size={22} />
            <span>{movie.watched ? 'Watched' : 'Watched'}</span>
          </button>
          <button
            className={`action-btn${movie.bookmarked ? ' active'     : ''}`}
            onClick={() => toggle('bookmarked')}
            disabled={saving}
          >
            <Bookmark size={22} />
            <span>{movie.bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
          <button
            className={`action-btn${movie.favorite   ? ' active-red' : ''}`}
            onClick={() => toggle('favorite')}
            disabled={saving}
          >
            <Heart size={22} />
            <span>{movie.favorite ? 'Favorited' : 'Favorite'}</span>
          </button>
        </div>

        {/* Rating */}
        <div className="rating-selector">
          <p className="rating-selector-label">
            <Star size={16} /> Personal Rating
          </p>
          <div className="tier-selector-grid">
            {TIERS.map(t => (
              <button
                key={t}
                data-tier={t}
                className={`tier-btn${movie.personalRating === t ? ' selected' : ''}`}
                style={{
                  borderColor: TIER_COLORS[t],
                  ...(movie.personalRating !== t
                    ? { color: TIER_COLORS[t] }
                    : {}),
                }}
                onClick={() => setRating(t)}
                disabled={saving}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Director */}
        {director && (
          <div className="cast-section">
            <p className="cast-title">Director</p>
            <p className="cast-text">{director}</p>
          </div>
        )}

        {/* Cast */}
        {actors && (
          <div className="cast-section">
            <p className="cast-title">Cast</p>
            <p className="cast-text">{actors}</p>
          </div>
        )}

        {/* Awards */}
        {awards && awards !== 'N/A' && (
          <div className="cast-section">
            <p className="cast-title">Awards</p>
            <p className="cast-text">{awards}</p>
          </div>
        )}

        {/* Notes */}
        <div className="notes-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <p className="rating-selector-label" style={{ margin: 0 }}>Notes</p>
            {!noteEdit && (
              <button
                onClick={() => setNoteEdit(true)}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600 }}
              >
                Edit
              </button>
            )}
          </div>
          {noteEdit ? (
            <div>
              <textarea
                className="notes-textarea"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add your notes about this title..."
                rows={3}
              />
            </div>
          ) : (
            <p style={{ fontSize: 'var(--text-sm)', color: movie.notes ? 'var(--color-fg)' : 'var(--color-fg-subtle)', lineHeight: 'var(--leading-relaxed)' }}>
              {movie.notes || 'No notes yet.'}
            </p>
          )}
        </div>

        {noteEdit && (
          <button className="modal-save-btn" onClick={saveNote} disabled={saving}>
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        )}
      </div>
    </div>
  )
}
