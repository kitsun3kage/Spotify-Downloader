import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  downloadLegalFile
} from '../services/downloads';

import {
  addDownloadHistory,
  getDownloads,
  saveDownloads
} from '../services/storage';

import type {
  DownloadItemData
} from '../types/download';

export function useDownloads() {
  const [items, setItems] =
    useState<DownloadItemData[]>(
      getDownloads()
    );

  const persist =
    useCallback(
      (next: DownloadItemData[]) => {
        setItems(next);
        saveDownloads(next);
      },
      []
    );

  useEffect(() => {
    saveDownloads(items);
  }, [items]);

  const add = useCallback(
    (
      data: Omit<
        DownloadItemData,
        'id' | 'progress' | 'status' | 'createdAt'
      >
    ) => {
      const item: DownloadItemData = {
        ...data,
        id: crypto.randomUUID(),
        progress: 0,
        status: 'Waiting',
        createdAt: Date.now()
      };

      persist([item, ...items]);

      return item;
    },
    [items, persist]
  );

  const update = useCallback(
    (
      id: string,
      patch: Partial<DownloadItemData>
    ) => {
      persist(
        items.map((item) =>
          item.id === id
            ? { ...item, ...patch }
            : item
        )
      );
    },
    [items, persist]
  );

  const start = useCallback(
    async (id: string) => {
      const item =
        items.find(
          (entry) => entry.id === id
        );

      if (!item) {
        return;
      }

      update(id, {
        status: 'Downloading',
        progress: 0,
        error: undefined
      });

      try {
        await downloadLegalFile(
          item.sourceUrl,
          item.fileName,
          (progress) => {
            update(id, {
              progress
            });
          }
        );

        update(id, {
          status: 'Completed',
          progress: 100
        });

        addDownloadHistory({
          id: item.id,
          title: item.title,
          artist: item.artist,
          status: 'Completed',
          createdAt: Date.now()
        });
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : 'Download failed.';

        update(id, {
          status: 'Failed',
          error: message
        });

        addDownloadHistory({
          id: item.id,
          title: item.title,
          artist: item.artist,
          status: 'Failed',
          createdAt: Date.now()
        });
      }
    },
    [items, update]
  );

  const cancel = useCallback(
    (id: string) => {
      update(id, {
        status: 'Cancelled'
      });
    },
    [update]
  );

  const clearCompleted =
    useCallback(() => {
      persist(
        items.filter(
          (item) =>
            item.status !== 'Completed'
        )
      );
    }, [items, persist]);

  return {
    items,
    add,
    update,
    start,
    cancel,
    clearCompleted
  };
}