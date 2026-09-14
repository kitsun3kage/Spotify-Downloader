import {
  Download,
  ExternalLink,
  Play
} from 'lucide-react';

import type { SpotifyTrack } from '../types/spotify';

interface TrackCardProps {
  track: SpotifyTrack;
  onPlay: (track: SpotifyTrack) => void;
  onDownloadUnavailable: () => void;
}

export function TrackCard({
  track,
  onPlay,
  onDownloadUnavailable
}: TrackCardProps) {
  const cover =
    track.album.images[0]?.url;

  const artists =
    track.artists
      .map((artist) => artist.name)
      .join(', ');

  return (
    <article className="track-card">
      <div className="track-cover">
        {cover ? (
          <img
            src={cover}
            alt=""
          />
        ) : (
          <div className="cover-placeholder">
            <Play size={22} />
          </div>
        )}

        {track.preview_url && (
          <button
            className="cover-play"
            type="button"
            onClick={() => onPlay(track)}
            aria-label={`Play ${track.name}`}
          >
            <Play size={18} fill="currentColor" />
          </button>
        )}
      </div>

      <div className="track-main">
        <strong title={track.name}>
          {track.name}
        </strong>

        <span title={artists}>
          {artists}
        </span>

        <small>
          {track.album.name}
        </small>
      </div>

      <div className="track-actions">
        <button
          className="icon-button"
          type="button"
          title="Download unavailable for Spotify content"
          onClick={onDownloadUnavailable}
        >
          <Download size={18} />
        </button>

        {track.external_urls?.spotify && (
          <a
            className="icon-button"
            href={track.external_urls.spotify}
            target="_blank"
            rel="noreferrer"
            title="Open in Spotify"
          >
            <ExternalLink size={17} />
          </a>
        )}
      </div>
    </article>
  );
}