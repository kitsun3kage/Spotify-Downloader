import type {
  AudioFormat,
  AudioQuality,
} from './download'

export type Page =
  | 'home'
  | 'search'
  | 'playlists'
  | 'downloads'
  | 'history'
  | 'settings'

export type AppScreen = Page

export type BottomTab = Page

export type Appearance =
  | 'dark'
  | 'light'
  | 'system'

export interface AppSettings {
  appearance: Appearance

  autoStartDownloads: boolean
  concurrentDownloads: number

  downloadFormat: AudioFormat
  defaultFormat: AudioFormat

  defaultQuality: AudioQuality

  autoplay: boolean
  volume: number
  rememberPosition: boolean
}

export const defaultSettings: AppSettings = {
  appearance: 'dark',

  autoStartDownloads: true,
  concurrentDownloads: 3,

  downloadFormat: 'mp3',
  defaultFormat: 'mp3',

  defaultQuality: '320kbps',

  autoplay: true,
  volume: 1,
  rememberPosition: true,
}
