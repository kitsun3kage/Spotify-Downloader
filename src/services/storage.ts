import type { AppSettings } from '../types/app'
import type { DownloadItem } from '../types/download'
import { defaultSettings } from '../types/app'

const keys = {
  downloads:
    'spotify-downloader-downloads',

  searchHistory:
    'spotify-downloader-search-history',

  settings:
    'spotify-downloader-settings',

  spotifyToken:
    'spotify-downloader-spotify-token',

  refreshToken:
    'spotify-downloader-refresh-token',

  tokenExpiresAt:
    'spotify-downloader-token-expires-at',
} as const

function readJson<T>(
  key: string,
  fallback: T,
): T {
  try {
    const value =
      localStorage.getItem(key)

    if (!value) {
      return fallback
    }

    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(
  key: string,
  value: T,
): void {
  localStorage.setItem(
    key,
    JSON.stringify(value),
  )
}

/* -------------------------------------------------------------------------- */
/* DOWNLOADS                                                                  */
/* -------------------------------------------------------------------------- */

export function getDownloads(): DownloadItem[] {
  return readJson<DownloadItem[]>(
    keys.downloads,
    [],
  )
}

export function saveDownloads(
  items: DownloadItem[],
): void {
  const serializable = items.map(
    ({
      blobUrl: _blobUrl,
      ...item
    }) => item,
  )

  writeJson(
    keys.downloads,
    serializable,
  )
}

export function addDownloadHistory(
  item: DownloadItem,
): void {
  const current =
    getDownloads()

  const filtered =
    current.filter(
      (entry) =>
        entry.id !== item.id,
    )

  saveDownloads([
    item,
    ...filtered,
  ].slice(0, 100))
}

export function getDownloadHistory(): DownloadItem[] {
  return getDownloads()
}

export function saveDownloadHistory(
  items: DownloadItem[],
): void {
  saveDownloads(items)
}

export function clearDownloadHistory(): void {
  localStorage.removeItem(
    keys.downloads,
  )
}

/* -------------------------------------------------------------------------- */
/* SEARCH HISTORY                                                             */
/* -------------------------------------------------------------------------- */

export function getSearchHistory(): string[] {
  return readJson<string[]>(
    keys.searchHistory,
    [],
  )
}

export function saveSearchHistory(
  items: string[],
): void {
  writeJson(
    keys.searchHistory,
    Array.from(
      new Set(items),
    ).slice(0, 50),
  )
}

export function addSearchHistory(
  query: string,
): void {
  const value =
    query.trim()

  if (!value) {
    return
  }

  const history =
    getSearchHistory()

  saveSearchHistory([
    value,
    ...history.filter(
      (item) =>
        item.toLowerCase() !==
        value.toLowerCase(),
    ),
  ])
}

export function clearSearchHistory(): void {
  localStorage.removeItem(
    keys.searchHistory,
  )
}

/* -------------------------------------------------------------------------- */
/* SETTINGS                                                                   */
/* -------------------------------------------------------------------------- */

export function getSettings(): AppSettings {
  const stored =
    readJson<Partial<AppSettings>>(
      keys.settings,
      {},
    )

  return {
    ...defaultSettings,
    ...stored,
  }
}

export function saveSettings(
  settings: AppSettings,
): void {
  writeJson(
    keys.settings,
    settings,
  )
}

/* -------------------------------------------------------------------------- */
/* SPOTIFY TOKEN                                                              */
/* -------------------------------------------------------------------------- */

export interface StoredSpotifyToken {
  access_token: string
  token_type: string
  expires_in: number
  expires_at: number
  refresh_token?: string
  scope?: string
}

export function getSpotifyToken():
  StoredSpotifyToken | null {
  const value =
    localStorage.getItem(
      keys.spotifyToken,
    )

  if (!value) {
    return null
  }

  try {
    return JSON.parse(
      value,
    ) as StoredSpotifyToken
  } catch {
    return null
  }
}

export function saveSpotifyToken(
  token: StoredSpotifyToken,
): void {
  localStorage.setItem(
    keys.spotifyToken,
    JSON.stringify(token),
  )
}

export function clearSpotifyToken(): void {
  localStorage.removeItem(
    keys.spotifyToken,
  )
}

export function getAccessToken():
  string | null {
  const token =
    getSpotifyToken()

  return token?.access_token ?? null
}

export function saveAccessToken(
  token: string,
): void {
  const existing =
    getSpotifyToken()

  saveSpotifyToken({
    access_token: token,
    token_type:
      existing?.token_type ||
      'Bearer',
    expires_in:
      existing?.expires_in ||
      3600,
    expires_at:
      existing?.expires_at ||
      Date.now() + 3600000,
    refresh_token:
      existing?.refresh_token,
    scope:
      existing?.scope,
  })
}

export function removeAccessToken(): void {
  clearSpotifyToken()
}

export function getRefreshToken():
  string | null {
  return localStorage.getItem(
    keys.refreshToken,
  )
}

export function saveRefreshToken(
  token: string,
): void {
  localStorage.setItem(
    keys.refreshToken,
    token,
  )
}

export function removeRefreshToken(): void {
  localStorage.removeItem(
    keys.refreshToken,
  )
}

export function getTokenExpiresAt(): number {
  const token =
    getSpotifyToken()

  return token?.expires_at || 0
}

export function saveTokenExpiresAt(
  timestamp: number,
): void {
  const token =
    getSpotifyToken()

  if (!token) {
    return
  }

  saveSpotifyToken({
    ...token,
    expires_at: timestamp,
  })
}

export function clearSpotifyTokens(): void {
  clearSpotifyToken()
  removeRefreshToken()
  localStorage.removeItem(
    keys.tokenExpiresAt,
  )
}
