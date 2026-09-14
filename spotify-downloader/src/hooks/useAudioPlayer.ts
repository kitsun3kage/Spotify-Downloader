import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

export interface PlayerTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  previewUrl: string;
  durationMs?: number;
}

export function useAudioPlayer() {
  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const [track, setTrack] =
    useState<PlayerTrack | null>(null);

  const [playing, setPlaying] =
    useState(false);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [duration, setDuration] =
    useState(0);

  const [volume, setVolume] =
    useState(0.8);

  useEffect(() => {
    const audio =
      new Audio();

    audio.preload = 'metadata';
    audio.volume = volume;

    audioRef.current = audio;

    const updateTime = () =>
      setCurrentTime(audio.currentTime);

    const updateDuration = () =>
      setDuration(audio.duration || 0);

    const ended = () =>
      setPlaying(false);

    audio.addEventListener(
      'timeupdate',
      updateTime
    );

    audio.addEventListener(
      'loadedmetadata',
      updateDuration
    );

    audio.addEventListener(
      'ended',
      ended
    );

    return () => {
      audio.pause();

      audio.removeEventListener(
        'timeupdate',
        updateTime
      );

      audio.removeEventListener(
        'loadedmetadata',
        updateDuration
      );

      audio.removeEventListener(
        'ended',
        ended
      );

      audio.src = '';
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback(
    async (nextTrack?: PlayerTrack) => {
      const audio = audioRef.current;

      if (!audio) {
        return;
      }

      if (
        nextTrack &&
        (!track ||
          nextTrack.id !== track.id)
      ) {
        setTrack(nextTrack);
        setCurrentTime(0);

        audio.src =
          nextTrack.previewUrl;

        audio.load();
      }

      await audio.play();

      setPlaying(true);
    },
    [track]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(async () => {
    if (!audioRef.current) {
      return;
    }

    if (playing) {
      pause();
    } else {
      await play();
    }
  }, [pause, play, playing]);

  const seek = useCallback(
    (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime =
          time;
        setCurrentTime(time);
      }
    },
    []
  );

  const stop = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;

    setPlaying(false);
    setCurrentTime(0);
  }, []);

  return {
    track,
    playing,
    currentTime,
    duration,
    volume,
    setVolume,
    play,
    pause,
    toggle,
    seek,
    stop
  };
}