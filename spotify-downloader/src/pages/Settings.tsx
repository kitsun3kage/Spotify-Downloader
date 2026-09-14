import {
  Check,
  LogOut,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';

import type {
  AppSettings
} from '../types/app';

interface SettingsProps {
  settings: AppSettings;
  onChange: (
    settings: AppSettings
  ) => void;
  connected: boolean;
  onDisconnect: () => void;
}

export function Settings({
  settings,
  onChange,
  connected,
  onDisconnect
}: SettingsProps) {
  const update = (
    patch: Partial<AppSettings>
  ) => {
    onChange({
      ...settings,
      ...patch
    });
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            PREFERENCES
          </span>
          <h2>Settings</h2>
        </div>
      </div>

      <div className="settings-stack">
        <section className="settings-section">
          <div>
            <span className="section-kicker">
              APPEARANCE
            </span>
            <h3>Theme</h3>
            <p>
              Choose how Spotify Downloader
              looks.
            </p>
          </div>

          <div className="appearance-grid">
            <button
              className={
                settings.appearance ===
                'dark'
                  ? 'appearance-option selected'
                  : 'appearance-option'
              }
              type="button"
              onClick={() =>
                update({
                  appearance: 'dark'
                })
              }
            >
              <Moon size={20} />
              <span>Dark</span>
              {settings.appearance ===
                'dark' && (
                <Check size={16} />
              )}
            </button>

            <button
              className={
                settings.appearance ===
                'light'
                  ? 'appearance-option selected'
                  : 'appearance-option'
              }
              type="button"
              onClick={() =>
                update({
                  appearance: 'light'
                })
              }
            >
              <Sun size={20} />
              <span>Light</span>
              {settings.appearance ===
                'light' && (
                <Check size={16} />
              )}
            </button>

            <button
              className={
                settings.appearance ===
                'system'
                  ? 'appearance-option selected'
                  : 'appearance-option'
              }
              type="button"
              onClick={() =>
                update({
                  appearance: 'system'
                })
              }
            >
              <Monitor size={20} />
              <span>System</span>
              {settings.appearance ===
                'system' && (
                <Check size={16} />
              )}
            </button>
          </div>
        </section>

        <section className="settings-section">
          <div>
            <span className="section-kicker">
              DOWNLOADS
            </span>
            <h3>Download preferences</h3>
          </div>

          <label className="setting-row">
            <span>
              <strong>
                Default format
              </strong>
              <small>
                Used for legal direct files.
              </small>
            </span>

            <select
              value={settings.downloadFormat}
              onChange={(event) =>
                update({
                  downloadFormat:
                    event.target
                      .value as AppSettings['downloadFormat']
                })
              }
            >
              <option value="original">
                Original
              </option>
              <option value="mp3">
                MP3
              </option>
              <option value="wav">
                WAV
              </option>
            </select>
          </label>

          <label className="setting-row">
            <span>
              <strong>
                Concurrent downloads
              </strong>
              <small>
                Maximum simultaneous jobs.
              </small>
            </span>

            <select
              value={
                settings.concurrentDownloads
              }
              onChange={(event) =>
                update({
                  concurrentDownloads:
                    Number(
                      event.target.value
                    )
                })
              }
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </label>

          <label className="toggle-row">
            <span>
              <strong>
                Auto start downloads
              </strong>
              <small>
                Start new queue items
                automatically.
              </small>
            </span>

            <input
              type="checkbox"
              checked={
                settings.autoStartDownloads
              }
              onChange={(event) =>
                update({
                  autoStartDownloads:
                    event.target.checked
                })
              }
            />
          </label>
        </section>

        <section className="settings-section">
          <div>
            <span className="section-kicker">
              PLAYER
            </span>
            <h3>Audio player</h3>
          </div>

          <label className="toggle-row">
            <span>
              <strong>Autoplay</strong>
              <small>
                Automatically start previews.
              </small>
            </span>

            <input
              type="checkbox"
              checked={
                settings.autoplay
              }
              onChange={(event) =>
                update({
                  autoplay:
                    event.target.checked
                })
              }
            />
          </label>

          <label className="setting-row">
            <span>
              <strong>Volume</strong>
              <small>
                Default preview volume.
              </small>
            </span>

            <input
              className="volume-setting"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.volume}
              onChange={(event) =>
                update({
                  volume:
                    Number(
                      event.target.value
                    )
                })
              }
            />
          </label>

          <label className="toggle-row">
            <span>
              <strong>
                Remember position
              </strong>
              <small>
                Remember preview playback
                position.
              </small>
            </span>

            <input
              type="checkbox"
              checked={
                settings.rememberPosition
              }
              onChange={(event) =>
                update({
                  rememberPosition:
                    event.target.checked
                })
              }
            />
          </label>
        </section>

        {connected && (
          <section className="settings-section danger-section">
            <div>
              <span className="section-kicker">
                ACCOUNT
              </span>
              <h3>Spotify connection</h3>
              <p>
                Remove the current Spotify
                session from this browser.
              </p>
            </div>

            <button
              className="button danger"
              type="button"
              onClick={onDisconnect}
            >
              <LogOut size={17} />
              Disconnect Spotify
            </button>
          </section>
        )}
      </div>
    </div>
  );
}