import {
  Download,
  Info
} from 'lucide-react';

import { DownloadQueue } from '../components/DownloadQueue';

import type {
  DownloadItemData
} from '../types/download';

interface DownloadsProps {
  items: DownloadItemData[];
  onStart: (id: string) => void;
  onCancel: (id: string) => void;
  onClearCompleted: () => void;
}

export function Downloads({
  items,
  onStart,
  onCancel,
  onClearCompleted
}: DownloadsProps) {
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            LOCAL FILES
          </span>
          <h2>Downloads</h2>
        </div>
      </div>

      <div className="info-banner">
        <Info size={18} />

        <p>
          Spotify audio cannot be downloaded
          or stream-ripped through the Spotify
          API. This queue is intended for
          direct, legal audio files that you
          have permission to download.
        </p>
      </div>

      <DownloadQueue
        items={items}
        onStart={onStart}
        onCancel={onCancel}
        onClearCompleted={
          onClearCompleted
        }
      />

      <div className="download-placeholder">
        <Download size={25} />

        <strong>
          Legal local downloads
        </strong>

        <span>
          Add direct file sources that
          explicitly allow downloading.
        </span>
      </div>
    </div>
  );
}