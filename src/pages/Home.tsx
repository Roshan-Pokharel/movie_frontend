import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, Tv2, Heart, Bookmark, Trophy, Flame, ChevronLeft, ChevronRight, BarChart2, X } from 'lucide-react'
import { api } from '../services/api'
import type { Movie, Stats } from '../types'
import MovieCard from '../components/MovieCard'

const STAT_ITEMS = [
  { key: 'totalWatched'   as keyof Stats, label: 'Movies Watched', Icon: Film,     nav: '/watched'   },
  { key: 'totalSeries'    as keyof Stats, label: 'TV Series',      Icon: Tv2,      nav: '/watched'   },
  { key: 'totalFavorites' as keyof Stats, label: 'Favorites',      Icon: Heart,    nav: '/favorites' },
  { key: 'totalBookmarks' as keyof Stats, label: 'Bookmarks',      Icon: Bookmark, nav: '/bookmarks' },
  { key: 'topRating'      as keyof Stats, label: 'Top Rating',     Icon: Trophy,   nav: '/ratings'   },
]

interface Props {
  statsOpen: boolean
  onStatsClose: () => void
}

export default function Home({ statsOpen, onStatsClose }: Props) {
  const navigate = useNavigate()
  const [stats,    setStats]    = useState<Stats | null>(null)
  const [movies,   setMovies]   = useState<Movie[]>([])
  const [series,   setSeries]   = useState<Movie[]>([])
  const [savedMap, setSavedMap] = useState<Record<string, Movie>>({})

  const load = useCallback(async () => {
    try {
      const [trendRes, statsRes, libRes] = await Promise.all([
        api.trending(), api.stats(), api.library({ limit: 9999 }),
      ])
      setMovies((trendRes.movies  || []).slice(0, 14))
      setSeries((trendRes.series  || []).slice(0, 14))
      setStats(statsRes.stats)
      const map: Record<string, Movie> = {}
      ;(libRes.movies || []).forEach((m: Movie) => {
        const id = m.imdbId || m.imdbID
        if (id) map[id] = m
      })
      setSavedMap(map)
    } catch (_) {}
  }, [])

  useEffect(() => { load() }, [load])

  const handleAction = async (action: 'watch' | 'bookmark' | 'favorite', imdbId: string) => {
    const saved  = savedMap[imdbId]
    const field  = action === 'watch' ? 'watched' : action === 'bookmark' ? 'bookmarked' : 'favorite'
    const newVal = !saved?.[field]
    const result = saved?._id
      ? await api.update(saved._id, { [field]: newVal })
      : await api.save({ imdbId, [field]: newVal })
    setSavedMap(prev => ({ ...prev, [imdbId]: result.movie }))
  }

  const enrich = (list: Movie[]) =>
    list.map(m => ({ ...m, ...(savedMap[m.imdbID || m.imdbId || ''] ?? {}) }))

  const statsGrid = stats && (
    <div className="stats-grid" aria-label="Dashboard statistics">
      {STAT_ITEMS.map(({ key, label, Icon, nav }) => (
        <div
          key={key}
          className="stat-card stat-card--link"
          onClick={() => { navigate(nav); onStatsClose() }}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && navigate(nav)}
        >
          <div className="stat-icon"><Icon size={28} /></div>
          <div className="stat-value">{stats[key] ?? '—'}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      {/* Stats drawer — inline on desktop, slide-in on mobile */}
      <div className={`stats-drawer${statsOpen ? ' open' : ''}`}>
        {/* Header (mobile only — hidden on desktop via CSS) */}
        <div className="stats-drawer-header">
          <span className="stats-drawer-title">
            <BarChart2 size={18} /> My Stats
          </span>
          <button
            className="stats-drawer-close"
            onClick={onStatsClose}
            aria-label="Close stats"
          >
            <X size={16} />
          </button>
        </div>
        {statsGrid}
      </div>

      <Carousel
        title="Trending Movies"
        icon={<Flame className="section-icon" />}
        movies={enrich(movies)}
        onAction={handleAction}
      />
      <Carousel
        title="Trending TV Series"
        icon={<Tv2 className="section-icon" />}
        movies={enrich(series)}
        onAction={handleAction}
      />
    </div>
  )
}

function Carousel({
  title, icon, movies, onAction,
}: {
  title: string
  icon: React.ReactNode
  movies: Movie[]
  onAction: (action: 'watch' | 'bookmark' | 'favorite', id: string) => Promise<void>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: number) =>
    ref.current?.scrollBy({ left: dir * 340, behavior: 'smooth' })

  if (!movies.length) return null

  return (
    <div className="trending-section">
      <div className="section-header">
        <div className="section-title">
          <span className="section-title-accent" aria-hidden="true" />
          {icon}
          {title}
        </div>
      </div>
      <div className="carousel-wrapper">
        <button className="carousel-btn prev" onClick={() => scroll(-1)} aria-label="Previous">
          <ChevronLeft size={18} />
        </button>
        <div className="carousel-container" ref={ref}>
          {movies.map((m, i) => (
            <div key={i} className="carousel-card">
              <MovieCard movie={m} onQuickAction={onAction} />
            </div>
          ))}
        </div>
        <button className="carousel-btn next" onClick={() => scroll(1)} aria-label="Next">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
