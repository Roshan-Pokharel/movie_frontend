import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, Bookmark, Heart } from 'lucide-react'
import { api } from '../services/api'
import type { Movie } from '../types'
import MovieCard from '../components/MovieCard'

type Tab = 'watched' | 'bookmarks' | 'favorites'

const TABS: { key: Tab; label: string; Icon: typeof Eye }[] = [
  { key: 'watched',   label: 'Watched',   Icon: Eye      },
  { key: 'bookmarks', label: 'Bookmarks', Icon: Bookmark },
  { key: 'favorites', label: 'Favorites', Icon: Heart    },
]

const TAB_ICONS = { watched: Eye, bookmarks: Bookmark, favorites: Heart }

export default function Library() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = (location.pathname.slice(1) as Tab) || 'watched'

  const [movies,  setMovies]  = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (tab: Tab) => {
    setLoading(true)
    try {
      const data =
        tab === 'watched'   ? await api.watched({ limit: 200 }) :
        tab === 'bookmarks' ? await api.bookmarks() :
                              await api.favorites()
      setMovies(data.movies || [])
    } catch (_) {}
    setLoading(false)
  }, [])

  useEffect(() => { load(activeTab) }, [activeTab, load])

  const handleAction = async (action: 'watch' | 'bookmark' | 'favorite', imdbId: string) => {
    const saved  = movies.find(m => (m.imdbId || m.imdbID) === imdbId)
    const field  = action === 'watch' ? 'watched' : action === 'bookmark' ? 'bookmarked' : 'favorite'
    const newVal = !saved?.[field]
    const result = saved?._id
      ? await api.update(saved._id, { [field]: newVal })
      : await api.save({ imdbId, [field]: newVal })
    const updated: Movie = result.movie
    // Remove from list if it no longer belongs in this tab
    const stillBelongs =
      (activeTab === 'watched'   && updated.watched)   ||
      (activeTab === 'bookmarks' && updated.bookmarked) ||
      (activeTab === 'favorites' && updated.favorite)
    setMovies(prev =>
      stillBelongs
        ? prev.map(m => (m.imdbId || m.imdbID) === imdbId ? updated : m)
        : prev.filter(m => (m.imdbId || m.imdbID) !== imdbId)
    )
  }

  const TitleIcon = TAB_ICONS[activeTab]
  const countEl   = <span className="view-count">{movies.length} title{movies.length !== 1 ? 's' : ''}</span>

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => navigate(`/${key}`)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${activeTab === key ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: activeTab === key ? 'var(--color-primary-muted)' : 'var(--card-bg)',
              color: activeTab === key ? 'var(--color-primary)' : 'var(--color-fg-muted)',
              fontWeight: activeTab === key ? 600 : 500,
              fontSize: 'var(--text-sm)',
              display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer',
              transition: 'all var(--duration-fast)',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="view-header">
        <h2 className="view-title">
          <TitleIcon className="view-title-icon" />
          {TABS.find(t => t.key === activeTab)?.label}
        </h2>
        {countEl}
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-poster" />
              <div className="skeleton-body"><div className="skeleton skeleton-line wide" /></div>
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><TitleIcon size={56} /></div>
          <p className="empty-title">Nothing here yet</p>
          <p className="empty-desc">Search and save movies to see them here</p>
        </div>
      ) : (
        <div className="movies-grid fade-in">
          {movies.map(m => (
            <MovieCard key={m._id || m.imdbId} movie={m} onQuickAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  )
}
