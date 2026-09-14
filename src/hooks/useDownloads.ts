import { useCallback, useEffect, useState } from 'react'
import type { DownloadItem, DownloadStatus } from '../types/download'
import {
  addDownloadHistory,
  getDownloads,
  saveDownloads,
} from '../services/storage'
import {
  downloadLegalFile,
  type LegalDownloadOptions,
} from '../services/downloads'

export interface CreateDownloadOptions {
  id?: string
  title: string
  artist?: string
  album?: string
  source: 'spotify' | 'url' | 'local'
  sourceUrl?: string
  format: 'mp3' | 'wav' | 'original'
  quality?: '128kbps' | '192kbps' | '256kbps' | '320kbps' | 'lossless'
  spotifyId?: string
  fileName?: string
}

export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => {
    return getDownloads()
  })

  useEffect(() => {
    saveDownloads(downloads)
  }, [downloads])

  const updateDownloads = useCallback(
    (
      updater:
        | DownloadItem[]
        | ((current: DownloadItem[]) => DownloadItem[]),
    ) => {
      setDownloads((current) => {
        if (typeof updater === 'function') {
          return updater(current)
        }

        return updater
      })
    },
    [],
  )

  const addDownload = useCallback(
    (options: CreateDownloadOptions): DownloadItem => {
      const item: DownloadItem = {
        id: options.id ?? crypto.randomUUID(),
        title: options.title,
        artist: options.artist,
        album: options.album,
        source: options.source,
        sourceUrl: options.sourceUrl,
        format: options.format,
        quality: options.quality,
        status: 'Waiting',
        progress: 0,
        fileName: options.fileName,
        createdAt: Date.now(),
        spotifyId: options.spotifyId,
      }

      setDownloads((current) => {
        const existing = current.find((download) => download.id === item.id)

        if (existing) {
          return current.map((download) =>
            download.id === item.id ? item : download,
          )
        }

        return [item, ...current]
      })

      return item
    },
    [],
  )

  const startDownload = useCallback(
    async (item: DownloadItem): Promise<DownloadItem> => {
      if (!item.sourceUrl) {
        const failed: DownloadItem = {
          ...item,
          status: 'Failed',
          progress: 0,
          error: 'Brak adresu URL pliku do pobrania.',
        }

        setDownloads((current) =>
          current.map((download) =>
            download.id === item.id ? failed : download,
          ),
        )

        addDownloadHistory(failed)

        return failed
      }

      setDownloads((current) =>
        current.map((download) =>
          download.id === item.id
            ? {
                ...download,
                status: 'Downloading' as DownloadStatus,
                progress: 0,
                error: undefined,
              }
            : download,
        ),
      )

      try {
        const options: LegalDownloadOptions = {
          url: item.sourceUrl,
          fileName:
            item.fileName ??
            `${item.artist ? `${item.artist} - ` : ''}${item.title}`,
          onProgress: (progress: number) => {
            setDownloads((current) =>
              current.map((download) =>
                download.id === item.id
                  ? {
                      ...download,
                      status: 'Downloading' as DownloadStatus,
                      progress,
                    }
                  : download,
              ),
            )
          },
        }

        const result = await downloadLegalFile(options)

        const completed: DownloadItem = {
          ...item,
          status: 'Completed',
          progress: 100,
          completedAt: Date.now(),
          blobUrl: result.blobUrl,
          size: result.size ?? item.size,
          fileName: result.fileName ?? item.fileName,
          error: undefined,
        }

        setDownloads((current) =>
          current.map((download) =>
            download.id === item.id ? completed : download,
          ),
        )

        addDownloadHistory(completed)

        return completed
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Nie udało się pobrać pliku.'

        const failed: DownloadItem = {
          ...item,
          status: 'Failed',
          error: message,
        }

        setDownloads((current) =>
          current.map((download) =>
            download.id === item.id ? failed : download,
          ),
        )

        addDownloadHistory(failed)

        return failed
      }
    },
    [],
  )

  const pauseDownload = useCallback((id: string) => {
    setDownloads((current) =>
      current.map((download) =>
        download.id === id
          ? {
              ...download,
              status: 'Paused',
            }
          : download,
      ),
    )
  }, [])

  const resumeDownload = useCallback(
    async (id: string) => {
      const item = getDownloads().find((download) => download.id === id)

      if (!item) {
        const currentItem = downloads.find((download) => download.id === id)

        if (!currentItem) {
          return
        }

        await startDownload(currentItem)
        return
      }

      await startDownload(item)
    },
    [downloads, startDownload],
  )

  const cancelDownload = useCallback((id: string) => {
    setDownloads((current) =>
      current.map((download) =>
        download.id === id
          ? {
              ...download,
              status: 'Cancelled',
            }
          : download,
      ),
    )
  }, [])

  const removeDownload = useCallback((id: string) => {
    setDownloads((current) =>
      current.filter((download) => download.id !== id),
    )
  }, [])

  const clearCompleted = useCallback(() => {
    setDownloads((current) =>
      current.filter((download) => download.status !== 'Completed'),
    )
  }, [])

  const retryDownload = useCallback(
    async (id: string) => {
      const item = downloads.find((download) => download.id === id)

      if (!item) {
        return
      }

      const retryItem: DownloadItem = {
        ...item,
        status: 'Waiting',
        progress: 0,
        error: undefined,
        completedAt: undefined,
        blobUrl: undefined,
      }

      setDownloads((current) =>
        current.map((download) =>
          download.id === id ? retryItem : download,
        ),
      )

      await startDownload(retryItem)
    },
    [downloads, startDownload],
  )

  /*
   * Compatibility aliases.
   *
   * App.tsx currently expects:
   *   downloads.items
   *   downloads.start()
   *   downloads.cancel()
   *
   * The newer hook API uses:
   *   downloads.downloads
   *   downloads.startDownload()
   *   downloads.cancelDownload()
   *
   * Both are exposed so the rest of the application compiles.
   */

  const start = useCallback(
    async (item: DownloadItem) => {
      return startDownload(item)
    },
    [startDownload],
  )

  const cancel = useCallback(
    (id: string) => {
      cancelDownload(id)
    },
    [cancelDownload],
  )

  return {
    downloads,

    // Old App.tsx API
    items: downloads,
    start,
    cancel,

    // Current API
    addDownload,
    startDownload,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    removeDownload,
    clearCompleted,
    retryDownload,
    updateDownloads,
  }
}
