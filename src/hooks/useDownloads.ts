import { useCallback, useEffect, useState } from 'react'
import type { DownloadItem } from '../types/download'
import {
  addDownloadHistory,
  getDownloads,
  saveDownloads,
} from '../services/storage'
import { downloadLegalFile } from '../services/downloads'

export interface CreateDownloadOptions {
  id?: string
  title: string
  artist?: string
  album?: string
  source: 'spotify' | 'url' | 'local'
  sourceUrl?: string
  format: 'mp3' | 'wav' | 'original'
  quality?:
    | '128kbps'
    | '192kbps'
    | '256kbps'
    | '320kbps'
    | 'lossless'
  spotifyId?: string
  fileName?: string
}

export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadItem[]>(
    () => getDownloads(),
  )

  useEffect(() => {
    saveDownloads(downloads)
  }, [downloads])

  const updateDownloads = useCallback(
    (
      updater:
        | DownloadItem[]
        | ((current: DownloadItem[]) => DownloadItem[]),
    ) => {
      setDownloads((current) =>
        typeof updater === 'function'
          ? updater(current)
          : updater,
      )
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
        const exists = current.some(
          (download) => download.id === item.id,
        )

        if (exists) {
          return current.map((download) =>
            download.id === item.id
              ? item
              : download,
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
        const failedItem: DownloadItem = {
          ...item,
          status: 'Failed',
          progress: 0,
          error: 'Brak adresu URL pliku.',
        }

        setDownloads((current) =>
          current.map((download) =>
            download.id === item.id
              ? failedItem
              : download,
          ),
        )

        addDownloadHistory(failedItem)

        return failedItem
      }

      setDownloads((current) =>
        current.map((download) =>
          download.id === item.id
            ? {
                ...download,
                status: 'Downloading',
                progress: 0,
                error: undefined,
              }
            : download,
        ),
      )

      try {
        const result = await downloadLegalFile(
          item.sourceUrl,
          item.fileName ??
            `${item.artist ? `${item.artist} - ` : ''}${item.title}`,
          (progress: number) => {
            setDownloads((current) =>
              current.map((download) =>
                download.id === item.id
                  ? {
                      ...download,
                      status: 'Downloading',
                      progress,
                    }
                  : download,
              ),
            )
          },
        )

        const completedItem: DownloadItem = {
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
            download.id === item.id
              ? completedItem
              : download,
          ),
        )

        addDownloadHistory(completedItem)

        return completedItem
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Nie udało się pobrać pliku.'

        const failedItem: DownloadItem = {
          ...item,
          status: 'Failed',
          error: message,
        }

        setDownloads((current) =>
          current.map((download) =>
            download.id === item.id
              ? failedItem
              : download,
          ),
        )

        addDownloadHistory(failedItem)

        return failedItem
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
    async (id: string): Promise<void> => {
      const item = downloads.find(
        (download) => download.id === id,
      )

      if (!item) {
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
      current.filter(
        (download) => download.id !== id,
      ),
    )
  }, [])

  const clearCompleted = useCallback(() => {
    setDownloads((current) =>
      current.filter(
        (download) => download.status !== 'Completed',
      ),
    )
  }, [])

  const retryDownload = useCallback(
    async (id: string): Promise<void> => {
      const item = downloads.find(
        (download) => download.id === id,
      )

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
          download.id === id
            ? retryItem
            : download,
        ),
      )

      await startDownload(retryItem)
    },
    [downloads, startDownload],
  )

  /*
   * Compatibility with the current App.tsx
   */

  const start = useCallback(
    (id: string): void => {
      const item = downloads.find(
        (download) => download.id === id,
      )

      if (!item) {
        return
      }

      void startDownload(item)
    },
    [downloads, startDownload],
  )

  const cancel = useCallback(
    (id: string): void => {
      cancelDownload(id)
    },
    [cancelDownload],
  )

  return {
    downloads,

    // API używane przez App.tsx
    items: downloads,
    start,
    cancel,

    // Pełne API
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
