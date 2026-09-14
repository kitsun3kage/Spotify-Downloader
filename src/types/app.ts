import type {
  AudioFormat,
  AudioQuality,
} from './download'

export type Theme = 'dark' | 'light' | 'system'

export interface AppSettings {
  autoStartDownloads: boolean
  concurrentDownloads: number
  defaultFormat: AudioFormat
  defaultQuality: AudioQuality
  theme: Theme
}

export type AppScreen =
  | 'home'
  | 'search'
  | 'playlists'
  | 'downloads'
  | 'history'
  | 'settings'

export type BottomTab =
  | 'home'
  | 'search'
  | 'playlists'
  | 'downloads'
  | 'history'
  | 'settings'
