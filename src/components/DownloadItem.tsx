import {
  CheckCircle2,
  CirclePause,
  CircleX,
  Download,
  LoaderCircle,
  XCircle
} from 'lucide-react';

import type {
  DownloadItemData
} from '../types/download';

interface DownloadItemProps {
  item: DownloadItemData;
  onStart: (id: string) => void;
  onCancel: (id: string) => void;
}

export function DownloadItem({
  item,
  onStart,
  onCancel
}: DownloadItemProps) {
  const icon =
    item.status === 'Completed'
      ? <CheckCircle2 size={18} />
      : item.status === 'Downloading'
        ? <LoaderCircle
            size={18}
            className="spin"
          />
        : item.status === 'Failed'
          ? <XCircle size={18} />
          : item.status === 'Cancelled'
            ? <CircleX size={18} />
            : <Download size={18} />;

  return (
    <article className="download-item">
      <div className="download-icon">
        {icon}
      </div>

      <div className="download-main">
        <strong>{item.title}</strong>

        <span>{item.artist}</span>

        <div className="progress-track">
          <div
            className="progress-value"
            style={{
              width: `${item.progress}%`
            }}
          />
        </div>

        <small>
          {item.status}
          {item.status === 'Downloading'
            ? ` · ${item.progress}%`
            : ''}
        </small>

        {item.error && (
          <small className="error-text">
            {item.error}
          </small>
        )}
      </div>

      <div className="download-actions">
        {item.status === 'Waiting' ||
        item.status === 'Failed' ||
        item.status === 'Cancelled' ? (
          <button
            className="icon-button"
            type="button"
            onClick={() =>
              onStart(item.id)
            }
            title="Start"
          >
            <Download size={17} />
          </button>
        ) : null}

        {item.status === 'Downloading' && (
          <button
            className="icon-button"
            type="button"
            onClick={() =>
              onCancel(item.id)
            }
            title="Cancel"
          >
            <CirclePause size={17} />
          </button>
        )}
      </div>
    </article>
  );
}