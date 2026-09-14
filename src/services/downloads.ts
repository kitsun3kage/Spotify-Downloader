import type { DownloadItem } from '../types/download'
import {
  addToHistory,
  saveDownloadHistory,
} from './storage'

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
    const downloading: DownloadItem = {
      ...item,
      status: 'downloading',
      progress: 0,
      error: undefined,
    }

    update(downloading)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    const contentType =
      response.headers.get('content-type') ||
      'application/octet-stream'

    const contentLength = Number(
      response.headers.get('content-length') || 0,
    )

    let blob: Blob

    if (response.body) {
      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []

      let received = 0

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        if (value) {
          chunks.push(value)
          received += value.byteLength

          const progress = contentLength
            ? Math.min(
                100,
                Math.round(
                  (received / contentLength) * 100,
                ),
              )
            : 0

          update({
            ...downloading,
            progress,
          })
        }
      }

      const totalLength = chunks.reduce(
        (total, chunk) => total + chunk.byteLength,
        0,
      )

      const merged = new Uint8Array(totalLength)

      let offset = 0

      for (const chunk of chunks) {
        merged.set(chunk, offset)
        offset += chunk.byteLength
      }

      const buffer = merged.buffer.slice(
        merged.byteOffset,
        merged.byteOffset + merged.byteLength,
      )

      blob = new Blob([buffer], {
        type: contentType,
      })
    } else {
      blob = await response.blob()
    }

    const blobUrl = URL.createObjectURL(blob)

    const completed: DownloadItem = {
      ...downloading,
      status: 'completed',
      progress: 100,
      blobUrl,
      size: blob.size,
      completedAt: Date.now(),
      error: undefined,
    }

    update(completed)

    addToHistory(completed)
    saveDownloadHistory([completed])

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
  partial: Partial<DownloadItem> & Pick<DownloadItem, 'id' | 'title'>,
): DownloadItem {
  return {
    id: partial.id,
    title: partial.title,
    artist: partial.artist || '',
    album: partial.album || '',
    source: partial.source || 'url',
    sourceUrl: partial.sourceUrl || '',
    format: partial.format || 'mp3',
    quality: partial.quality || '320kbps',
    status: partial.status || 'waiting',
    progress: partial.progress || 0,
    size: partial.size || 0,
    fileName: partial.fileName || '',
    createdAt: partial.createdAt || Date.now(),
    completedAt: partial.completedAt,
    blobUrl: partial.blobUrl,
    error: partial.error,
  }
}
