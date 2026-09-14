import {
  Disc3,
  ListMusic,
  Music2,
  UserRound
} from 'lucide-react';

import { useState } from 'react';

import {
  searchSpotify,
  type SearchResult
} from '../services/spotify';

import type {
  SpotifyTrack
} from '../types/spotify';

import { SearchBar } from '../components/SearchBar';
import { TrackList } from '../components/TrackList';
import { PlaylistCard } from '../components/PlaylistCard';

interface SearchPageProps {
  initialQuery: string;
  onPlay: (track: SpotifyTrack) => void;
  onToast: (
    message: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
  onOpenPlaylist: (
    playlistId: string
  ) => void;
}

export function SearchPage({
  initialQuery,
  onPlay,
  onToast,
  onOpenPlaylist
}: SearchPageProps) {
  const [query, setQuery] =
    useState(initialQuery);

  const [results, setResults] =
    useState<SearchResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const submit = async (
    value: string
  ) => {
    const next = value.trim();

    if (!next) {
      return;
    }

    setQuery(next);
    setLoading(true);

    try {
      const data =
        await searchSpotify(next);

      setResults(data);
    } catch (cause) {
      onToast(
        cause instanceof Error
          ? cause.message
          : 'Search failed.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            DISCOVER
          </span>
          <h2>Search</h2>
        </div>
      </div>

      <SearchBar
        initialValue={query}
        onSearch={submit}
      />

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          Searching Spotify...
        </div>
      ) : results ? (
        <div className="search-results">
          <section>
            <div className="result-heading">
              <Music2 size={18} />
              <h3>Tracks</h3>
              <span>
                {results.tracks.length}
              </span>
            </div>

            <TrackList
              tracks={results.tracks}
              onPlay={onPlay}
              onDownloadUnavailable={() =>
                onToast(
                  'Download unavailable for Spotify content.',
                  'info'
                )
              }
            />
          </section>

          <section>
            <div className="result-heading">
              <ListMusic size={18} />
              <h3>Playlists</h3>
              <span>
                {results.playlists.length}
              </span>
            </div>

            <div className="playlist-grid">
              {results.playlists.map(
                (playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onOpen={(item) =>
                      onOpenPlaylist(
                        item.id
                      )
                    }
                  />
                )
              )}
            </div>
          </section>

          <section>
            <div className="result-heading">
              <UserRound size={18} />
              <h3>Artists</h3>
              <span>
                {results.artists.length}
              </span>
            </div>

            <div className="artist-grid">
              {results.artists.map(
                (artist) => (
                  <a
                    className="artist-card"
                    key={artist.id}
                    href={
                      artist.external_urls
                        ?.spotify
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <UserRound size={22} />
                    <strong>
                      {artist.name}
                    </strong>
                  </a>
                )
              )}
            </div>
          </section>

          <section>
            <div className="result-heading">
              <Disc3 size={18} />
              <h3>Albums</h3>
              <span>
                {results.albums.length}
              </span>
            </div>

            <div className="album-grid">
              {results.albums.map(
                (album) => (
                  <a
                    className="album-card"
                    key={album.id}
                    href={
                      album.external_urls
                        ?.spotify
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {album.images[0]?.url ? (
                      <img
                        src={
                          album.images[0].url
                        }
                        alt=""
                      />
                    ) : (
                      <div className="cover-placeholder">
                        <Disc3 size={22} />
                      </div>
                    )}

                    <strong>
                      {album.name}
                    </strong>

                    <span>
                      {album.artists
                        .map(
                          (artist) =>
                            artist.name
                        )
                        .join(', ')}
                    </span>
                  </a>
                )
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="empty-state large">
          <Search size={36} />
          <strong>
            Search Spotify
          </strong>
          <span>
            Enter a song, artist, album or
            playlist and press Enter.
          </span>
        </div>
      )}
    </div>
  );
}