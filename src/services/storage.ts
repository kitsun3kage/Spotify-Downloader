import type { AppSettings } from '../types/app'
import type { DownloadItem } from '../types/download'

const keys = {
  downloads: 'spotify-downloader-downloads',
  searchHistory: 'spotify-downloader-search-history',
  settings: 'spotify-downloader-settings',
  spotifyToken: 'spotify-downloader-access-token',
  refreshToken: 'spotify-downloader-refresh-token',
  tokenExpiresAt: 'spotify-downloader-token-expires-at',
} as const

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)

    if (!value) {
      return fallback
    }

    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/* -------------------------------------------------------------------------- */
/* Downloads                                                                  */
/* -------------------------------------------------------------------------- */

export function getDownloads(): DownloadItem[] {
  return readJson<DownloadItem[]>(keys.downloads, [])
}

export function saveDownloads(items: DownloadItem[]): void {
  const serializable = items.map(({ blobUrl: _blobUrl, ...item }) => item)

  writeJson(keys.downloads, serializable)
}

export function addDownloadHistory(item: DownloadItem): void {
  const downloads = getDownloads()

  const existing = downloads.filter(
    (entry) => entry.id !== item.id,
  )

  saveDownloads([item, ...existing].slice(0, 100))
}

export function getDownloadHistory(): DownloadItem[] {
  return getDownloads()
}

export function saveDownloadHistory(items: DownloadItem[]): void {
  saveDownloads(items)
}

export function clearDownloadHistory(): void {
  localStorage.removeItem(keys.downloads)
}

/* -------------------------------------------------------------------------- */
/* Search history                                                             */
/* -------------------------------------------------------------------------- */

export function getSearchHistory(): string[] {
  return readJson<string[]>(keys.searchHistory, [])
}

export function saveSearchHistory(items: string[]): void {
  writeJson(
    keys.searchHistory,
    Array.from(new Set(items)).slice(0, 50),
  )
}

export function addSearchHistory(query: string): void {
  const trimmed = query.trim()

  if (!trimmed) {
    return
  }

  const history = getSearchHistory()

  saveSearchHistory([
    trimmed,
    ...history.filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase(),
    ),
  ])
}

export function clearSearchHistory(): void {
  localStorage.removeItem(keys.searchHistory)
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

const defaultSettings: AppSettings = {
  autoStartDownloads: true,
  concurrentDownloads: 3,
  defaultFormat: 'mp3',
  defaultQuality: '320kbps',
  theme: 'dark',
}

export function getSettings(): AppSettings {
  return readJson<AppSettings>(
    keys.settings,
    defaultSettings,
  )
}

export function saveSettings(settings: AppSettings): void {
  writeJson(keys.settings, settings)
}

/* -------------------------------------------------------------------------- */
/* Spotify OAuth                                                              */
/* -------------------------------------------------------------------------- */

export function getSpotifyToken(): string | null {
  return localStorage.getItem(keys.spotifyToken)
}

export function saveSpotifyToken(token: string): void {
  localStorage.setItem(keys.spotifyToken, token)
}

export function clearSpotifyToken(): void {
  localStorage.removeItem(keys.spotifyToken)
}

export function getAccessToken(): string | null {
  return getSpotifyToken()
}

export function saveAccessToken(token: string): void {
  saveSpotifyToken(token)
}

export function removeAccessToken(): void {
  clearSpotifyToken()
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(keys.refreshToken)
}

export function saveRefreshToken(token: string): void {
  localStorage.setItem(keys.refreshToken, token)
}

export function removeRefreshToken(): void {
  localStorage.removeItem(keys.refreshToken)
}

export function getTokenExpiresAt(): number {
  const value = localStorage.getItem(keys.tokenExpiresAt)

  if (!value) {
    return 0
  }

  const timestamp = Number(value)

  return Number.isFinite(timestamp)
    ? timestamp
    : 0
}

export function saveTokenExpiresAt(timestamp: number): void {
  localStorage.setItem(
    keys.tokenExpiresAt,
    String(timestamp),
  )
}

export function clearSpotifyTokens(): void {
  clearSpotifyToken()
  removeRefreshToken()
  localStorage.removeItem(keys.tokenExpiresAt)
}
