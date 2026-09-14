import type { AppSettings } from '../types/app'
import { defaultSettings } from '../types/app'
import type { DownloadItem } from '../types/download'

const KEYS = {
  downloads: 'spotify-downloader-downloads',
  history: 'spotify-downloader-history',
  searchHistory: 'spotify-downloader-search-history',
  settings: 'spotify-downloader-settings',
  spotifyToken: 'spotify-downloader-spotify-token',
  accessToken: 'spotify-downloader-access-token',
  refreshToken: 'spotify-downloader-refresh-token',
} as const

export interface StoredSpotifyToken {
  access_token: string
  token_type: string
  expires_in: number
  expires_at?: number
  refresh_token?: string
  scope?: string
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback
  }

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

function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore localStorage errors.
  }
}

function removeItem(key: string): void {
  if (!isBrowser()) {
    return
  }

  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore localStorage errors.
  }
}

/* -------------------------------------------------------------------------- */
/* Downloads                                                                  */
/* -------------------------------------------------------------------------- */

export function getDownloads(): DownloadItem[] {
  return readJSON<DownloadItem[]>(KEYS.downloads, [])
}

export function saveDownloads(items: DownloadItem[]): void {
  writeJSON(KEYS.downloads, items)
}

/* -------------------------------------------------------------------------- */
/* Download history                                                           */
/* -------------------------------------------------------------------------- */

export function getDownloadHistory(): DownloadItem[] {
  return readJSON<DownloadItem[]>(KEYS.history, [])
}

export function saveDownloadHistory(items: DownloadItem[]): void {
  writeJSON(KEYS.history, items)
}

export function addDownloadHistory(item: DownloadItem): void {
  const history = getDownloadHistory()

  const historyItem: DownloadItem = {
    ...item,
    blobUrl: undefined,
  }

  const filtered = history.filter((existing) => existing.id !== item.id)

  saveDownloadHistory([historyItem, ...filtered])
}

export function clearDownloadHistory(): void {
  removeItem(KEYS.history)
}

/* -------------------------------------------------------------------------- */
/* Search history                                                             */
/* -------------------------------------------------------------------------- */

export function getSearchHistory(): string[] {
  return readJSON<string[]>(KEYS.searchHistory, [])
}

export function saveSearchHistory(items: string[]): void {
  writeJSON(KEYS.searchHistory, items)
}

export function addSearchHistory(query: string): void {
  const normalized = query.trim()

  if (!normalized) {
    return
  }

  const history = getSearchHistory()

  const filtered = history.filter(
    (item) => item.toLowerCase() !== normalized.toLowerCase(),
  )

  saveSearchHistory([normalized, ...filtered].slice(0, 20))
}

export function clearSearchHistory(): void {
  removeItem(KEYS.searchHistory)
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

export function getSettings(): AppSettings {
  const stored = readJSON<Partial<AppSettings>>(KEYS.settings, {})

  return {
    ...defaultSettings,
    ...stored,
  }
}

export function saveSettings(settings: AppSettings): void {
  writeJSON(KEYS.settings, settings)
}

/* -------------------------------------------------------------------------- */
/* Spotify token                                                              */
/* -------------------------------------------------------------------------- */

export function getSpotifyToken(): StoredSpotifyToken | null {
  if (!isBrowser()) {
    return null
  }

  try {
    const value = localStorage.getItem(KEYS.spotifyToken)

    if (!value) {
      return null
    }

    return JSON.parse(value) as StoredSpotifyToken
  } catch {
    return null
  }
}

export function saveSpotifyToken(token: StoredSpotifyToken): void {
  writeJSON(KEYS.spotifyToken, token)
}

export function clearSpotifyToken(): void {
  removeItem(KEYS.spotifyToken)
}

/* -------------------------------------------------------------------------- */
/* Access token                                                               */
/* -------------------------------------------------------------------------- */

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null
  }

  try {
    return localStorage.getItem(KEYS.accessToken)
  } catch {
    return null
  }
}

export function saveAccessToken(token: string): void {
  if (!isBrowser()) {
    return
  }

  try {
    localStorage.setItem(KEYS.accessToken, token)
  } catch {
    // Ignore localStorage errors.
  }
}

export function removeAccessToken(): void {
  removeItem(KEYS.accessToken)
}

/* -------------------------------------------------------------------------- */
/* Refresh token                                                              */
/* -------------------------------------------------------------------------- */

export function getRefreshToken(): string | null {
  if (!isBrowser()) {
    return null
  }

  try {
    return localStorage.getItem(KEYS.refreshToken)
  } catch {
    return null
  }
}

export function saveRefreshToken(token: string): void {
  if (!isBrowser()) {
    return
  }

  try {
    localStorage.setItem(KEYS.refreshToken, token)
  } catch {
    // Ignore localStorage errors.
  }
}

export function removeRefreshToken(): void {
  removeItem(KEYS.refreshToken)
}

/* -------------------------------------------------------------------------- */
/* Token expiry                                                               */
/* -------------------------------------------------------------------------- */

export function getTokenExpiry(): number | null {
  const token = getSpotifyToken()

  if (!token) {
    return null
  }

  if (typeof token.expires_at === 'number') {
    return token.expires_at
  }

  if (typeof token.expires_in === 'number') {
    return Date.now() + token.expires_in * 1000
  }

  return null
}

export function isTokenExpired(bufferSeconds = 60): boolean {
  const expiry = getTokenExpiry()

  if (expiry === null) {
    return true
  }

  return Date.now() >= expiry - bufferSeconds * 1000
}

/* -------------------------------------------------------------------------- */
/* Clear Spotify authentication                                               */
/* -------------------------------------------------------------------------- */

export function clearSpotifyTokens(): void {
  clearSpotifyToken()
  removeAccessToken()
  removeRefreshToken()
}

/* -------------------------------------------------------------------------- */
/* Generic storage cleanup                                                    */
/* -------------------------------------------------------------------------- */

export function clearAllStorage(): void {
  removeItem(KEYS.downloads)
  removeItem(KEYS.history)
  removeItem(KEYS.searchHistory)
  removeItem(KEYS.settings)
  clearSpotifyTokens()
}
