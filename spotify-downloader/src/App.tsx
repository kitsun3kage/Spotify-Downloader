import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Sidebar
} from './components/Sidebar';

import {
  TopBar
} from './components/TopBar';

import {
  AudioPlayer
} from './components/AudioPlayer';

import {
  Toast,
  type ToastType
} from './components/Toast';

import {
  Home
} from './pages/Home';

import {
  SearchPage
} from './pages/Search';

import {
  Playlists
} from './pages/Playlists';

import {
  Downloads
} from './pages/Downloads';

import {
  History
} from './pages/History';

import {
  Settings
} from './pages/Settings';

import {
  getSettings,
  saveSettings,
  addSearchHistory
} from './services/storage';

import {
  isSpotifyConfigured
} from './services/spotify';

import {
  useSpotify
} from './hooks/useSpotify';

import {
  useDownloads
} from './hooks/useDownloads';

import {
  useAudioPlayer,
  type PlayerTrack
} from './hooks/useAudioPlayer';

import type {
  AppSettings,
  Page
} from './types/app';

import type {
  SpotifyTrack
} from './types/spotify';

import './App.css';

function getInitialPage(): Page {
  const hash =
    window.location.hash.replace(
      '#/',
      ''
    );

  const pages: Page[] = [
    'home',
    'search',
    'playlists',
    'downloads',
    'history',
    'settings'
  ];

  return pages.includes(
    hash as Page
  )
    ? (hash as Page)
    : 'home';
}

export default function App() {
  const [page, setPage] =
    useState<Page>(
      getInitialPage()
    );

  const [searchQuery, setSearchQuery] =
    useState('');

  const [settings, setSettings] =
    useState<AppSettings>(
      getSettings()
    );

  const [toast, setToast] =
    useState<{
      message: string;
      type: ToastType;
    } | null>(null);

  const [
    selectedPlaylistId,
    setSelectedPlaylistId
  ] = useState<string | null>(null);

  const spotify = useSpotify();

  const downloads =
    useDownloads();

  const player =
    useAudioPlayer();

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info'
    ) => {
      setToast({
        message,
        type
      });

      window.setTimeout(() => {
        setToast(null);
      }, 4200);
    },
    []
  );

  useEffect(() => {
    const applyTheme = () => {
      const appearance =
        settings.appearance;

      const systemDark =
        window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;

      const dark =
        appearance === 'dark' ||
        (appearance === 'system' &&
          systemDark);

      document.documentElement.dataset.theme =
        dark ? 'dark' : 'light';
    };

    applyTheme();
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!isSpotifyConfigured()) {
      return;
    }

    const runCallback = async () => {
      if (
        window.location.search.includes(
          'code='
        )
      ) {
        const handled =
          await spotify.handleCallback();

        if (handled) {
          showToast(
            'Spotify connected.',
            'success'
          );
        }
      }
    };

    void runCallback();
  }, [
    showToast,
    spotify
  ]);

  const navigate = useCallback(
    (next: Page) => {
      setPage(next);

      window.location.hash =
        `/${next}`;

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    },
    []
  );

  const handleSearch = useCallback(
    (query: string) => {
      const value =
        query.trim();

      if (!value) {
        return;
      }

      setSearchQuery(value);

      addSearchHistory(value);

      navigate('search');
    },
    [navigate]
  );

  const playTrack = useCallback(
    (track: SpotifyTrack) => {
      if (!track.preview_url) {
        showToast(
          'Audio preview unavailable for this track.',
          'info'
        );

        return;
      }

      const playerTrack: PlayerTrack = {
        id: track.id,
        title: track.name,
        artist: track.artists
          .map(
            (artist) =>
              artist.name
          )
          .join(', '),
        coverUrl:
          track.album.images[0]?.url,
        previewUrl:
          track.preview_url,
        durationMs:
          track.duration_ms
      };

      void player.play(
        playerTrack
      );
    },
    [player, showToast]
  );

  const handleSettings =
    useCallback(
      (next: AppSettings) => {
        setSettings(next);
        saveSettings(next);
      },
      []
    );

  const pageContent =
    useMemo(() => {
      switch (page) {
        case 'home':
          return (
            <Home
              onSearch={
                handleSearch
              }
              onNavigate={(
                next
              ) =>
                navigate(next)
              }
            />
          );

        case 'search':
          return (
            <SearchPage
              initialQuery={
                searchQuery
              }
              onPlay={
                playTrack
              }
              onToast={
                showToast
              }
              onOpenPlaylist={(
                id
              ) => {
                setSelectedPlaylistId(
                  id
                );
                navigate(
                  'playlists'
                );
              }}
            />
          );

        case 'playlists':
          return (
            <Playlists
              onPlay={
                playTrack
              }
              onToast={
                showToast
              }
            />
          );

        case 'downloads':
          return (
            <Downloads
              items={
                downloads.items
              }
              onStart={
                downloads.start
              }
              onCancel={
                downloads.cancel
              }
              onClearCompleted={
                downloads.clearCompleted
              }
            />
          );

        case 'history':
          return <History />;

        case 'settings':
          return (
            <Settings
              settings={
                settings
              }
              onChange={
                handleSettings
              }
              connected={
                spotify.connected
              }
              onDisconnect={() => {
                spotify.disconnect();

                showToast(
                  'Spotify disconnected.',
                  'success'
                );
              }}
            />
          );

        default:
          return null;
      }
    }, [
      downloads.cancel,
      downloads.clearCompleted,
      downloads.items,
      downloads.start,
      handleSearch,
      handleSettings,
      navigate,
      page,
      playTrack,
      searchQuery,
      settings,
      showToast,
      spotify.connected,
      spotify.disconnect
    ]);

  useEffect(() => {
    if (
      selectedPlaylistId &&
      page === 'playlists'
    ) {
      // Playlist import is intentionally
      // initiated by the user from the
      // playlist URL field.
    }
  }, [
    page,
    selectedPlaylistId
  ]);

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        onNavigate={navigate}
      />

      <main className="main-content">
        <TopBar
          profile={
            spotify.profile
          }
          connected={
            spotify.connected
          }
          onConnect={() => {
            void spotify.connect();
          }}
          onDisconnect={() => {
            spotify.disconnect();

            showToast(
              'Spotify disconnected.',
              'success'
            );
          }}
        />

        {!isSpotifyConfigured() && (
          <div className="config-banner">
            <strong>
              Spotify is not configured.
            </strong>

            <span>
              Add VITE_SPOTIFY_CLIENT_ID to
              your GitHub Pages build
              environment or .env.local
              before connecting Spotify.
            </span>
          </div>
        )}

        {pageContent}
      </main>

      <AudioPlayer
        track={
          player.track
        }
        playing={
          player.playing
        }
        currentTime={
          player.currentTime
        }
        duration={
          player.duration
        }
        volume={
          player.volume
        }
        onToggle={() => {
          void player.toggle();
        }}
        onSeek={
          player.seek
        }
        onVolume={
          player.setVolume
        }
        onClose={
          player.stop
        }
      />

      {toast && (
        <div className="toast-container">
          <Toast
            message={
              toast.message
            }
            type={
              toast.type
            }
            onClose={() =>
              setToast(null)
            }
          />
        </div>
      )}
    </div>
  );
}