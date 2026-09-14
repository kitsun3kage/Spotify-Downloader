import type { AppSettings } from '../types/app'
import { defaultSettings } from '../types/app'
import type { DownloadItem } from '../types/download'

const STORAGE_KEYS = {
  downloads: 'spotify-downloader-downloads',
  downloadHistory: 'spotify-downloader-download-history',
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
  expires_at: number
  refresh_token?: string
  scope?: string
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

function removeStorageItem(key: string): void {
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
  return readJSON<DownloadItem[]>(STORAGE_KEYS.downloads, [])
}

export function saveDownloads(items: DownloadItem[]): void {
  writeJSON(STORAGE_KEYS.downloads, items)
}

/* -------------------------------------------------------------------------- */
/* Download history                                                           */
/* -------------------------------------------------------------------------- */

export function getDownloadHistory(): DownloadItem[] {
  return readJSON<DownloadItem[]>(
    STORAGE_KEYS.downloadHistory,
    [],
  )
}

export function saveDownloadHistory(items: DownloadItem[]): void {
  writeJSON(STORAGE_KEYS.downloadHistory, items)
}

export function addDownloadHistory(item: DownloadItem): void {
  const history = getDownloadHistory()

  const historyItem: DownloadItem = {
    ...item,
    blobUrl: undefined,
  }

  const filteredHistory = history.filter(
    (existingItem) => existingItem.id !== item.id,
  )

  saveDownloadHistory([
    historyItem,
    ...filteredHistory,
  ])
}

export function clearDownloadHistory(): void {
  removeStorageItem(STORAGE_KEYS.downloadHistory)
}

/* -------------------------------------------------------------------------- */
/* Search history                                                             */
/* -------------------------------------------------------------------------- */

export function getSearchHistory(): string[] {
  return readJSON<string[]>(
    STORAGE_KEYS.searchHistory,
    [],
  )
}

export function saveSearchHistory(items: string[]): void {
  writeJSON(STORAGE_KEYS.searchHistory, items)
}

export function addSearchHistory(query: string): void {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return
  }

  const history = getSearchHistory()

  const filteredHistory = history.filter(
    (item) =>
      item.toLowerCase() !== normalizedQuery.toLowerCase(),
  )

  saveSearchHistory([
    normalizedQuery,
    ...filteredHistory,
  ].slice(0, 20))
}

export function clearSearchHistory(): void {
  removeStorageItem(STORAGE_KEYS.searchHistory)
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

export function getSettings(): AppSettings {
  const storedSettings = readJSON<Partial<AppSettings>>(
    STORAGE_KEYS.settings,
    {},
  )

  return {
    ...defaultSettings,
    ...storedSettings,
  }
}

export function saveSettings(settings: AppSettings): void {
  writeJSON(STORAGE_KEYS.settings, settings)
}

/* -------------------------------------------------------------------------- */
/* Spotify token                                                              */
/* -------------------------------------------------------------------------- */

export function getSpotifyToken(): StoredSpotifyToken | null {
  if (!isBrowser()) {
    return null
  }

  try {
    const rawValue = localStorage.getItem(
      STORAGE_KEYS.spotifyToken,
    )

    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as Partial<StoredSpotifyToken>

    if (
      typeof parsed.access_token !== 'string' ||
      typeof parsed.token_type !== 'string' ||
      typeof parsed.expires_in !== 'number'
    ) {
      return null
    }

    const expiresAt =
      typeof parsed.expires_at === 'number'
        ? parsed.expires_at
        : Date.now() + parsed.expires_in * 1000

    return {
      access_token: parsed.access_token,
      token_type: parsed.token_type,
      expires_in: parsed.expires_in,
      expires_at: expiresAt,
      refresh_token: parsed.refresh_token,
      scope: parsed.scope,
    }
  } catch {
    return null
  }
}

export function saveSpotifyToken(
  token: StoredSpotifyToken,
): void {
  const normalizedToken: StoredSpotifyToken = {
    access_token: token.access_token,
    token_type: token.token_type,
    expires_in: token.expires_in,
    expires_at:
      typeof token.expires_at === 'number'
        ? token.expires_at
        : Date.now() + token.expires_in * 1000,
    refresh_token: token.refresh_token,
    scope: token.scope,
  }

  writeJSON(
    STORAGE_KEYS.spotifyToken,
    normalizedToken,
  )
}

export function clearSpotifyToken(): void {
  removeStorageItem(STORAGE_KEYS.spotifyToken)
}

/* -------------------------------------------------------------------------- */
/* Access token                                                               */
/* -------------------------------------------------------------------------- */

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null
  }

  try {
    return localStorage.getItem(
      STORAGE_KEYS.accessToken,
    )
  } catch {
    return null
  }
}

export function saveAccessToken(token: string): void {
  if (!isBrowser()) {
    return
  }

  try {
    localStorage.setItem(
      STORAGE_KEYS.accessToken,
      token,
    )
  } catch {
    // Ignore localStorage errors.
  }
}

export function removeAccessToken(): void {
  removeStorageItem(STORAGE_KEYS.accessToken)
}

/* -------------------------------------------------------------------------- */
/* Refresh token                                                              */
/* -------------------------------------------------------------------------- */

export function getRefreshToken(): string | null {
  if (!isBrowser()) {
    return null
  }

  try {
    return localStorage.getItem(
      STORAGE_KEYS.refreshToken,
    )
  } catch {
    return null
  }
}

export function saveRefreshToken(token: string): void {
  if (!isBrowser()) {
    return
  }

  try {
    localStorage.setItem(
      STORAGE_KEYS.refreshToken,
      token,
    )
  } catch {
    // Ignore localStorage errors.
  }
}

export function removeRefreshToken(): void {
  removeStorageItem(STORAGE_KEYS.refreshToken)
}

/* -------------------------------------------------------------------------- */
/* Token expiry                                                               */
/* -------------------------------------------------------------------------- */

export function getTokenExpiry(): number | null {
  const token = getSpotifyToken()

  if (!token) {
    return null
  }

  return token.expires_at
}

export function isTokenExpired(
  bufferSeconds = 60,
): boolean {
  const expiresAt = getTokenExpiry()

  if (expiresAt === null) {
    return true
  }

  return (
    Date.now() >=
    expiresAt - bufferSeconds * 1000
  )
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
/* Clear application storage                                                  */
/* -------------------------------------------------------------------------- */

export function clearAllStorage(): void {
  removeStorageItem(STORAGE_KEYS.downloads)
  removeStorageItem(STORAGE_KEYS.downloadHistory)
  removeStorageItem(STORAGE_KEYS.searchHistory)
  removeStorageItem(STORAGE_KEYS.settings)

  clearSpotifyTokens()
}
