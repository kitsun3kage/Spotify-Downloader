import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import type { DownloadItem } from '../types/download'

import {
  addDownloadHistory,
  getDownloads,
  saveDownloads,
} from '../services/storage'

import {
  downloadLegalFile,
} from '../services/downloads'

interface CreateDownloadOptions {
  id: string
  title: string
  artist?: string
  album?: string
  sourceUrl?: string
  spotifyId?: string
}

export function useDownloads() {
  const [downloads, setDownloads] =
    useState<DownloadItem[]>(() =>
      getDownloads(),
    )

  const updateDownloads = useCallback(
    (
      updater:
        | DownloadItem[]
        | ((
            current: DownloadItem[],
          ) => DownloadItem[]),
    ) => {
      setDownloads((current) => {
        const next =
          typeof updater === 'function'
            ? updater(current)
            : updater

        saveDownloads(next)

        return next
      })
    },
    [],
  )

  useEffect(() => {
    const stored =
      getDownloads()

    setDownloads(stored)
  }, [])

  const addDownload = useCallback(
    (
      options: CreateDownloadOptions,
    ): DownloadItem => {
      const item: DownloadItem = {
        id: options.id,

        title:
          options.title,

        artist:
          options.artist || '',

        album:
          options.album || '',

        source: 'url',

        sourceUrl:
          options.sourceUrl || '',

        spotifyId:
          options.spotifyId,

        format: 'mp3',

        quality: '320kbps',

        status: 'Waiting',

        progress: 0,

        size: 0,

        fileName:
          options.title
            ? `${options.title}.mp3`
            : 'audio.mp3',

        createdAt:
          Date.now(),
      }

      updateDownloads(
        (current) => [
          item,
          ...current.filter(
            (existing) =>
              existing.id !==
              item.id,
          ),
        ],
      )

      return item
    },
    [updateDownloads],
  )

  const startDownload =
    useCallback(
      async (
        item: DownloadItem,
      ) => {
        if (!item.sourceUrl) {
          const failed: DownloadItem = {
            ...item,
            status: 'Failed',
            error:
              'Brak adresu źródłowego.',
          }

          updateDownloads(
            (current) =>
              current.map(
                (existing) =>
                  existing.id ===
                  item.id
                    ? failed
                    : existing,
              ),
          )

          return failed
        }

        const downloading: DownloadItem = {
          ...item,
          status: 'Downloading',
          progress: 0,
          error: undefined,
        }

        updateDownloads(
          (current) =>
            current.map(
              (existing) =>
                existing.id ===
                item.id
                  ? downloading
                  : existing,
            ),
        )

        try {
          const result =
            await downloadLegalFile(
              downloading,
              downloading.sourceUrl,
              (progress: number) => {
                updateDownloads(
                  (current) =>
                    current.map(
                      (existing) =>
                        existing.id ===
                        item.id
                          ? {
                              ...existing,
                              status:
                                'Downloading',
                              progress,
                            }
                          : existing,
                    ),
                )
              },
            )

          updateDownloads(
            (current) =>
              current.map(
                (existing) =>
                  existing.id ===
                  item.id
                    ? result
                    : existing,
              ),
          )

          if (
            result.status ===
            'Completed'
          ) {
            addDownloadHistory(
              result,
            )
          }

          return result
        } catch (error) {
          const failed: DownloadItem = {
            ...item,
            status: 'Failed',
            error:
              error instanceof Error
                ? error.message
                : 'Nieznany błąd.',
          }

          updateDownloads(
            (current) =>
              current.map(
                (existing) =>
                  existing.id ===
                  item.id
                    ? failed
                    : existing,
              ),
          )

          return failed
        }
      },
      [updateDownloads],
    )

  const pauseDownload =
    useCallback(
      (id: string) => {
        updateDownloads(
          (current) =>
            current.map(
              (item) =>
                item.id === id &&
                item.status ===
                  'Downloading'
                  ? {
                      ...item,
                      status: 'Paused',
                    }
                  : item,
            ),
        )
      },
      [updateDownloads],
    )

  const resumeDownload =
    useCallback(
      async (id: string) => {
        const item =
          downloads.find(
            (entry) =>
              entry.id === id,
          )

        if (!item) {
          return
        }

        await startDownload(
          item,
        )
      },
      [downloads, startDownload],
    )

  const cancelDownload =
    useCallback(
      (id: string) => {
        updateDownloads(
          (current) =>
            current.map(
              (item) =>
                item.id === id
                  ? {
                      ...item,
                      status:
                        'Cancelled',
                    }
                  : item,
            ),
        )
      },
      [updateDownloads],
    )

  const removeDownload =
    useCallback(
      (id: string) => {
        updateDownloads(
          (current) =>
            current.filter(
              (item) =>
                item.id !== id,
            ),
        )
      },
      [updateDownloads],
    )

  const clearCompleted =
    useCallback(() => {
      updateDownloads(
        (current) =>
          current.filter(
            (item) =>
              item.status !==
              'Completed',
          ),
      )
    }, [updateDownloads])

  const retryDownload =
    useCallback(
      async (id: string) => {
        const item =
          downloads.find(
            (entry) =>
              entry.id === id,
          )

        if (!item) {
          return
        }

        await startDownload(
          item,
        )
      },
      [downloads, startDownload],
    )

  return {
    downloads,

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

export default useDownloads
