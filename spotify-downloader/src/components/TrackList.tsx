import type { SpotifyTrack } from '../types/spotify';
import { TrackCard } from './TrackCard';

interface TrackListProps {
  tracks: SpotifyTrack[];
  onPlay: (track: SpotifyTrack) => void;
  onDownloadUnavailable: () => void;
}

export function TrackList({
  tracks,
  onPlay,
  onDownloadUnavailable
}: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="empty-state compact">
        <p>No tracks found.</p>
      </div>
    );
  }

  return (
    <div className="track-list">
      {tracks.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          onPlay={onPlay}
          onDownloadUnavailable={
            onDownloadUnavailable
          }
        />
      ))}
    </div>
  );
}