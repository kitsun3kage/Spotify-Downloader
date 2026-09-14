import {
  Clock3,
  Download,
  History,
  Home,
  ListMusic,
  Settings,
  Search,
  Music2
} from 'lucide-react';

import type { Page } from '../types/app';

interface SidebarProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

const navigation: Array<{
  id: Page;
  label: string;
  icon: typeof Home;
}> = [
  {
    id: 'home',
    label: 'Home',
    icon: Home
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search
  },
  {
    id: 'playlists',
    label: 'Playlists',
    icon: ListMusic
  },
  {
    id: 'downloads',
    label: 'Downloads',
    icon: Download
  },
  {
    id: 'history',
    label: 'History',
    icon: History
  }
];

export function Sidebar({
  page,
  onNavigate
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <button
        className="brand"
        onClick={() => onNavigate('home')}
        type="button"
      >
        <span className="brand-mark">
          <Music2 size={18} />
        </span>

        <span>
          <strong>Spotify</strong>
          <small>Downloader</small>
        </span>
      </button>

      <nav className="sidebar-nav">
        <p className="nav-label">
          Library
        </p>

        {navigation.map(
          ({
            id,
            label,
            icon: Icon
          }) => (
            <button
              key={id}
              className={
                page === id
                  ? 'nav-item active'
                  : 'nav-item'
              }
              type="button"
              onClick={() =>
                onNavigate(id)
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          )
        )}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={
            page === 'settings'
              ? 'nav-item active'
              : 'nav-item'
          }
          type="button"
          onClick={() =>
            onNavigate('settings')
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>

        <div className="sidebar-note">
          <Clock3 size={15} />
          <span>
            Spotify metadata only.
            <br />
            Legal downloads supported.
          </span>
        </div>
      </div>
    </aside>
  );
}