export type DownloadStatus =
  | 'Waiting'
  | 'Downloading'
  | 'Completed'
  | 'Failed'
  | 'Skipped'
  | 'Cancelled';

export interface DownloadItemData {
  id: string;
  title: string;
  artist: string;
  sourceUrl: string;
  fileName: string;
  progress: number;
  status: DownloadStatus;
  createdAt: number;
  error?: string;
}

export interface DownloadSettings {
  format: 'mp3' | 'wav' | 'original';
  concurrent: number;
  autoStart: boolean;
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  artist: string;
  status: DownloadStatus;
  createdAt: number;
}