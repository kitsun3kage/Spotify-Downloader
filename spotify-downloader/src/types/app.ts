export type Page =
  | 'home'
  | 'search'
  | 'playlists'
  | 'downloads'
  | 'history'
  | 'settings';

export type Appearance = 'dark' | 'light' | 'system';

export interface AppSettings {
  appearance: Appearance;
  downloadFormat: 'mp3' | 'wav' | 'original';
  concurrentDownloads: number;
  autoStartDownloads: boolean;
  autoplay: boolean;
  volume: number;
  rememberPosition: boolean;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  createdAt: number;
}