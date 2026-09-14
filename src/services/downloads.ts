import type { DownloadItem } from '../types/download'
import {
  addDownloadHistory,
  saveDownloads,
} from './storage'

function createBlobFromChunks(
  chunks: Uint8Array[],
  contentType: string,
): Blob {
  const totalLength = chunks.reduce(
    (total, chunk) => total + chunk.byteLength,
    0,
  )

  const merged = new ArrayBuffer(totalLength)

  const output = new Uint8Array(merged)

  let offset = 0

  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.byteLength
  }

  return new Blob([merged], {
    type: contentType,
  })
}

export async function downloadFromUrl(
  item: DownloadItem,
  url: string,
  onUpdate?: (item: DownloadItem) => void,
): Promise<DownloadItem> {
  const update = (next: DownloadItem) => {
    onUpdate?.(next)
  }

  if (!url) {
    const failed: DownloadItem = {
      ...item,
      status: 'failed',
      error: 'Brak adresu URL.',
    }

    update(failed)

    return failed
  }

  try {
    let current: DownloadItem = {
      ...item,
      status: 'downloading',
      progress: 0,
      error: undefined,
    }

    update(current)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    const contentType =
      response.headers.get('content-type') ||
      'application/octet-stream'

    const contentLengthHeader =
      response.headers.get('content-length')

    const contentLength = contentLengthHeader
      ? Number(contentLengthHeader)
      : 0

    let blob: Blob

    if (response.body) {
      const reader = response.body.getReader()

      const chunks: Uint8Array[] = []

      let received = 0

      while (true) {
        const result = await reader.read()

        if (result.done) {
          break
        }

        const value = result.value

        if (!value) {
          continue
        }

        const chunk = new Uint8Array(value)

        chunks.push(chunk)

        received += chunk.byteLength

        const progress =
          contentLength > 0
            ? Math.min(
                100,
                Math.round(
                  (received / contentLength) *
                    100,
                ),
              )
            : 0

        current = {
          ...current,
          progress,
        }

        update(current)
      }

      blob = createBlobFromChunks(
        chunks,
        contentType,
      )
    } else {
      blob = await response.blob()
    }

    const blobUrl = URL.createObjectURL(blob)

    const completed: DownloadItem = {
      ...current,
      status: 'completed',
      progress: 100,
      blobUrl,
      size: blob.size,
      completedAt: Date.now(),
      error: undefined,
    }

    update(completed)

    addDownloadHistory(completed)
    saveDownloads([completed, ...[]])

    return completed
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Nieznany błąd pobierania.'

    const failed: DownloadItem = {
      ...item,
      status: 'failed',
      error: message,
    }

    update(failed)

    return failed
  }
}

export function createDownloadItem(
  partial: Partial<DownloadItem> &
    Pick<DownloadItem, 'id' | 'title'>,
): DownloadItem {
  return {
    id: partial.id,
    title: partial.title,
    artist: partial.artist || '',
    album: partial.album || '',
    source: partial.source || 'url',
    sourceUrl: partial.sourceUrl || '',
    format: partial.format || 'mp3',
    quality:
      partial.quality || '320kbps',
    status:
      partial.status || 'waiting',
    progress: partial.progress || 0,
    size: partial.size || 0,
    fileName: partial.fileName || '',
    createdAt:
      partial.createdAt || Date.now(),
    completedAt: partial.completedAt,
    blobUrl: partial.blobUrl,
    error: partial.error,
    spotifyId: partial.spotifyId,
  }
}
