import {
  Clock3,
  Search,
  Trash2
} from 'lucide-react';

import {
  useState
} from 'react';

import {
  clearDownloadHistory,
  clearSearchHistory,
  getDownloadHistory,
  getSearchHistory
} from '../services/storage';

export function History() {
  const [searchHistory, setSearchHistory] =
    useState(getSearchHistory());

  const [
    downloadHistory,
    setDownloadHistory
  ] = useState(
    getDownloadHistory()
  );

  const clearSearch = () => {
    clearSearchHistory();
    setSearchHistory([]);
  };

  const clearDownloads = () => {
    clearDownloadHistory();
    setDownloadHistory([]);
  };

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <span className="section-kicker">
            ACTIVITY
          </span>
          <h2>History</h2>
        </div>
      </div>

      <div className="history-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                SEARCH
              </span>
              <h2>Search History</h2>
            </div>

            <button
              className="icon-button"
              type="button"
              onClick={clearSearch}
              title="Clear search history"
            >
              <Trash2 size={17} />
            </button>
          </div>

          {searchHistory.length === 0 ? (
            <div className="empty-state compact">
              <Search size={24} />
              <span>
                No searches yet.
              </span>
            </div>
          ) : (
            <div className="history-list">
              {searchHistory.map(
                (item) => (
                  <div
                    className="history-item"
                    key={item.id}
                  >
                    <Search size={16} />
                    <span>
                      {item.query}
                    </span>
                    <small>
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </small>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="section-kicker">
                DOWNLOADS
              </span>
              <h2>
                Download History
              </h2>
            </div>

            <button
              className="icon-button"
              type="button"
              onClick={clearDownloads}
              title="Clear download history"
            >
              <Trash2 size={17} />
            </button>
          </div>

          {downloadHistory.length === 0 ? (
            <div className="empty-state compact">
              <Clock3 size={24} />
              <span>
                No download history yet.
              </span>
            </div>
          ) : (
            <div className="history-list">
              {downloadHistory.map(
                (item) => (
                  <div
                    className="history-item"
                    key={`${item.id}-${item.createdAt}`}
                  >
                    <Clock3 size={16} />

                    <div>
                      <strong>
                        {item.title}
                      </strong>
                      <span>
                        {item.artist}
                      </span>
                    </div>

                    <small>
                      {item.status}
                    </small>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}