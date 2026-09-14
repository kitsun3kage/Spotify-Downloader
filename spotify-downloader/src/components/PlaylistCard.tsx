import {
  ExternalLink,
  ListMusic
} from 'lucide-react';

import type {
  SpotifyPlaylist
} from '../types/spotify';

interface PlaylistCardProps {
  playlist: SpotifyPlaylist;
  onOpen: (
    playlist: SpotifyPlaylist
  ) => void;
}

export function PlaylistCard({
  playlist,
  onOpen
}: PlaylistCardProps) {
  const image =
    playlist.images[0]?.url;

  const total =
    playlist.items?.total ??
    playlist.tracks?.total ??
    0;

  return (
    <article
      className="playlist-card"
      onClick={() => onOpen(playlist)}
    >
      <div className="playlist-image">
        {image ? (
          <img
            src={image}
            alt=""
          />
        ) : (
          <ListMusic size={30} />
        )}
      </div>

      <div className="playlist-info">
        <strong>
          {playlist.name}
        </strong>

        <span>
          {playlist.owner?.display_name ??
            'Spotify'}{' '}
          · {total} tracks
        </span>
      </div>

      {playlist.external_urls?.spotify && (
        <a
          className="icon-button"
          href={
            playlist.external_urls.spotify
          }
          target="_blank"
          rel="noreferrer"
          onClick={(event) =>
            event.stopPropagation()
          }
          aria-label="Open playlist in Spotify"
        >
          <ExternalLink size={17} />
        </a>
      )}
    </article>
  );
}