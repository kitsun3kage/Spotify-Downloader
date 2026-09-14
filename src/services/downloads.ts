import type { DownloadItem } from '../types/download'

import {
  addDownloadHistory,
  getDownloads,
  saveDownloads,
} from './storage'

function createBlobFromChunks(
  chunks: Uint8Array[],
  contentType: string,
): Blob {
  const totalLength =
    chunks.reduce(
      (total, chunk) =>
        total + chunk.byteLength,
      0,
    )

  const buffer =
    new ArrayBuffer(totalLength)

  const output =
    new Uint8Array(buffer)

  let offset = 0

  for (const chunk of chunks) {
    output.set(chunk, offset)

    offset +=
      chunk.byteLength
  }

  return new Blob(
    [buffer],
    {
      type: contentType,
    },
  )
}

export async function downloadFromUrl(
  item: DownloadItem,
  url: string,
  onUpdate?: (
    item: DownloadItem,
  ) => void,
): Promise<DownloadItem> {
  const update = (
    next: DownloadItem,
  ) => {
    onUpdate?.(next)
  }

  if (!url) {
    const failed: DownloadItem = {
      ...item,
      status: 'Failed',
      error: 'Brak adresu URL.',
    }

    update(failed)

    return failed
  }

  try {
    let current: DownloadItem = {
      ...item,
      status: 'Downloading',
      progress: 0,
      error: undefined,
    }

    update(current)

    const response =
      await fetch(url)

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    const contentType =
      response.headers.get(
        'content-type',
      ) ||
      'application/octet-stream'

    const contentLengthHeader =
      response.headers.get(
        'content-length',
      )

    const contentLength =
      contentLengthHeader
        ? Number(
            contentLengthHeader,
          )
        : 0

    let blob: Blob

    if (response.body) {
      const reader =
        response.body.getReader()

      const chunks: Uint8Array[] =
        []

      let received = 0

      while (true) {
        const result =
          await reader.read()

        if (result.done) {
          break
        }

        if (!result.value) {
          continue
        }

        const chunk =
          new Uint8Array(
            result.value,
          )

        chunks.push(chunk)

        received +=
          chunk.byteLength

        const progress =
          contentLength > 0
            ? Math.min(
                100,
                Math.round(
                  (received /
                    contentLength) *
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

      blob =
        createBlobFromChunks(
          chunks,
          contentType,
        )
    } else {
      blob =
        await response.blob()
    }

    const blobUrl =
      URL.createObjectURL(blob)

    const completed: DownloadItem = {
      ...current,
      status: 'Completed',
      progress: 100,
      blobUrl,
      size: blob.size,
      completedAt:
        Date.now(),
      error: undefined,
    }

    update(completed)

    addDownloadHistory(
      completed,
    )

    return completed
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Nieznany błąd pobierania.'

    const failed: DownloadItem = {
      ...item,
      status: 'Failed',
      error: message,
    }

    update(failed)

    return failed
  }
}

/**
 * Pobieranie legalnego, bezpośredniego
 * pliku audio z adresu URL.
 *
 * Nie służy do pobierania treści Spotify.
 */
export async function downloadLegalFile(
  item: DownloadItem,
  url: string,
  onProgress?: (
    progress: number,
  ) => void,
): Promise<DownloadItem> {
  return downloadFromUrl(
    item,
    url,
    (updated) => {
      onProgress?.(
        updated.progress,
      )
    },
  )
}

export function createDownloadItem(
  partial: Partial<DownloadItem> &
    Pick<
      DownloadItem,
      'id' | 'title'
    >,
): DownloadItem {
  return {
    id: partial.id,

    title: partial.title,

    artist:
      partial.artist || '',

    album:
      partial.album || '',

    source:
      partial.source || 'url',

    sourceUrl:
      partial.sourceUrl || '',

    format:
      partial.format || 'mp3',

    quality:
      partial.quality ||
      '320kbps',

    status:
      partial.status ||
      'Waiting',

    progress:
      partial.progress || 0,

    size:
      partial.size || 0,

    fileName:
      partial.fileName || '',

    createdAt:
      partial.createdAt ||
      Date.now(),

    completedAt:
      partial.completedAt,

    blobUrl:
      partial.blobUrl,

    error:
      partial.error,

    spotifyId:
      partial.spotifyId,
  }
}

export function getStoredDownloads(): DownloadItem[] {
  return getDownloads()
}

export function persistDownloads(
  items: DownloadItem[],
): void {
  saveDownloads(items)
}
