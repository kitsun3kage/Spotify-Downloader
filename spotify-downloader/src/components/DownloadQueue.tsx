import {
  CheckCheck,
  Trash2
} from 'lucide-react';

import type {
  DownloadItemData
} from '../types/download';

import { DownloadItem } from './DownloadItem';

interface DownloadQueueProps {
  items: DownloadItemData[];
  onStart: (id: string) => void;
  onCancel: (id: string) => void;
  onClearCompleted: () => void;
}

export function DownloadQueue({
  items,
  onStart,
  onCancel,
  onClearCompleted
}: DownloadQueueProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <span className="section-kicker">
            DOWNLOADS
          </span>
          <h2>Download Queue</h2>
        </div>

        <button
          className="button ghost"
          type="button"
          onClick={onClearCompleted}
        >
          <Trash2 size={16} />
          Clear completed
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <CheckCheck size={32} />
          <strong>
            Your queue is empty
          </strong>
          <span>
            Legal local downloads will
            appear here.
          </span>
        </div>
      ) : (
        <div className="download-list">
          {items.map((item) => (
            <DownloadItem
              key={item.id}
              item={item}
              onStart={onStart}
              onCancel={onCancel}
            />
          ))}
        </div>
      )}
    </section>
  );
}