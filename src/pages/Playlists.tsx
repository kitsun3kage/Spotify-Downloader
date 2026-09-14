import {
  ClipboardPaste,
  Download,
  ExternalLink,
  ListMusic,
  LoaderCircle,
  Music2
} from 'lucide-react';

import {
  useEffect,
  useState
} from 'react';

import {
  extractPlaylistId,
  getPlaylist,
  getPlaylistItems
} from '../services/spotify';

import type {
  SpotifyPlaylist,
  SpotifyPlaylistItem,
  SpotifyTrack
} from '../types/spotify';

interface PlaylistsProps {
  onPlay: (track: SpotifyTrack) => void;
  onToast: (
    message: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
}

export function Playlists({
  onPlay,
  onToast
}: PlaylistsProps) {
  const [url, setUrl] =
    useState('');

  const [playlist, setPlaylist] =
    useState<SpotifyPlaylist | null>(
      null
    );

  const [items, setItems] =
    useState<SpotifyPlaylistItem[]>(
      []
    );

  const [loading, setLoading] =
    useState(false);

  const importPlaylist = async () => {
    const id =
      extractPlaylistId(url);

    if (!id) {
      onToast(
        'Invalid Spotify playlist URL.',
        'error'
      );
      return;
    }

    setLoading(true);

    try {
      const [playlistData, playlistItems] =
        await Promise.all([
          getPlaylist(id),
          getPlaylistItems(id)
        ]);

      setPlaylist(playlistData);
      setItems(playlistItems);

      onToast(
        'Playlist imported.',
        'success'
      );
    } catch (cause) {
      onToast(
        cause instanceof Error
          ? cause.message
          : 'Could not import playlist.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const exportPlaylist = () => {
    if (!playlist) {
      return;
    }

    const rows = [
      [
        'Title',
        'Artists',
        'Album',
        'Spotify URL'
      ],
      ...items
        .map((entry) => entry.item)
        .filter(
          (
            track
          ): track is SpotifyTrack =>
            track !== null
        )
        .map((track) => [
          track.name,
          track.artists
            .map(
              (artist) =>
                artist.name
            )
            .join(', '),
          track.album.name,
          track.external_urls
            ?.spotify ?? ''
        ])
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
      [csv],
      {
        type: 'text/csv;charset=utf-8'
      }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = url;
    anchor.download =
      `${playlist.name
        .replace(/[^\w\s-]/g, '')
        .trim() || 'playlist'}.csv`;

    anchor.click();

    URL.revokeObjectURL(url);

    onToast(
      'Playlist exported.',
      'success'
    );
  };

  useEffect(() => {
    if (!playlist) {
      return;
    }

    document.title =
      `${playlist.name} · Spotify Downloader`;

    return () => {
      document.title =
        'Spotify Downloader';
    };
  }, [playlist]);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            LIBRARY
          </span>
          <h2>Playlists</h2>
        </div>
      </div>

      <section className="panel import-panel">
        <div className="panel-icon">
          <ClipboardPaste size={21} />
        </div>

        <div className="panel-content">
          <h3>
            Import a Spotify playlist
          </h3>

          <p>
            Paste a Spotify playlist URL
            to inspect its metadata and
            track list.
          </p>

          <div className="url-input-row">
            <input
              className="text-input"
              value={url}
              onChange={(event) =>
                setUrl(
                  event.target.value
                )
              }
              placeholder="https://open.spotify.com/playlist/..."
            />

            <button
              className="button primary"
              type="button"
              onClick={importPlaylist}
              disabled={loading}
            >
              {loading ? (
                <LoaderCircle
                  size={17}
                  className="spin"
                />
              ) : (
                <ListMusic size={17} />
              )}
              Import
            </button>
          </div>
        </div>
      </section>

      {playlist && (
        <section className="playlist-detail">
          <div className="playlist-hero">
            <div className="playlist-large-cover">
              {playlist.images[0]?.url ? (
                <img
                  src={
                    playlist.images[0].url
                  }
                  alt=""
                />
              ) : (
                <ListMusic size={42} />
              )}
            </div>

            <div className="playlist-detail-info">
              <span>
                PLAYLIST
              </span>

              <h3>
                {playlist.name}
              </h3>

              <p>
                {playlist.description ||
                  'No description available.'}
              </p>

              <small>
                {playlist.owner
                  ?.display_name ??
                  'Spotify'}{' '}
                · {items.length} tracks
              </small>

              <div className="hero-actions">
                <button
                  className="button primary"
                  type="button"
                  onClick={
                    exportPlaylist
                  }
                >
                  <Download size={17} />
                  Export Playlist
                </button>

                {playlist
                  .external_urls
                  ?.spotify && (
                  <a
                    className="button ghost"
                    href={
                      playlist
                        .external_urls
                        .spotify
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={17} />
                    Open Spotify
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <span className="section-kicker">
                  TRACKLIST
                </span>
                <h2>
                  {items.length} tracks
                </h2>
              </div>
            </div>

            <div className="playlist-track-list">
              {items.map(
                (entry, index) => {
                  const track =
                    entry.item;

                  if (!track) {
                    return (
                      <div
                        className="unavailable-track"
                        key={`missing-${index}`}
                      >
                        <Music2 size={18} />
                        <span>
                          Unavailable track
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      className="playlist-track"
                      type="button"
                      key={`${track.id}-${index}`}
                      onClick={() =>
                        track.preview_url &&
                        onPlay(track)
                      }
                    >
                      <span className="track-number">
                        {index + 1}
                      </span>

                      {track.album
                        .images[2]
                        ?.url && (
                        <img
                          src={
                            track.album
                              .images[2]
                              .url
                          }
                          alt=""
                        />
                      )}

                      <span className="playlist-track-text">
                        <strong>
                          {track.name}
                        </strong>
                        <small>
                          {track.artists
                            .map(
                              (
                                artist
                              ) =>
                                artist.name
                            )
                            .join(
                              ', '
                            )}
                        </small>
                      </span>

                      <span className="track-duration">
                        {Math.floor(
                          track.duration_ms /
                            60000
                        )}
                        :
                        {Math.floor(
                          (track.duration_ms %
                            60000) /
                            1000
                        )
                          .toString()
                          .padStart(
                            2,
                            '0'
                          )}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}