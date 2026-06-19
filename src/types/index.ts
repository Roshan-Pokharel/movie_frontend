export interface Movie {
  _id?: string
  imdbId?: string
  imdbID?: string
  title?: string
  Title?: string
  year?: string
  Year?: string
  type?: string
  Type?: string
  poster?: string
  Poster?: string
  imdbRating?: string | number
  imdbVotes?: string
  plot?: string
  Plot?: string
  director?: string
  Director?: string
  actors?: string
  Actors?: string
  genre?: string[] | string
  Genre?: string
  runtime?: string
  Runtime?: string
  country?: string
  Country?: string
  language?: string
  Language?: string
  awards?: string
  Awards?: string
  watched?: boolean
  bookmarked?: boolean
  favorite?: boolean
  personalRating?: string
  notes?: string
  watchedDate?: string
}

export interface Stats {
  totalWatched: number
  totalSeries: number
  totalFavorites: number
  totalBookmarks: number
  topRating: string
}
