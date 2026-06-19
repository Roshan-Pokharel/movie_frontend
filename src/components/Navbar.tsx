import { NavLink } from 'react-router-dom'
import { Moon, Sun, Clapperboard, Home, Search, Trophy, Eye, Bookmark, Heart, BarChart2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const NAV_LINKS = [
  { to: '/',          label: 'Home',      Icon: Home     },
  { to: '/search',    label: 'Search',    Icon: Search   },
  { to: '/ratings',   label: 'Ratings',   Icon: Trophy   },
  { to: '/watched',   label: 'Watched',   Icon: Eye      },
  { to: '/bookmarks', label: 'Bookmarks', Icon: Bookmark },
  { to: '/favorites', label: 'Favorites', Icon: Heart    },
]

interface Props {
  onStatsOpen?: () => void
}

export default function Navbar({ onStatsOpen }: Props) {
  const { isDark, toggle } = useTheme()

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="container navbar-inner">
          {/* Logo */}
          <NavLink to="/" className="navbar-logo" aria-label="WatchVault Home">
            <div className="navbar-logo-icon">
              <Clapperboard size={20} />
            </div>
            <span className="navbar-logo-text">
              Watch<span>Vault</span>
            </span>
          </NavLink>

          {/* Centered nav links */}
          <ul className="navbar-nav" role="list">
            {NAV_LINKS.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Stats hamburger — mobile only, shows on home page */}
            {onStatsOpen && (
              <button
                className="btn-icon stats-hamburger"
                onClick={onStatsOpen}
                title="My Stats"
                aria-label="View stats"
              >
                <BarChart2 size={20} />
              </button>
            )}
            <button
              className="theme-toggle"
              onClick={toggle}
              title="Toggle dark mode"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {NAV_LINKS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
          >
            <Icon className="mn-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
