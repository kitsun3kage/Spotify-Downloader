import { useEffect, useState } from 'react'
import {
  Clock3,
  Download,
  ExternalLink,
  FileAudio,
  Trash2,
} from 'lucide-react'

import type { DownloadItem } from '../types/download'
import {
  clearDownloadHistory,
  getDownloadHistory,
} from '../services/storage'

function formatDate(timestamp?: number): string {
  if (!timestamp) {
    return 'Nieznana data'
  }

  return new Intl.DateTimeFormat('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp))
}

function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) {
    return '—'
  }

  const units = ['B', 'KB', 'MB', 'GB']

  let value = bytes
  let index = 0

  while (
    value >= 1024 &&
    index < units.length - 1
  ) {
    value /= 1024
    index += 1
  }

  return `${value.toFixed(value >= 100 ? 0 : 1)} ${
    units[index]
  }`
}

export function History() {
  const [items, setItems] = useState<DownloadItem[]>([])

  useEffect(() => {
    setItems(getDownloadHistory())
  }, [])

  const handleClear = () => {
    clearDownloadHistory()
    setItems([])
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">ACTIVITY</span>

          <h1>Historia</h1>

          <p>
            Lista ostatnio przetwarzanych plików.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            className="button button-danger"
            onClick={handleClear}
          >
            <Trash2 size={17} />
            Wyczyść historię
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <section className="empty-state">
          <div className="empty-icon">
            <Clock3 size={28} />
          </div>

          <h2>Brak historii</h2>

          <p>
            Historia pobierania pojawi się tutaj.
          </p>
        </section>
      ) : (
        <section className="history-list">
          {items.map((item: DownloadItem) => (
            <article
              className="history-card"
              key={item.id}
            >
              <div className="history-icon">
                <FileAudio size={22} />
              </div>

              <div className="history-content">
                <h3>
                  {item.title || 'Bez nazwy'}
                </h3>

                <div className="history-meta">
                  <span>
                    {item.artist ||
                      'Nieznany wykonawca'}
                  </span>

                  <span>•</span>

                  <span>
                    {item.format.toUpperCase()}
                  </span>

                  <span>•</span>

                  <span>
                    {formatSize(item.size)}
                  </span>
                </div>

                <div className="history-date">
                  {formatDate(
                    item.completedAt ||
                      item.createdAt,
                  )}
                </div>
              </div>

              <div className="history-actions">
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="icon-button"
                    aria-label="Otwórz źródło"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}

                {item.blobUrl && (
                  <a
                    href={item.blobUrl}
                    download={
                      item.fileName || 'audio'
                    }
                    className="icon-button"
                    aria-label="Pobierz plik"
                  >
                    <Download size={18} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default History
