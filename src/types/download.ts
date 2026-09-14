export type DownloadStatus =
  | 'waiting'
  | 'downloading'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'cancelled'
  | 'paused'

export type DownloadSource =
  | 'spotify'
  | 'url'
  | 'local'

export type AudioFormat =
  | 'mp3'
  | 'wav'
  | 'original'

export type AudioQuality =
  | '128kbps'
  | '192kbps'
  | '256kbps'
  | '320kbps'
  | 'lossless'

export interface DownloadItemData {
  id: string
  title: string
  artist?: string
  album?: string
  source: DownloadSource
  sourceUrl?: string
  format: AudioFormat
  quality?: AudioQuality
  status: DownloadStatus
  progress: number
  size?: number
  fileName?: string
  createdAt: number
  completedAt?: number
  blobUrl?: string
  error?: string
  spotifyId?: string
}

export type DownloadItem = DownloadItemData
