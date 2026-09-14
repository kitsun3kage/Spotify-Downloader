import {
  Search as SearchIcon,
  X
} from 'lucide-react';

import {
  useState
} from 'react';

interface SearchBarProps {
  initialValue?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({
  initialValue = '',
  placeholder = 'Search for songs, artists, albums or playlists...',
  onSearch
}: SearchBarProps) {
  const [value, setValue] =
    useState(initialValue);

  const submit = () => {
    const query = value.trim();

    if (!query) {
      return;
    }

    onSearch(query);
  };

  return (
    <div className="search-bar">
      <SearchIcon size={20} />

      <input
        value={value}
        onChange={(event) =>
          setValue(event.target.value)
        }
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            submit();
          }
        }}
        placeholder={placeholder}
        aria-label="Search"
      />

      {value && (
        <button
          className="icon-button"
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
        >
          <X size={17} />
        </button>
      )}

      <button
        className="search-submit"
        type="button"
        onClick={submit}
      >
        Search
      </button>
    </div>
  );
}