import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  getCurrentUser,
  handleSpotifyCallback,
  isSpotifyConnected,
  loginWithSpotify,
  logoutSpotify,
  searchSpotify,
  type SearchResult,
  SpotifyError
} from '../services/spotify';

import type { SpotifyProfile } from '../types/spotify';

export function useSpotify() {
  const [connected, setConnected] =
    useState(isSpotifyConnected());

  const [profile, setProfile] =
    useState<SpotifyProfile | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const refreshProfile =
    useCallback(async () => {
      if (!isSpotifyConnected()) {
        setConnected(false);
        setProfile(null);
        return;
      }

      try {
        const user =
          await getCurrentUser();

        setProfile(user);
        setConnected(true);
      } catch (cause) {
        setConnected(false);
        setProfile(null);

        if (cause instanceof SpotifyError) {
          setError(cause.message);
        }
      }
    }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const handleCallback =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const handled =
          await handleSpotifyCallback();

        if (handled) {
          await refreshProfile();
        }

        return handled;
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : 'Spotify authorization failed.';

        setError(message);

        return false;
      } finally {
        setLoading(false);
      }
    }, [refreshProfile]);

  const connect = useCallback(async () => {
    setError(null);

    try {
      await loginWithSpotify();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not start Spotify login.'
      );
    }
  }, []);

  const disconnect = useCallback(() => {
    logoutSpotify();
    setConnected(false);
    setProfile(null);
  }, []);

  const search = useCallback(
    async (query: string): Promise<SearchResult> => {
      setLoading(true);
      setError(null);

      try {
        return await searchSpotify(query);
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : 'Spotify search failed.';

        setError(message);
        throw cause;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    connected,
    profile,
    loading,
    error,
    connect,
    disconnect,
    search,
    handleCallback,
    refreshProfile
  };
}