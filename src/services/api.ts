const API_URL = import.meta.env.VITE_API_URL
const BASE = `${API_URL}/api/movies`

const request = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok || !data.success) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }

  return data
}

const qs = (params: Record<string, string | number | boolean>) =>
  new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString()

export const api = {
  search: (q: string, type = '', page = 1) =>
    request(
      `${BASE}/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}&page=${page}`
    ),

  trending: () =>
    request(`${BASE}/trending`),

  stats: () =>
    request(`${BASE}/stats`),

  details: (imdbId: string) =>
    request(`${BASE}/${imdbId}`),

  library: (params: Record<string, string | number | boolean> = {}) =>
    request(`${BASE}/library?${qs(params)}`),

  favorites: () =>
    request(`${BASE}/favorites`),

  bookmarks: () =>
    request(`${BASE}/bookmarks`),

  watched: (params: Record<string, string | number | boolean> = {}) =>
    request(`${BASE}/watched?${qs(params)}`),

  ratings: () =>
    request(`${BASE}/ratings`),

  save: (body: object) =>
    request(BASE, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id: string, body: object) =>
    request(`${BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  remove: (id: string) =>
    request(`${BASE}/${id}`, {
      method: 'DELETE',
    }),
}