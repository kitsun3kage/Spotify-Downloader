import {
  Pause,
  Play,
  Volume2,
  X
} from 'lucide-react';

import type {
  PlayerTrack
} from '../hooks/useAudioPlayer';

interface AudioPlayerProps {
  track: PlayerTrack | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onToggle: () => void;
  onSeek: (time: number) => void;
  onVolume: (volume: number) => void;
  onClose: () => void;
}

function formatTime(
  seconds: number
): string {
  if (!Number.isFinite(seconds)) {
    return '0:00';
  }

  const minutes =
    Math.floor(seconds / 60);

  const remaining =
    Math.floor(seconds % 60);

  return `${minutes}:${remaining
    .toString()
    .padStart(2, '0')}`;
}

export function AudioPlayer({
  track,
  playing,
  currentTime,
  duration,
  volume,
  onToggle,
  onSeek,
  onVolume,
  onClose
}: AudioPlayerProps) {
  if (!track) {
    return null;
  }

  return (
    <div className="audio-player">
      <div className="player-track">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt=""
          />
        ) : (
          <div className="player-placeholder">
            <Play size={17} />
          </div>
        )}

        <div>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
      </div>

      <div className="player-controls">
        <button
          className="player-play"
          type="button"
          onClick={onToggle}
          aria-label={
            playing ? 'Pause' : 'Play'
          }
        >
          {playing ? (
            <Pause
              size={18}
              fill="currentColor"
            />
          ) : (
            <Play
              size={18}
              fill="currentColor"
            />
          )}
        </button>

        <div className="player-progress">
          <span>
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 1}
            value={Math.min(
              currentTime,
              duration || 1
            )}
            onChange={(event) =>
              onSeek(
                Number(event.target.value)
              )
            }
            aria-label="Playback position"
          />

          <span>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="player-volume">
        <Volume2 size={17} />

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) =>
            onVolume(
              Number(event.target.value)
            )
          }
          aria-label="Volume"
        />

        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Close player"
        >
          <X size={17} />
        </button>
      </div>
    </div>
  );
}