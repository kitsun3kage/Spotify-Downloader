import type { DownloadItem } from '../types/download'
import type { AppSettings } from '../types/app'

const keys = {
  downloads: 'spotify-downloader-downloads',
  history: 'spotify-downloader-history',
  settings: 'spotify-downloader-settings',
  accessToken: 'spotify-downloader-access-token',
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

export function getDownloadHistory(): DownloadItem[] {
  return readJson<DownloadItem[]>(keys.downloads, [])
}

export function saveDownloadHistory(items: DownloadItem[]): void {
  const serializableItems = items.slice(0, 100).map((item) => {
    const { blobUrl: _blobUrl, ...rest } = item
    return rest
  })

  writeJson(keys.downloads, serializableItems)
}

export function clearDownloadHistory(): void {
  localStorage.removeItem(keys.downloads)
}

export function getHistory(): DownloadItem[] {
  return readJson<DownloadItem[]>(keys.history, [])
}

export function saveHistory(items: DownloadItem[]): void {
  const serializableItems = items.slice(0, 100).map((item) => {
    const { blobUrl: _blobUrl, ...rest } = item
    return rest
  })

  writeJson(keys.history, serializableItems)
}

export function addToHistory(item: DownloadItem): void {
  const history = getHistory()

  const filtered = history.filter((entry) => entry.id !== item.id)

  saveHistory([item, ...filtered])
}

export function clearHistory(): void {
  localStorage.removeItem(keys.history)
}

export function getSettings(): AppSettings {
  return readJson<AppSettings>(keys.settings, {
    autoStartDownloads: true,
    concurrentDownloads: 3,
    defaultFormat: 'mp3',
    defaultQuality: '320kbps',
    theme: 'dark',
  })
}

export function saveSettings(settings: AppSettings): void {
  writeJson(keys.settings, settings)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(keys.accessToken)
}

export function saveAccessToken(token: string): void {
  localStorage.setItem(keys.accessToken, token)
}

export function removeAccessToken(): void {
  localStorage.removeItem(keys.accessToken)
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

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}

export function saveTokenExpiresAt(timestamp: number): void {
  localStorage.setItem(keys.tokenExpiresAt, String(timestamp))
}

export function clearSpotifyTokens(): void {
  removeAccessToken()
  removeRefreshToken()
  localStorage.removeItem(keys.tokenExpiresAt)
}
