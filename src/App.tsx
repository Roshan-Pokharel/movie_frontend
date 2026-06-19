import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Navbar      from './components/Navbar'
import Home        from './pages/Home'
import Search      from './pages/Search'
import Library     from './pages/Library'
import Ratings     from './pages/Ratings'
import MovieDetail from './pages/MovieDetail'

function AppInner() {
  const location = useLocation()
  const [statsOpen, setStatsOpen] = useState(false)
  const isHome = location.pathname === '/'

  const openStats  = useCallback(() => setStatsOpen(true),  [])
  const closeStats = useCallback(() => setStatsOpen(false), [])

  return (
    <>
      <Navbar onStatsOpen={isHome ? openStats : undefined} />
      <main className="page-content">
        <div className="container">
          <Routes>
            <Route path="/"          element={<Home statsOpen={statsOpen} onStatsClose={closeStats} />} />
            <Route path="/search"    element={<Search />} />
            <Route path="/watched"   element={<Library />} />
            <Route path="/bookmarks" element={<Library />} />
            <Route path="/favorites" element={<Library />} />
            <Route path="/ratings"   element={<Ratings />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      {/* Backdrop for stats drawer */}
      <div
        className={`stats-drawer-backdrop${statsOpen ? ' visible' : ''}`}
        onClick={closeStats}
      />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ThemeProvider>
  )
}
