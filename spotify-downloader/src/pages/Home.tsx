import {
  ArrowRight,
  Download,
  Music2,
  Search,
  ShieldCheck
} from 'lucide-react';

import { SearchBar } from '../components/SearchBar';

interface HomeProps {
  onSearch: (query: string) => void;
  onNavigate: (
    page:
      | 'search'
      | 'downloads'
      | 'playlists'
  ) => void;
}

export function Home({
  onSearch,
  onNavigate
}: HomeProps) {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-kicker">
            SPOTIFY DOWNLOADER
          </span>

          <h2>
            Find your music.
            <br />
            Manage it beautifully.
          </h2>

          <p>
            Search Spotify, explore your
            playlists and manage legal local
            downloads from one clean workspace.
          </p>

          <SearchBar
            onSearch={onSearch}
          />

          <div className="hero-actions">
            <button
              className="button primary"
              type="button"
              onClick={() =>
                onNavigate('search')
              }
            >
              <Search size={17} />
              Search Spotify
            </button>

            <button
              className="button ghost"
              type="button"
              onClick={() =>
                onNavigate('downloads')
              }
            >
              <Download size={17} />
              Downloads
            </button>
          </div>
        </div>

        <div className="hero-orb">
          <div className="orb-ring ring-one" />
          <div className="orb-ring ring-two" />
          <div className="orb-core">
            <Music2 size={42} />
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <Search size={22} />
          <h3>Spotify Search</h3>
          <p>
            Search tracks, artists, albums
            and playlists through the official
            Spotify Web API.
          </p>
          <button
            type="button"
            onClick={() =>
              onNavigate('search')
            }
          >
            Explore
            <ArrowRight size={15} />
          </button>
        </article>

        <article className="feature-card">
          <ShieldCheck size={22} />
          <h3>Privacy first</h3>
          <p>
            PKCE authentication keeps your
            Spotify client secret out of the
            browser.
          </p>
        </article>

        <article className="feature-card">
          <Download size={22} />
          <h3>Legal downloads</h3>
          <p>
            Spotify audio itself is never
            ripped. The download manager is
            designed for legal direct files.
          </p>
        </article>
      </section>
    </div>
  );
}