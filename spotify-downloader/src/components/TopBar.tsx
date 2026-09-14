import {
  LogIn,
  LogOut,
  UserCircle2
} from 'lucide-react';

import type { SpotifyProfile } from '../types/spotify';

interface TopBarProps {
  profile: SpotifyProfile | null;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function TopBar({
  profile,
  connected,
  onConnect,
  onDisconnect
}: TopBarProps) {
  return (
    <header className="topbar">
      <div>
        <span className="topbar-eyebrow">
          MUSIC LIBRARY
        </span>
        <h1>
          Your music, your way.
        </h1>
      </div>

      {connected && profile ? (
        <button
          className="profile-button"
          type="button"
          onClick={onDisconnect}
        >
          {profile.images?.[0]?.url ? (
            <img
              src={profile.images[0].url}
              alt=""
            />
          ) : (
            <UserCircle2 size={20} />
          )}

          <span>
            {profile.display_name ??
              profile.id}
          </span>

          <LogOut size={16} />
        </button>
      ) : (
        <button
          className="button primary"
          type="button"
          onClick={onConnect}
        >
          <LogIn size={17} />
          Connect Spotify
        </button>
      )}
    </header>
  );
}